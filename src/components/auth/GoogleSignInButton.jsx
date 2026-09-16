import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../../api/auth';
import { hasFirebaseConfig } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../api/client';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const ROLE_ROUTES = {
  student: '/dashboard',
  teacher: '/teacher/dashboard',
  parent: '/parent/dashboard',
  admin: '/admin/dashboard',
  recruiter: '/recruiter/dashboard',
};

export default function GoogleSignInButton({ role = 'student', adminAuthorizationPassword, className = '' }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!hasFirebaseConfig) {
      toast.error('Google sign-in is unavailable until Firebase is configured in the frontend .env file.');
      return;
    }

    setLoading(true);
    try {
      const data = await googleLogin({ role, adminAuthorizationPassword });
      login(data.user, data.token);
      if (data.refreshToken) {
        localStorage.setItem('sidts_refresh_token', data.refreshToken);
      }
      toast.success(`Welcome, ${data.user.name}!`);
      navigate(ROLE_ROUTES[data.user.role] || '/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Google sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading || !hasFirebaseConfig}
      className={`w-full py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] theme-text text-sm font-medium hover:bg-[var(--hover)] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-wait select-none ${className}`}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-[var(--border)] border-t-current rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {hasFirebaseConfig ? 'Continue with Google' : 'Google sign-in unavailable'}
    </button>
  );
}