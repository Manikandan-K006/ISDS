const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let firebaseAdmin = null;

const hasFirebaseAdminConfig = () => {
  return !!(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 !== 'your_base64_encoded_service_account_json');
};

const getFirebaseAdmin = () => {
  if (getApps().length > 0) {
    firebaseAdmin = getApps()[0];
    return firebaseAdmin;
  }

  if (!hasFirebaseAdminConfig()) {
    return null;
  }

  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );
    firebaseAdmin = initializeApp({
      credential: cert(serviceAccount),
    });
    return firebaseAdmin;
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e.message);
    return null;
  }
};

const verifyFirebaseToken = async (idToken) => {
  const fbAdmin = getFirebaseAdmin();
  if (!fbAdmin) {
    throw new Error('Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_PROJECT_ID.');
  }
  const decodedToken = await getAuth(fbAdmin).verifyIdToken(idToken);
  return decodedToken;
};

module.exports = { getFirebaseAdmin, verifyFirebaseToken, hasFirebaseAdminConfig };
