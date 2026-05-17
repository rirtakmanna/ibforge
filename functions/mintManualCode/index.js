// functions/mintManualCode/index.js
//
// HTTPS Callable — mints an access code without a submission (gifting,
// direct sales, refund-and-reissue). Admin-only.

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp, getApps } = require("firebase-admin/app");

if (!getApps().length) initializeApp();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = "https://ibforge.in";

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(plan) {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  const prefix = plan === "trial" ? "IBFORGE-TRIAL" : "IBFORGE-2026";
  return `${prefix}-${suffix}`;
}

async function sendEmail({ to, subject, text }) {
  if (!RESEND_API_KEY) {
    console.warn("[mintManualCode] RESEND_API_KEY not set — skipping email");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "IBForge <hello@ibforge.in>",
      to: [to],
      subject,
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[mintManualCode] Resend error:", res.status, body);
  }
}

exports.mintManualCode = onCall(
  { region: "asia-south2", enforceAppCheck: false },
  async (request) => {
    // ── Auth guard ──────────────────────────────────────────────────────────
    const adminUid = process.env.IBFORGE_ADMIN_UID;

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    if (request.auth.uid !== adminUid) {
      throw new HttpsError("permission-denied", "Not authorised.");
    }

    const { email, plan } = request.data;
    if (typeof email !== "string" || email.length === 0) {
      throw new HttpsError("invalid-argument", "email required.");
    }
    if (plan !== "trial" && plan !== "full") {
      throw new HttpsError("invalid-argument", 'plan must be "trial" or "full".');
    }

    const db = getFirestore();

    // ── Generate unique code ────────────────────────────────────────────────
    let code;
    let attempts = 0;
    while (attempts < 5) {
      code = generateCode(plan);
      const existing = await db.collection("access-codes").doc(code).get();
      if (!existing.exists) break;
      attempts++;
      if (attempts === 5) {
        throw new HttpsError("internal", "Could not generate unique code.");
      }
    }

    // ── Write to access-codes ───────────────────────────────────────────────
    await db.collection("access-codes").doc(code).set({
      plan,
      used: false,
      email,
      createdBy: "admin-manual",
      createdAt: FieldValue.serverTimestamp(),
    });

    // ── Email customer ──────────────────────────────────────────────────────
    const isFull = plan === "full";
    await sendEmail({
      to: email,
      subject: isFull
        ? "Your IBForge access code"
        : "Your IBForge trial code",
      text: isFull
        ? `Welcome to IBForge.

Your full-access code:

${code}

Redeem at ${APP_URL}/access — sign in with Google using this email (${email}) and enter the code.

All 14 modules unlock. Single-use code, tied to this email.

Support: hello@ibforge.in

— IBForge`
        : `Welcome to IBForge.

Your trial code:

${code}

Redeem at ${APP_URL}/access — sign in with Google using this email (${email}) and enter the code.

Your trial unlocks Module 1 (14 steps). Upgrade any time for full access.

Support: hello@ibforge.in

— IBForge`,
    });

    return { success: true, code };
  }
);