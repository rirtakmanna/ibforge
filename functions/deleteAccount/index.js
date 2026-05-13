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
//   the function authorises by context.auth.uid alone.
//
// Deployment:
//   1. firebase login:ci  → copy token
//   2. firebase functions:config:set fb.token="THE_TOKEN"
//   3. firebase deploy --only functions:deleteAccount

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firebase_tools = require("firebase-tools");

admin.initializeApp();

exports.deleteAccount = functions
  .runWith({ timeoutSeconds: 540, memory: "1GB" })
  .https.onCall(async (data, context) => {
    // ─── Authorisation ───
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to delete account.",
      );
    }
    const uid = context.auth.uid;

    // The firebase-tools recursive delete needs a CI token to authenticate
    // because it shells out to gcloud-style auth. We stored it via
    // `firebase functions:config:set fb.token=...` during deploy.
    const fbToken = functions.config().fb && functions.config().fb.token;
    if (!fbToken) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Server missing fb.token — run firebase functions:config:set.",
      );
    }

    console.log(`[deleteAccount] starting deletion for uid=${uid}`);

    try {
      // ─── 1. Recursive Firestore delete: users/{uid} ───
      // Wipes the document and EVERY subcollection underneath it.
      await firebase_tools.firestore.delete(`users/${uid}`, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        force: true,
        token: fbToken,
      });
      console.log(`[deleteAccount] Firestore cleared for uid=${uid}`);

      // ─── 2. Storage delete: deliverables/{uid}/ prefix ───
      // deleteFiles with a prefix removes every object below it.
      const bucket = admin.storage().bucket();
      await bucket.deleteFiles({ prefix: `deliverables/${uid}/` });
      console.log(`[deleteAccount] Storage cleared for uid=${uid}`);

      // ─── 3. Auth user — must be LAST ───
      // Once this fires the client's auth token is invalid; any inflight
      // requests will fail security rules. That's fine — we're done.
      await admin.auth().deleteUser(uid);
      console.log(`[deleteAccount] auth user deleted uid=${uid}`);

      return { success: true, uid };
    } catch (err) {
      console.error(
        `[deleteAccount] failed for uid=${uid}:`,
        err.message,
        err.code,
      );
      // Surface a clean HttpsError to the client. Don't leak internals.
      throw new functions.https.HttpsError(
        "internal",
        "Account deletion failed. Try again or contact support.",
      );
    }
  });
