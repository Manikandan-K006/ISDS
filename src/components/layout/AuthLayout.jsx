import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (isAuthenticated) {
    const redirect = user?.role === 'admin' || user?.role === 'teacher' ? '/admin' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="h-screen w-screen theme-bg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20" />
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />

      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl theme-hover theme-text-muted hover:theme-text transition-all z-10"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <Outlet />
    </div>
  );
};

export default AuthLayout;
