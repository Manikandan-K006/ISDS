import axios from 'axios';
import { API_BASE } from '../utils/constants';
import { auth, hasFirebaseConfig } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

const api = axios.create({ baseURL: `${API_BASE}/api/auth` });

const getFirebaseErrorMessage = (errorCode) => {
  const messages = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/invalid-email': 'Invalid email format.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/operation-not-allowed': 'Email/Password sign-in is not enabled.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/cancelled-popup-request': 'Sign-in cancelled.',
  };
  return messages[errorCode] || `Authentication error: ${errorCode}`;
};

const getBackendToken = async (firebaseToken, userData = {}) => {
  const { data } = await api.post('/firebase', { idToken: firebaseToken, ...userData });
  return data;
};

export const login = async ({ email, password }) => {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase is not configured. Set Firebase environment variables.');
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseToken = await userCredential.user.getIdToken();
  const data = await getBackendToken(firebaseToken);
  return data;
};

export const register = async ({ name, email, password, role, class: className, adminAuthorizationPassword, rollNumber, department, subject, employeeId }) => {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase is not configured. Set Firebase environment variables.');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseToken = await userCredential.user.getIdToken();
  const data = await getBackendToken(firebaseToken, {
    name,
    role,
    class: className,
    adminAuthorizationPassword,
    rollNumber,
    department,
    subject,
    employeeId,
  });
  return data;
};

export const forgotPassword = async ({ email }) => {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase is not configured.');
  }
  await sendPasswordResetEmail(auth, email);
  return { message: 'Password reset email sent.' };
};

export const googleLogin = async ({ role, adminAuthorizationPassword } = {}) => {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase is not configured.');
  }
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const firebaseToken = await userCredential.user.getIdToken();
  const data = await getBackendToken(firebaseToken, {
    role,
    adminAuthorizationPassword,
    name: userCredential.user.displayName || undefined,
  });
  return data;
};

export { getFirebaseErrorMessage };
