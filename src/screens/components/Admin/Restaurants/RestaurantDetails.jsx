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
  Store,
  Users,
  UtensilsCrossed,
  ShoppingCart,
  Calendar,
  DollarSign
} from 'lucide-react';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getRestaurant(id);
      
      if (response.success) {
        setRestaurant(response.data);
      } else {
        setError(response.message || 'Failed to load restaurant');
      }
    } catch (err) {
      setError('Unable to load restaurant data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${restaurant.is_active ? 'block' : 'activate'} this restaurant?`)) {
      return;
    }

    try {
      const response = await adminService.toggleRestaurantStatus(restaurant.id, !restaurant.is_active);
      if (response.success) {
        fetchRestaurant();
      } else {
        alert(response.message || 'Failed to update restaurant status');
      }
    } catch (err) {
      alert('Error updating restaurant status');
      console.error('Toggle status error:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await adminService.deleteRestaurant(restaurant.id);
      if (response.success) {
        navigate('/admin/restaurants');
      } else {
        alert(response.message || 'Failed to delete restaurant');
      }
    } catch (err) {
      alert('Error deleting restaurant');
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !restaurant) {
    return (
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Restaurant not found'}
          </div>
        </div>
      </div>
    );
  }

  const stats = restaurant.statistics || {};

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/restaurants')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{restaurant.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{restaurant.slug}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/admin/restaurants/${restaurant.id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
            >
              <Edit size={18} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                restaurant.is_active
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {restaurant.is_active ? (
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
              restaurant.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {restaurant.is_active ? (
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_sales?.toFixed(2) || '0.00'} MAD
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_orders || 0}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Meals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_meals || 0}
                </p>
              </div>
              <UtensilsCrossed className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_users || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['overview', 'users', 'meals', 'orders', 'tables'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurant Information</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{restaurant.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Slug</dt>
                      <dd className="mt-1 text-sm text-gray-900">{restaurant.slug}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{restaurant.phone || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Plan</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{restaurant.plan}</dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{restaurant.address || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">City</dt>
                      <dd className="mt-1 text-sm text-gray-900">{restaurant.city || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Country</dt>
                      <dd className="mt-1 text-sm text-gray-900">{restaurant.country || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                {restaurant.owner && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Owner Information</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{restaurant.owner.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{restaurant.owner.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900">{restaurant.owner.phone || 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <p className="text-gray-500">Users list will be displayed here</p>
              </div>
            )}

            {activeTab === 'meals' && (
              <div>
                <p className="text-gray-500">Meals list will be displayed here</p>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <p className="text-gray-500">Orders list will be displayed here</p>
              </div>
            )}

            {activeTab === 'tables' && (
              <div>
                <p className="text-gray-500">Tables list will be displayed here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;

