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