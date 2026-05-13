// netlify/functions/gemini.js
//
// Server-side Gemini proxy. Keeps GEMINI_API_KEY off the client.
//
// Contract with the browser:
//   POST { prompt: string, type: "company-generator" | "linkedin-post" }
//   →  200 { result: string }
//   →  200 { error: "timeout"     , fallback: true }   ← internal 8s abort
//   →  200 { error: "upstream-fail", fallback: true }  ← Gemini 4xx/5xx
//   →  200 { error: "bad-request" , fallback: true }   ← malformed input
//
// We never return a bare 5xx. The client always gets a structured fallback
// signal so it can render the offline template path without parsing HTTP
// status codes. (See Project Instructions §Gemini Timeout Strategy.)
//
// Model: gemini-2.5-flash-lite. Under 2s typical for the bounded outputs
// we generate (Company Generator Instructions block, LinkedIn post body).
//
// Internal timeout: 8s via AbortController. The Netlify Function itself
// times out at 10s on the free tier — the 2s headroom is deliberate.

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const INTERNAL_TIMEOUT_MS = 8000;

// ─── Generation config per request type ─────────────────────────────────────
// Bounded output so a runaway prompt cannot blow through the time budget.
const GENERATION_CONFIG = {
  "company-generator": {
    temperature: 0.4,
    maxOutputTokens: 1200,
    topP: 0.95,
  },
  "linkedin-post": {
    temperature: 0.7,
    maxOutputTokens: 600,
    topP: 0.95,
  },
  // Batch enhancement of all scheduled LinkedIn posts for one step in a
  // single Gemini call. Larger token budget to fit N posts (~200-400 tokens
  // each) plus delimiter markers. Used by src/utils/geminiClient.js with
  // type "linkedin-batch". Higher temperature than company-generator —
  // post writing benefits from creative variance; deterministic
  // instruction-filling would produce wooden output.
  "linkedin-batch": {
    temperature: 0.7,
    maxOutputTokens: 2400,
    topP: 0.95,
  },
};

// ─── Fallback envelope ──────────────────────────────────────────────────────
// One place to build the structured fallback so the shape is identical
// across every failure mode. Client checks `fallback === true`.
function fallback(reason, status = 200) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: reason, fallback: true }),
  };
}

// ─── Handler ────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  // Method gate.
  if (event.httpMethod !== "POST") {
    return fallback("method-not-allowed", 405);
  }

  // API key presence.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[gemini] GEMINI_API_KEY missing from environment");
    return fallback("server-misconfig");
  }

  // Parse + validate body.
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("[gemini] body parse failed:", err.message);
    return fallback("bad-request");
  }

  const { prompt, type } = payload;
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return fallback("bad-request");
  }
  if (!GENERATION_CONFIG[type]) {
    return fallback("bad-request");
  }
  // Hard ceiling so a misbehaving client can't push us past the function budget.
  if (prompt.length > 30000) {
    return fallback("bad-request");
  }

  // Build Gemini request.
  const config = GENERATION_CONFIG[type];
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: config,
  };

  // AbortController is the real timeout — terminates the network connection.
  // Without this, the upstream fetch keeps running until Gemini's own death.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), INTERNAL_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Gemini upstream returned 4xx/5xx. Don't leak the body to the client.
      const errText = await response.text().catch(() => "");
      console.error(
        `[gemini] upstream ${response.status}:`,
        errText.slice(0, 500),
      );
      return fallback("upstream-fail");
    }

    const data = await response.json();
    const result = extractText(data);

    if (!result || result.trim().length === 0) {
      console.error("[gemini] empty result from upstream");
      return fallback("empty-result");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.warn("[gemini] internal 8s timeout fired");
      return fallback("timeout");
    }
    console.error("[gemini] unexpected error:", err.message);
    return fallback("network-error");
  }
};

// ─── Helpers ────────────────────────────────────────────────────────────────
// Gemini's response shape: { candidates: [{ content: { parts: [{ text }] } }] }
// Walk it defensively — any missing layer returns null and we fall back.
function extractText(data) {
  try {
    const candidate = data?.candidates?.[0];
    if (!candidate) return null;
    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts) || parts.length === 0) return null;
    return parts
      .map((p) => (typeof p.text === "string" ? p.text : ""))
      .join("")
      .trim();
  } catch (err) {
    console.error("[gemini] extractText failed:", err.message);
    return null;
  }
}
