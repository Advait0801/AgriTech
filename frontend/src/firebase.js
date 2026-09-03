// Firebase initialisation.
//
// Configuration is read from environment variables rather than hardcoded. In a
// Create React App build, REACT_APP_* values are inlined into the client bundle
// at build time, so this config is still public once deployed — that is normal
// for Firebase and unavoidable for any browser SDK.
//
// Being public is not the same as being unprotected. What actually secures a
// Firebase project is:
//
//   - Firestore security rules (never leave a project in test mode)
//   - the Authentication authorized-domains list
//   - API key restrictions in Google Cloud Console, limiting the key to the
//     specific APIs and HTTP referrers it needs
//
// The key is kept out of source control so that it is not committed to git
// history, where it cannot be removed without rewriting published commits.
//
// See .env.example for the required variables.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey && process.env.NODE_ENV === "development") {
  // Authentication and profile pages will not work without configuration.
  // The rest of the app, including the recorded-data visualisation, still runs.
  console.warn(
    "Firebase is not configured. Copy .env.example to .env and supply your own " +
      "Firebase project values. See frontend/README.md."
  );
}

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
