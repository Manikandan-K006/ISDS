import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    const redirect = user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/admin' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-navy to-purple-900/20" />
      <div className="relative w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
