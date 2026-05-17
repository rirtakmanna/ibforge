// functions/rejectSubmission/index.js
//
// HTTPS Callable — rejects a pending submission and emails the customer.
// Admin-only.

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp, getApps } = require("firebase-admin/app");

if (!getApps().length) initializeApp();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = "https://ibforge.in";

async function sendEmail({ to, subject, text }) {
  if (!RESEND_API_KEY) {
    console.warn("[rejectSubmission] RESEND_API_KEY not set — skipping email");
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
    console.error("[rejectSubmission] Resend error:", res.status, body);
  }
}

exports.rejectSubmission = onCall(
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

    const { submissionId, reason } = request.data;
    if (typeof submissionId !== "string" || submissionId.length === 0) {
      throw new HttpsError("invalid-argument", "submissionId required.");
    }
    const rejectReason =
      typeof reason === "string" && reason.trim().length > 0
        ? reason.trim()
        : "Could not verify the payment details provided.";

    const db = getFirestore();

    // ── Read + update (transaction for atomicity) ───────────────────────────
    let submissionEmail;
    let submissionName;

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
      submissionName = sub.name;

      tx.update(subRef, {
        status: "REJECTED",
        rejectReason,
        reviewedAt: FieldValue.serverTimestamp(),
        reviewedBy: request.auth.uid,
      });
    });

    // ── Email customer ──────────────────────────────────────────────────────
    await sendEmail({
      to: submissionEmail,
      subject: "IBForge submission — could not verify",
      text: `Hi ${submissionName},

We couldn't verify your IBForge submission.

Reason: ${rejectReason}

Most common fix: re-submit with a clearer screenshot showing the UPI transaction reference, amount (₹2,499), and recipient (Rirtak Manna — 7906949133@kotakbank).

Submit again at ${APP_URL}/#pricing.

Questions: hello@ibforge.in

— IBForge`,
    });

    return { success: true };
  }
);