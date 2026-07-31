import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      student: '/dashboard',
      teacher: '/admin/dashboard',
      parent: '/parent/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={roleRoutes[user?.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;