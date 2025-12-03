// components/RoleProtectedRoute.jsx
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './Restaurant_owner/components/LoadingSpinner';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="">
        <LoadingSpinner/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no roles specified, allow all authenticated users
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in the allowed roles
  const userRole = user?.role || '';
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    // Redirect to dashboard or show unauthorized message
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleProtectedRoute;

