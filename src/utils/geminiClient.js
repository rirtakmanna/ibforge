// src/utils/geminiClient.js
//
// Client-side helper for calling the Gemini Netlify Function.
//
// ATLAS uses Gemini for one purpose in Phase 3: enhancing the body of
// scheduled LinkedIn posts for a completed company-step. CompanyGeneratorPanel
// does NOT use Gemini (Block 5C override 1 — local deterministic fill only).
//
// This module exports a single function, generateBatchPosts, which:
//   1. Builds a prompt asking Gemini to enhance N posts in one shot,
//      separated by ===POST N=== delimiter markers (override 5).
//   2. Sends the prompt to /.netlify/functions/gemini with type "linkedin-batch".
//   3. Parses the delimiter-marked response into an array of { index, content }.
//   4. Increments the per-session counter ONLY on full successful parse
//      (after-success increment — failed/timed-out calls don't count against
//      the 30-call budget).
//
// What this module does NOT own:
//   - In-flight lock + 2s cooldown — those live in the consumer component
//     (LinkedInPosts.jsx) so different consumers can have independent locks.
//   - Retry logic — one attempt per call. Retry = operator clicks again,
//     which the consumer's in-flight lock gates.
//   - DOM access — pure async; testable in isolation.

// ─── Tunables ───────────────────────────────────────────────────────────────

// Client-side abort fires at 8s. The serverless function has its own
// internal 8s AbortController (see netlify/functions/gemini.js). The
// Netlify Function hard limit is 10s on free tier. This client timer
// guards against the function itself hanging.
const CLIENT_TIMEOUT_MS = 8000;

// Per-session call cap. Project Instructions §Gemini Rate Control rule 4.
// One batch call counts as 1 regardless of N posts inside.
const SESSION_CALL_LIMIT = 30;
const SESSION_COUNTER_KEY = "atlas_gemini_call_count";

// Endpoint the serverless function lives at.
const FUNCTION_ENDPOINT = "/.netlify/functions/gemini";

// Delimiter format — must match the prompt instructions below verbatim.
// Captures POST <number> so the parser can verify ordering.
const POST_DELIMITER_RE = /^===POST\s+(\d+)===\s*$/m;
const END_MARKER = "===END===";

// ─── Session counter helpers ────────────────────────────────────────────────

