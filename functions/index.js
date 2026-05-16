// functions/index.js
//
// ATLAS Cloud Functions — deployed to Firebase.
// Currently exports a single function: deleteAccount.
//
// Why this exists (and is not client-side):
//   Firebase Web SDK has no recursive delete. Deleting users/{uid} from
//   the client leaves every subcollection (deliverables, scheduledPosts,
//   progress) orphaned in Firestore. Storage listAll() + deleteObject()
//   per file is sequential and slow. signOut() during deletion blocks
//   remaining deletes via security rules. Result: ghost data.
//
//   This function runs under privileged admin credentials, ignores
//   security rules, and uses firebase-tools recursive delete for
//   Firestore subcollections. Auth state on the client is irrelevant —
//   the function authorises by request.auth.uid alone.
//
// Deployment:
//   1. firebase login:ci  → copy token
//   2. firebase functions:secrets:set FB_TOOLS_TOKEN  → paste token
//   3. firebase deploy --only functions:deleteAccount

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");
const firebase_tools = require("firebase-tools");

admin.initializeApp();

// Cost control — caps the number of concurrent containers across all v2
// functions in this codebase. ATLAS has one function (deleteAccount) called
// rarely, so 10 is generous headroom.
setGlobalOptions({ maxInstances: 10 });

// Modern parameterized secret. Stored in Google Secret Manager. The
// function only sees its value at runtime, and only because the
// secrets: [FB_TOOLS_TOKEN] clause below explicitly opts in.
//   Set via: firebase functions:secrets:set FB_TOOLS_TOKEN
const FB_TOOLS_TOKEN = defineSecret("FB_TOOLS_TOKEN");
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

