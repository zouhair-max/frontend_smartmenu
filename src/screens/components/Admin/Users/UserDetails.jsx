import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../../../services/adminService';
import LoadingSpinner from '../../Restaurant_owner/components/LoadingSpinner';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  User,
  Shield,
  Mail,
  Phone,
  Store
} from 'lucide-react';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getUser(id);
      
      if (response.success) {
        setUser(response.data);
      } else {
        setError(response.message || 'Failed to load user');
      }
    } catch (err) {
      setError('Unable to load user data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${user.is_active ? 'block' : 'activate'} this user?`)) {
      return;
    }

    try {
      const response = await adminService.toggleUserStatus(user.id, !user.is_active);
      if (response.success) {
        fetchUser();
      } else {
        alert(response.message || 'Failed to update user status');
      }
    } catch (err) {
      alert('Error updating user status');
      console.error('Toggle status error:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await adminService.deleteUser(user.id);
      if (response.success) {
        navigate('/admin/users');
      } else {
        alert(response.message || 'Failed to delete user');
      }
    } catch (err) {
      alert(err.message || 'Error deleting user');
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return (
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'User not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/admin/users/${user.id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
            >
              <Edit size={18} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                user.is_active
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {user.is_active ? (
                <>
                  <XCircle size={18} />
                  <span>Block</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Activate</span>
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {user.is_active ? (
              <>
                <CheckCircle size={16} className="mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle size={16} className="mr-1" />
                Blocked
              </>
            )}
          </span>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <User size={16} />
                <span>Name</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <Mail size={16} />
                <span>Email</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                <Phone size={16} />
                <span>Phone</span>
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user.phone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                {user.role === 'restaurant_owner' ? <Shield size={16} /> : <User size={16} />}
                <span>Role</span>
              </dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'restaurant_owner' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {user.role === 'restaurant_owner' ? 'Restaurant Owner' : 'Staff'}
                </span>
              </dd>
            </div>
            {user.restaurant && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                  <Store size={16} />
                  <span>Restaurant</span>
                </dt>
                <dd className="mt-1">
                  <div className="text-sm text-gray-900">{user.restaurant.name}</div>
                  <div className="text-sm text-gray-500">{user.restaurant.slug}</div>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;

