const admin = require('firebase-admin');

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
let firebaseAdmin = null;
let firestore = null;

const hasFirebaseAdminConfig = () => {
  return !!(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 !== 'your_base64_encoded_service_account_json');
};

const getFirebaseAdmin = () => {
  if (process.env.FIREBASE_PROJECT_ID && !serviceAccountBase64) {
    // Use default application credentials (e.g., on Render with GCP integration)
    try {
      if (!firebaseAdmin) {
        firebaseAdmin = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      }
      return firebaseAdmin;
    } catch (e) {
      console.error('Failed to initialize Firebase Admin with default creds:', e.message);
      return null;
    }
  }

  if (hasFirebaseAdminConfig()) {
    try {
      if (!firebaseAdmin) {
        const serviceAccount = JSON.parse(
          Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
        );
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      return firebaseAdmin;
    } catch (e) {
      console.error('Failed to initialize Firebase Admin:', e.message);
      return null;
    }
  }

  return null;
};

const verifyFirebaseToken = async (idToken) => {
  const fbAdmin = getFirebaseAdmin();
  if (!fbAdmin) {
    throw new Error('Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_PROJECT_ID.');
  }
  const decodedToken = await fbAdmin.auth().verifyIdToken(idToken);
  return decodedToken;
};

module.exports = { getFirebaseAdmin, verifyFirebaseToken, hasFirebaseAdminConfig };