// ─── claimCode ───────────────────────────────────────────────────────────────
// Callable Cloud Function. Atomically claims an invite code and writes the
// access record to the caller's user document.
//
// Input:  { code: string }
// Output: { success: true, plan: "trial" | "full" }
//
// All validation and both Firestore writes run inside a single transaction.
// Either both succeed or both fail — no partial state is possible.
//
// Error codes returned to client:
//   "unauthenticated"   — caller is not signed in
//   "invalid-argument"  — code field missing or not a string
//   "not-found"         — code document does not exist in access-codes
//   "already-exists"    — code has already been redeemed
//   "permission-denied" — code was issued for a specific email that doesn't match caller
//   "internal"          — unexpected server error (details logged, not surfaced)
//
// Deployment:
//   firebase deploy --only functions:claimCode
// ─── issueTrialCode ──────────────────────────────────────────────────────────
// Callable Cloud Function. Called by the trial form on the landing page.
// Mints a per-email trial code and sends it via Resend.
//
// Input:  { email: string }
// Output: { success: true }  — same response whether newly minted or re-sent.
//                              Never leaks whether the email was seen before.
//
// Rate limit: one request per email per 60 seconds (Firestore-backed).
//
// Error codes returned to client:
//   "invalid-argument"  — email missing, not a string, or fails format check
//   "resource-exhausted" — rate limit hit (same email within 60 seconds)
//   "internal"          — unexpected server error
//
// Deployment:
//   firebase deploy --only functions:issueTrialCode
exports.issueTrialCode = onCall(
  {
    timeoutSeconds: 30,
    memory: "256MiB",
    secrets: [RESEND_API_KEY],
  },
  async (request) => {
    const { Resend } = require("resend");

    // ─── Input validation ───
    const email = request.data?.email;
    if (!email || typeof email !== "string") {
      throw new HttpsError("invalid-argument", "An email address is required.");
    }

    // Basic format check — not exhaustive, just catches obvious garbage.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpsError("invalid-argument", "That doesn't look like a valid email address.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    logger.info(`[issueTrialCode] request for email=${normalizedEmail}`);

    const db = admin.firestore();

    // ─── Rate limit check ───
    // trial-requests/{email} stores lastRequestedAt. If it's within 60
    // seconds, reject. Use the normalised email as the doc id, but
    // Firestore doc ids can't contain dots — replace with underscores.
    const safeEmailKey = normalizedEmail.replace(/\./g, "_").replace(/@/g, "__at__");
    const rateLimitRef = db.collection("trial-requests").doc(safeEmailKey);
    const rateLimitSnap = await rateLimitRef.get();

    if (rateLimitSnap.exists) {
      const lastRequested = rateLimitSnap.data().lastRequestedAt?.toDate?.();
      if (lastRequested) {
        const secondsElapsed = (Date.now() - lastRequested.getTime()) / 1000;
        if (secondsElapsed < 60) {
          throw new HttpsError(
            "resource-exhausted",
            "You already requested a code recently. Check your inbox or wait a moment.",
          );
        }
      }
    }

    // ─── Check for existing unused code for this email ───
    // If one exists, re-send it instead of minting a new one.
    const existingSnap = await db
      .collection("access-codes")
      .where("email", "==", normalizedEmail)
      .where("used", "==", false)
      .limit(1)
      .get();

    let codeToSend;

    if (!existingSnap.empty) {
      // Re-use the existing unminted code.
      codeToSend = existingSnap.docs[0].id;
      logger.info(`[issueTrialCode] re-sending existing code=${codeToSend} for email=${normalizedEmail}`);
    } else {
      // Mint a new trial code.
      const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      let suffix = "";
      for (let i = 0; i < 6; i++) {
        suffix += CHARSET[Math.floor(Math.random() * CHARSET.length)];
      }
      codeToSend = `IBFORGE-TRIAL-${suffix}`;

      await db.collection("access-codes").doc(codeToSend).set({
        code: codeToSend,
        plan: "trial",
        used: false,
        usedBy: null,
        usedAt: null,
        createdAt: Timestamp.now(),
        createdBy: "trial-form",
        email: normalizedEmail,
      });

      logger.info(`[issueTrialCode] minted new code=${codeToSend} for email=${normalizedEmail}`);
    }

    // ─── Update rate limit record ───
    await rateLimitRef.set({ lastRequestedAt: FieldValue.serverTimestamp() });

    // ─── Send email via Resend ───
    const resend = new Resend(RESEND_API_KEY.value());

    const { error: resendError } = await resend.emails.send({
      from: "IBForge <noreply@ibforge.in>",
      to: normalizedEmail,
      subject: "Your IBForge trial code",
      text: [
        "Your IBForge Module 1 trial code:",
        "",
        `    ${codeToSend}`,
        "",
        "Enter it at https://ibforge.in/access to begin Module 1.",
        "",
        "Module 1 is 7 steps. Free to complete. Single-use code.",
        "",
        "— IBForge",
      ].join("\n"),
    });

    if (resendError) {
      logger.error(`[issueTrialCode] Resend error for email=${normalizedEmail}: ${JSON.stringify(resendError)}`);
      throw new HttpsError("internal", "Couldn't send the code. Try again in a moment.");
    }

    logger.info(`[issueTrialCode] email sent to=${normalizedEmail} code=${codeToSend}`);
    return { success: true };
  },
);

