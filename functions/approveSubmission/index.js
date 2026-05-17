// functions/approveSubmission/index.js
//
// HTTPS Callable — approves a pending submission.
// Generates an access code, writes it to access-codes, updates the submission
// doc, then emails the customer via Resend. All Firestore work is transactional.
// Admin-only: rejects immediately if caller uid !== ibforge.admin_uid config.

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp, getApps } = require("firebase-admin/app");

if (!getApps().length) initializeApp();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = "https://ibforge.in";

// Ambiguous-char-free alphabet for codes (no 0/O, 1/I/l).
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(prefix = "IBFORGE-2026") {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return `${prefix}-${suffix}`;
}

async function sendEmail({ to, subject, text }) {
  if (!RESEND_API_KEY) {
    console.warn("[approveSubmission] RESEND_API_KEY not set — skipping email");
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
    console.error("[approveSubmission] Resend error:", res.status, body);
    // Non-fatal — code was generated and saved. Email failure logged only.
  }
}

exports.approveSubmission = onCall(
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

    const { submissionId } = request.data;
    if (typeof submissionId !== "string" || submissionId.length === 0) {
      throw new HttpsError("invalid-argument", "submissionId required.");
    }

    const db = getFirestore();

    // ── Transactional: read submission, generate code, write both docs ──────
    let code;
    let submissionEmail;

    await db.runTransaction(async (tx) => {
      const subRef = db.collection("submissions").doc(submissionId);
      const subSnap = await tx.get(subRef);

      if (!subSnap.exists) {
        throw new HttpsError("not-found", "Submission not found.");
      }
      const sub = subSnap.data();
      if (sub.status !== "PENDING") {
        throw new HttpsError(
          "failed-precondition",
          `Submission is already ${sub.status}.`
        );
      }

      submissionEmail = sub.email;

      // Generate a code that doesn't already exist in access-codes.
      // Retry up to 5 times to avoid collision (extremely unlikely).
      let attempts = 0;
      let codeRef;
      while (attempts < 5) {
        code = generateCode();
        codeRef = db.collection("access-codes").doc(code);
        const existing = await tx.get(codeRef);
        if (!existing.exists) break;
        attempts++;
        if (attempts === 5) {
          throw new HttpsError("internal", "Could not generate unique code.");
        }
      }

      // Write access-codes doc.
      tx.set(codeRef, {
        plan: "full",
        used: false,
        email: submissionEmail,
        createdBy: "admin-approve",
        createdAt: FieldValue.serverTimestamp(),
      });

      // Update submission doc.
      tx.update(subRef, {
        status: "APPROVED",
        reviewedAt: FieldValue.serverTimestamp(),
        reviewedBy: request.auth.uid,
        codeIssued: code,
      });
    });

    // ── Email customer (post-transaction — non-fatal if it fails) ───────────
    await sendEmail({
      to: submissionEmail,
      subject: "Your IBForge access code",
      text: `Welcome to IBForge.

Your full-access code:

${code}

Redeem at ${APP_URL}/access — sign in with the same email (${submissionEmail}) and enter the code.

All 14 modules unlock. Single-use code, tied to this email.

Refund window: 7 days from today.
Refund or support: hello@ibforge.in

— IBForge`,
    });

    return { success: true, code };
  }
);