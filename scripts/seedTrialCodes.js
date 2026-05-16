// scripts/seedTrialCodes.js
//
// One-time operator script. Generates 500 trial codes and writes them to
// the access-codes Firestore collection.
//
// Run: node scripts/seedTrialCodes.js
//
// Prerequisites:
//   - scripts/serviceAccountKey.json must exist (from Firebase Console →
//     Project Settings → Service Accounts → Generate new private key)
//   - scripts/serviceAccountKey.json must be in .gitignore BEFORE running
//
// Output:
//   - 500 documents written to Firestore access-codes/{code}
//   - seeded-codes.txt written to scripts/ with one code per line
//     Copy this file to a secure location (Google Drive private folder)
//     then delete it from the repo.

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// ─── Config ──────────────────────────────────────────────────────────────────

const SERVICE_ACCOUNT_PATH = path.join(__dirname, "serviceAccountKey.json");
const OUTPUT_FILE = path.join(__dirname, "seeded-codes.txt");
const TOTAL_CODES = 500;
const CODE_PREFIX = "IBFORGE-2026";

// Alphanumeric charset — no ambiguous characters (O, 0, I, 1, l)
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_SUFFIX_LENGTH = 6; // 32^6 = ~1 billion combinations

// ─── Initialise Firebase Admin ────────────────────────────────────────────────

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(
    "ERROR: scripts/serviceAccountKey.json not found.\n" +
    "Download it from Firebase Console → Project Settings → Service Accounts.\n" +
    "Save it as scripts/serviceAccountKey.json before running this script."
  );
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSuffix() {
  let suffix = "";
  for (let i = 0; i < CODE_SUFFIX_LENGTH; i++) {
    suffix += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return suffix;
}

function generateUniqueCodes(count) {
  const codes = new Set();
  while (codes.size < count) {
    codes.add(`${CODE_PREFIX}-${generateSuffix()}`);
  }
  return Array.from(codes);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`Generating ${TOTAL_CODES} unique trial codes...`);
  const codes = generateUniqueCodes(TOTAL_CODES);

  console.log(`Writing to Firestore in a single batch...`);

  // Firestore batch write limit is 500 operations — exactly our count.
  const batch = db.batch();
  const now = admin.firestore.FieldValue.serverTimestamp();

  for (const code of codes) {
    const ref = db.collection("access-codes").doc(code);
    batch.set(ref, {
      code,
      plan: "trial",
      used: false,
      usedBy: null,
      usedAt: null,
      createdAt: now,
      createdBy: "seed",
      email: null,
    });
  }

  await batch.commit();
  console.log(`✓ ${TOTAL_CODES} codes written to Firestore.`);

  // Write codes to local file for operator reference.
  fs.writeFileSync(OUTPUT_FILE, codes.join("\n") + "\n", "utf8");
  console.log(`✓ Code list saved to scripts/seeded-codes.txt`);
  console.log();
  console.log("NEXT STEPS:");
  console.log("  1. Copy scripts/seeded-codes.txt to a secure location (e.g. Google Drive private folder).");
  console.log("  2. Delete scripts/seeded-codes.txt from this repo.");
  console.log("  3. Do NOT commit seeded-codes.txt or serviceAccountKey.json.");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});