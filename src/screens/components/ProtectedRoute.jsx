// components/ProtectedRoute.jsx
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './Restaurant_owner/components/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

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

  return children;
};

export default ProtectedRoute;