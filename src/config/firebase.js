import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = firebaseConfig.apiKey
  && firebaseConfig.apiKey !== 'your_firebase_api_key'
  && firebaseConfig.authDomain
  && firebaseConfig.projectId;

if (!hasFirebaseConfig) {
  console.warn(
    'ISDS: Firebase not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, '
    + 'VITE_FIREBASE_PROJECT_ID in Vercel Environment Variables to enable authentication.'
  );
}

let app = null;
let auth = null;

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    if (import.meta.env.VITE_USE_AUTH_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
  } catch (e) {
    console.error('ISDS: Firebase initialization failed:', e.message);
  }
}

export { app, auth, hasFirebaseConfig };