exports.claimCode = onCall(
  {
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (request) => {
    // ─── Authorisation ───
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Must be signed in to redeem a code.",
      );
    }
    const uid = request.auth.uid;
    const callerEmail = request.auth.token.email ?? null;

    // ─── Input validation ───
    const code = request.data?.code;
    if (!code || typeof code !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "A code is required.",
      );
    }
    const normalizedCode = code.trim().toUpperCase();

    logger.info(`[claimCode] uid=${uid} attempting code=${normalizedCode}`);

    const db = admin.firestore();
    const codeRef = db.collection("access-codes").doc(normalizedCode);
    const accessRef = db.collection("users").doc(uid);

    try {
      const plan = await db.runTransaction(async (txn) => {
        // ─── 1. Read the code document ───
        const codeSnap = await txn.get(codeRef);

        if (!codeSnap.exists) {
          throw new HttpsError(
            "not-found",
            "Code not recognised. Check for typos.",
          );
        }

        const codeData = codeSnap.data();

        // ─── 2. Check if already redeemed ───
        if (codeData.used === true) {
          throw new HttpsError(
            "already-exists",
            "This code has already been redeemed.",
          );
        }

        // ─── 3. Check email binding ───
        // If the code was minted for a specific email (trial flow), the
        // caller's authenticated email must match. Null email field means
        // the code is open (seeded pool, admin-minted).
        if (codeData.email !== null && codeData.email !== undefined) {
          if (codeData.email !== callerEmail) {
            throw new HttpsError(
              "permission-denied",
              "This code was issued for a different email address.",
            );
          }
        }

        const resolvedPlan = codeData.plan;

        // ─── 4. Write access record to users/{uid} ───
        // merge: true so existing user-doc fields (onboardingComplete, role)
        // are preserved. The access field is added or overwritten.
        txn.set(
          accessRef,
          {
            access: {
              plan: resolvedPlan,
              codeUsed: normalizedCode,
              grantedAt: FieldValue.serverTimestamp(),
            },
          },
          { merge: true },
        );

        // ─── 5. Mark code as used ───
        txn.update(codeRef, {
          used: true,
          usedBy: uid,
          usedAt: FieldValue.serverTimestamp(),
        });

        return resolvedPlan;
      });

      logger.info(
        `[claimCode] success uid=${uid} code=${normalizedCode} plan=${plan}`,
      );
      return { success: true, plan };

    } catch (err) {
      // Re-throw HttpsErrors directly — they carry the right code and message.
      if (err instanceof HttpsError) {
        throw err;
      }
      // Unexpected errors: log internals, surface a generic message.
      logger.error(
        `[claimCode] unexpected error uid=${uid} code=${normalizedCode}: ${err.message}`,
      );
      throw new HttpsError(
        "internal",
        "Something went wrong. Try again in a moment.",
      );
    }
  },
);

exports.deleteAccount = onCall(
  {
    timeoutSeconds: 540,
    memory: "1GiB",
    secrets: [FB_TOOLS_TOKEN],
  },
  async (request) => {
    // ─── Authorisation ───
    // In v2 onCall, request.auth is populated by the Firebase SDK when
    // the caller is authenticated. null means anonymous → reject.
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Must be authenticated to delete account.",
      );
    }
    const uid = request.auth.uid;

    // The firebase-tools recursive delete needs a CI token to authenticate
    // because it shells out to gcloud-style auth. The token lives in
    // Secret Manager.
    const fbToken = FB_TOOLS_TOKEN.value();
    if (!fbToken) {
      throw new HttpsError(
        "failed-precondition",
        "Server missing FB_TOOLS_TOKEN — run firebase functions:secrets:set FB_TOOLS_TOKEN.",
      );
    }

    logger.info(`[deleteAccount] starting deletion for uid=${uid}`);

    try {
      // ─── 1. Recursive Firestore delete: users/{uid} ───
      // Wipes the document and EVERY subcollection underneath it.
      await firebase_tools.firestore.delete(`users/${uid}`, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        force: true,
        token: fbToken,
      });
      logger.info(`[deleteAccount] Firestore cleared for uid=${uid}`);

      // ─── 2. Storage delete: deliverables/{uid}/ prefix ───
      // deleteFiles with a prefix removes every object below it.
      const bucket = admin.storage().bucket();
      await bucket.deleteFiles({ prefix: `deliverables/${uid}/` });
      logger.info(`[deleteAccount] Storage cleared for uid=${uid}`);

      // ─── 3. Auth user — must be LAST ───
      // Once this fires the client's auth token is invalid; any inflight
      // requests will fail security rules. That's fine — we're done.
      await admin.auth().deleteUser(uid);
      logger.info(`[deleteAccount] auth user deleted uid=${uid}`);

      return { success: true, uid };
    } catch (err) {
      logger.error(
        `[deleteAccount] failed for uid=${uid}: ${err.message} ${err.code || ""}`,
      );
      // Surface a clean HttpsError to the client. Don't leak internals.
      throw new HttpsError(
        "internal",
        "Account deletion failed. Try again or contact support.",
      );
    }
  },
);