function readSessionCount() {
  try {
    const raw = sessionStorage.getItem(SESSION_COUNTER_KEY);
    if (raw === null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    // sessionStorage unavailable (private browsing edge case) — fail open.
    return 0;
  }
}

function writeSessionCount(n) {
  try {
    sessionStorage.setItem(SESSION_COUNTER_KEY, String(n));
  } catch {
    // Same edge case as above. Counter just doesn't persist this session.
  }
}

/** Exposed so the consumer can render "X of 30 generations used today". */
export function getSessionCallCount() {
  return readSessionCount();
}

/** Exposed so the consumer can render the limit-reached state on first paint. */
export function isSessionLimitReached() {
  return readSessionCount() >= SESSION_CALL_LIMIT;
}

// ─── Prompt builder ─────────────────────────────────────────────────────────
//
// One prompt for the whole batch. Instructions are tight to keep token cost
// down and parsing reliable. Brand voice rules are imported from
// ATLAS_Brand_System.md (senior-analyst tone, no fluff, no excessive emoji).

function buildBatchPrompt({ seedPosts, companyName, stepTitle, qualityBar }) {
  const numbered = seedPosts
    .map(
      (p, i) => `POST ${i + 1} (scheduled day ${p.day}):\n${p.content.trim()}`,
    )
    .join("\n\n---\n\n");

  return `You are rewriting LinkedIn posts for an aspiring investment banking analyst's portfolio.

CONTEXT:
- Company: ${companyName}
- Step: ${stepTitle}
- Quality bar: ${qualityBar || "Senior analyst quality. Specific, grounded, no fluff."}

BRAND VOICE (mandatory):
- Senior-analyst tone. Confident, specific, evidence-based.
- No marketing language. No excessive emoji (one leading marker is fine).
- No filler phrases ("Excited to share", "Honored to", "Humbled by").
- Short paragraphs. Line breaks for rhythm. Concrete numbers > vague claims.
- Hashtags at the end only. 3-5 max. Industry-relevant (#InvestmentBanking #EquityResearch etc.)
- Length: 800-1500 characters per post. Long enough to demonstrate depth.

YOUR TASK:
Below are ${seedPosts.length} draft LinkedIn posts for this step. Rewrite each one so it lands as a polished, grounded post that a hiring IB analyst would respect. Keep the original intent and any specific facts. Improve structure, sharpen claims, add 3-5 hashtags at the end.

OUTPUT FORMAT (mandatory — any deviation breaks parsing):
- For each post, output the marker "===POST N===" on its own line (N = post number), then the rewritten post body, then a blank line.
- After the last post, output "${END_MARKER}" on its own line.
- Do NOT add commentary, preambles, or markdown code fences.
- Do NOT number posts inside the body. The marker is the only numbering.

DRAFT POSTS:

${numbered}

Now output the ${seedPosts.length} rewritten posts in the format specified above. Begin with "===POST 1===".`;
}

// ─── Response parser ────────────────────────────────────────────────────────
//
// Expects the response to look like:
//   ===POST 1===
//   [body of post 1]
//
//   ===POST 2===
//   [body of post 2]
//   ...
//   ===END===
//
// Returns array of { index, content } in 0-based index order, or null on any
// structural mismatch. Caller treats null as "fall back to local content".

function parseBatchResponse(rawText, expectedCount) {
  if (typeof rawText !== "string" || rawText.length === 0) return null;

  // Trim leading/trailing whitespace + any stray markdown fence the model
  // might add despite instructions.
  let text = rawText.trim();
  if (text.startsWith("```")) {
    // Strip opening fence (with or without language tag) and closing fence.
    text = text.replace(/^```[a-zA-Z]*\s*\n?/, "").replace(/```\s*$/, "");
    text = text.trim();
  }

  // Cut at ===END=== if present; anything after is ignored.
  const endIdx = text.indexOf(END_MARKER);
  const body = endIdx === -1 ? text : text.slice(0, endIdx).trim();

  // Split on the POST marker. The first segment before "===POST 1===" should
  // be empty (or whitespace) — if it has content, that's a preamble violation
  // but we tolerate it (just discard).
  const segments = body.split(POST_DELIMITER_RE);
  // After split with capture group, segments look like:
  //   [preamble, "1", post1Body, "2", post2Body, "3", post3Body, ...]
  // So total length = 1 + 2 * N where N = number of posts found.
  if (segments.length < 3) return null;
  if ((segments.length - 1) % 2 !== 0) return null;

  const found = (segments.length - 1) / 2;
  if (found !== expectedCount) return null;

  const enhanced = [];
  for (let i = 0; i < expectedCount; i++) {
    const declaredNum = Number(segments[1 + i * 2]);
    const contentBody = segments[2 + i * 2];

    // Declared post number must match expected 1-based position.
    if (declaredNum !== i + 1) return null;

    const trimmed = typeof contentBody === "string" ? contentBody.trim() : "";
    if (trimmed.length === 0) return null;

    enhanced.push({ index: i, content: trimmed });
  }

  return enhanced;
}

// ─── Single-post prompt builder ─────────────────────────────────────────────
//
// Used by generateSinglePost — regenerates ONE post in isolation.
// Same brand voice rules as the batch builder. The output is the rewritten
// post body directly — no delimiter markers needed since we expect exactly
// one post back.

function buildSinglePrompt({
  seedContent,
  companyName,
  stepTitle,
  qualityBar,
  postType,
}) {
  return `You are rewriting a single LinkedIn post for an aspiring investment banking analyst's portfolio.

CONTEXT:
- Company: ${companyName}
- Step: ${stepTitle}
- Post type: ${postType || "Post"}
- Quality bar: ${qualityBar || "Senior analyst quality. Specific, grounded, no fluff."}

BRAND VOICE (mandatory):
- Senior-analyst tone. Confident, specific, evidence-based.
- No marketing language. No excessive emoji (one leading marker is fine).
- No filler phrases ("Excited to share", "Honored to", "Humbled by").
- Short paragraphs. Line breaks for rhythm. Concrete numbers > vague claims.
- Hashtags at the end only. 3-5 max. Industry-relevant (#InvestmentBanking #EquityResearch etc.)
- Length: 800-1500 characters.

YOUR TASK:
Below is a draft LinkedIn post. Rewrite it so it lands as a polished, grounded post that a hiring IB analyst would respect. Keep the original intent and any specific facts. Improve structure, sharpen claims, add 3-5 hashtags at the end.

OUTPUT FORMAT (mandatory):
- Output the rewritten post body ONLY.
- No preamble. No commentary. No markdown code fences. No "Here is the rewritten post:".
- Do NOT add a "===POST===" marker or any other wrapper.

DRAFT POST:

${seedContent.trim()}

Now output the rewritten post body. Begin immediately with the post content.`;
}

// ─── Single-post response cleaner ───────────────────────────────────────────
//
// Strips any markdown code fence the model may add despite instructions.
// Returns the cleaned text, or null if the result is empty after cleaning.

function cleanSingleResponse(rawText) {
  if (typeof rawText !== "string") return null;
  let text = rawText.trim();
  if (text.length === 0) return null;

  // Strip opening fence (with or without language tag) and closing fence.
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\s*\n?/, "").replace(/```\s*$/, "");
    text = text.trim();
  }

  // Strip a stray "===POST 1===" header if the model leaked the batch
  // format into the single-post response.
  text = text.replace(/^===POST\s+\d+===\s*\n?/, "").trim();

  return text.length > 0 ? text : null;
}

// ─── Main exports ───────────────────────────────────────────────────────────

/**
 * Generates Gemini-enhanced versions of all posts for a step in a single call.
 *
 * @param {object} args
 * @param {Array<{day:number, content:string}>} args.seedPosts
 *   The N posts to enhance. Order is preserved in the result.
 * @param {string} args.companyName
 *   Display name for prompt context.
 * @param {string} args.stepTitle
 *   Step title for prompt context.
 * @param {string} [args.qualityBar]
 *   Optional quality bar from roadmapData.build.qualityBar.
 *
 * @returns {Promise
 *     { ok: true, enhanced: Array<{ index: number, content: string }> }
 *   | { ok: false, useFallback: true, reason: 'limit'|'bad-input'|'timeout'|'network'|'server'|'parse'|'empty' }
 * >}
 *
 * Side effects: increments sessionStorage atlas_gemini_call_count by 1
 * ONLY on full parse success.
 */
export async function generateBatchPosts({
  seedPosts,
  companyName,
  stepTitle,
  qualityBar,
} = {}) {
  // ── Input validation ──
  if (!Array.isArray(seedPosts) || seedPosts.length === 0) {
    return { ok: false, useFallback: true, reason: "bad-input" };
  }
  for (const p of seedPosts) {
    if (
      !p ||
      typeof p.day !== "number" ||
      typeof p.content !== "string" ||
      p.content.trim().length === 0
    ) {
      return { ok: false, useFallback: true, reason: "bad-input" };
    }
  }
  if (typeof companyName !== "string" || companyName.length === 0) {
    return { ok: false, useFallback: true, reason: "bad-input" };
  }
  if (typeof stepTitle !== "string" || stepTitle.length === 0) {
    return { ok: false, useFallback: true, reason: "bad-input" };
  }

  // ── Session counter pre-check (BEFORE network) ──
  if (readSessionCount() >= SESSION_CALL_LIMIT) {
    return { ok: false, useFallback: true, reason: "limit" };
  }

  // ── Build prompt ──
  const prompt = buildBatchPrompt({
    seedPosts,
    companyName,
    stepTitle,
    qualityBar,
  });

  // ── Fire request with AbortController ──
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(FUNCTION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, type: "linkedin-batch" }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err && err.name === "AbortError") {
      return { ok: false, useFallback: true, reason: "timeout" };
    }
    console.error("[geminiClient] network error:", err);
    return { ok: false, useFallback: true, reason: "network" };
  }

  // ── Read response ──
  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    console.error("[geminiClient] response parse failed:", err);
    return { ok: false, useFallback: true, reason: "server" };
  }

  // Server-side function may return { error, fallback: true } on its own
  // failure paths (timeout, upstream-fail, bad-request). Surface as fallback.
  if (payload && payload.fallback === true) {
    return {
      ok: false,
      useFallback: true,
      reason: payload.error === "timeout" ? "timeout" : "server",
    };
  }

  if (!payload || typeof payload.result !== "string") {
    return { ok: false, useFallback: true, reason: "empty" };
  }

  // ── Parse delimiter-marked text ──
  const enhanced = parseBatchResponse(payload.result, seedPosts.length);
  if (!enhanced) {
    console.error(
      "[geminiClient] parse failed — expected",
      seedPosts.length,
      "posts, raw response:",
      payload.result.slice(0, 400),
    );
    return { ok: false, useFallback: true, reason: "parse" };
  }

   // ── Increment counter ONLY on full success (after-success increment) ──
  writeSessionCount(readSessionCount() + 1);

  return { ok: true, enhanced };
}

/**
 * Regenerates a SINGLE LinkedIn post via Gemini.
 *
 * Used by per-post regenerate (Block 5G) for surgical recovery or replacement
 * of one enhanced post, independent of the page-level batch flow. One call
 * costs ~200 output tokens vs ~600+ for a batch regenerate-to-recover-one.
 *
 * @param {object} args
 * @param {string} args.seedContent
 *   The post body to rewrite. The seed (roadmapData) content is the canonical
 *   source — passing the existing enhancedContent as seed is also valid (for
 *   "I don't like this Gemini output, try again" flows).
 * @param {string} args.companyName
 * @param {string} args.stepTitle
 * @param {string} [args.qualityBar]
 * @param {string} [args.postType]   e.g. "Thread" | "Model Drop" | "Pitch Post"
 *
 * @returns {Promise
 *     { ok: true, enhanced: string }
 *   | { ok: false, useFallback: true, reason: 'limit'|'bad-input'|'timeout'|'network'|'server'|'empty' }
 * >}
 *
 * Side effects: increments sessionStorage atlas_gemini_call_count by 1 on
 * full success (parse + non-empty result). Failed/timed-out calls do NOT
 * count against the 30-call session budget.
 *
 * Note: this function does NOT have its own "parse" failure mode (unlike
 * generateBatchPosts) because there are no delimiter markers — any non-empty
 * string the model returns is treated as the rewritten post.
 */
export async function generateSinglePost({
  seedContent,
  companyName,
  stepTitle,
  qualityBar,
  postType,
} = {}) {
  // ── Input validation ──
  if (typeof seedContent !== "string" || seedContent.trim().length === 0) {
    return { ok: false, useFallback: true, reason: "bad-input" };
  }
  if (typeof companyName !== "string" || companyName.length === 0) {
    return { ok: false, useFallback: true, reason: "bad-input" };
  }
  if (typeof stepTitle !== "string" || stepTitle.length === 0) {
    return { ok: false, useFallback: true, reason: "bad-input" };
  }

  // ── Session counter pre-check (BEFORE network) ──
  if (readSessionCount() >= SESSION_CALL_LIMIT) {
    return { ok: false, useFallback: true, reason: "limit" };
  }

  // ── Build prompt ──
  const prompt = buildSinglePrompt({
    seedContent,
    companyName,
    stepTitle,
    qualityBar,
    postType,
  });

  // ── Fire request with AbortController ──
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(FUNCTION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, type: "linkedin-post" }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err && err.name === "AbortError") {
      return { ok: false, useFallback: true, reason: "timeout" };
    }
    console.error("[geminiClient] single network error:", err);
    return { ok: false, useFallback: true, reason: "network" };
  }

  // ── Read response ──
  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    console.error("[geminiClient] single response parse failed:", err);
    return { ok: false, useFallback: true, reason: "server" };
  }

  // Server fallback envelope.
  if (payload && payload.fallback === true) {
    return {
      ok: false,
      useFallback: true,
      reason: payload.error === "timeout" ? "timeout" : "server",
    };
  }

  if (!payload || typeof payload.result !== "string") {
    return { ok: false, useFallback: true, reason: "empty" };
  }

  // ── Clean response ──
  const enhanced = cleanSingleResponse(payload.result);
  if (!enhanced) {
    console.error(
      "[geminiClient] single empty after cleaning, raw response:",
      payload.result.slice(0, 400),
    );
    return { ok: false, useFallback: true, reason: "empty" };
  }

  // ── Increment counter ONLY on full success ──
  writeSessionCount(readSessionCount() + 1);

  return { ok: true, enhanced };
}
