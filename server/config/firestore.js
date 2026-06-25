const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

let firebaseAdmin = null;
let db = null;
let storage = null;

const hasFirebaseAdminConfig = () => {
  return !!(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 !== 'your_base64_encoded_service_account_json');
};

const getFirebaseAdmin = () => {
  if (getApps().length > 0) {
    firebaseAdmin = getApps()[0];
    return firebaseAdmin;
  }
  if (!hasFirebaseAdminConfig()) return null;
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );
    firebaseAdmin = initializeApp({ credential: cert(serviceAccount) });
    return firebaseAdmin;
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e.message);
    return null;
  }
};

const initFirestore = () => {
  const fbAdmin = getFirebaseAdmin();
  if (!fbAdmin) return null;
  db = getFirestore(fbAdmin);
  return db;
};

const getDB = () => {
  if (db) return db;
  return initFirestore();
};

const initStorage = () => {
  const fbAdmin = getFirebaseAdmin();
  if (!fbAdmin) return null;
  storage = getStorage(fbAdmin);
  return storage;
};

const getStorageBucket = () => {
  if (storage) return storage.bucket();
  const s = initStorage();
  return s ? s.bucket() : null;
};

const verifyFirebaseToken = async (idToken) => {
  const fbAdmin = getFirebaseAdmin();
  if (!fbAdmin) throw new Error('Firebase Admin not configured');
  return await getAuth(fbAdmin).verifyIdToken(idToken);
};

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'isds_jwt_secret_key_2024');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const collection = (name) => {
  const d = getDB();
  if (!d) throw new Error('Firestore not initialized');
  return d.collection(name);
};

const formatDoc = (doc) => {
  if (!doc || !doc.exists) return null;
  return { _id: doc.id, id: doc.id, ...doc.data() };
};

const formatDocs = (snapshot) => {
  return snapshot.docs.map(d => formatDoc(d));
};

const getDoc = async (col, id) => {
  const snap = await collection(col).doc(id).get();
  return formatDoc(snap);
};

const queryDocs = async (col, conditions = [], orderByField = null, orderDir = 'asc', limit = null) => {
  let ref = collection(col);
  conditions.forEach(([field, op, value]) => {
    ref = ref.where(field, op, value);
  });
  if (orderByField) ref = ref.orderBy(orderByField, orderDir);
  if (limit) ref = ref.limit(limit);
  const snap = await ref.get();
  return formatDocs(snap);
};

const addDoc = async (col, data) => {
  const docRef = await collection(col).add({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { _id: docRef.id, id: docRef.id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
};

const updateDoc = async (col, id, data) => {
  await collection(col).doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  return await getDoc(col, id);
};

const deleteDoc = async (col, id) => {
  await collection(col).doc(id).delete();
};

const deleteDocs = async (col, conditions = []) => {
  let ref = collection(col);
  conditions.forEach(([field, op, value]) => {
    ref = ref.where(field, op, value);
  });
  const snap = await ref.get();
  const batch = getDB().batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
};

const countDocs = async (col, conditions = []) => {
  let ref = collection(col);
  conditions.forEach(([field, op, value]) => {
    ref = ref.where(field, op, value);
  });
  const snap = await ref.get();
  return snap.size;
};

module.exports = {
  getFirebaseAdmin, verifyFirebaseToken, hasFirebaseAdminConfig, auth,
  getDB, getStorageBucket, collection, formatDoc, formatDocs,
  getDoc, queryDocs, addDoc, updateDoc, deleteDoc, deleteDocs, countDocs,
};
