import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../../services/adminService';
import LoadingSpinner from '../../Restaurant_owner/components/LoadingSpinner';
import CustomSelect from '../../Restaurant_owner/components/CustomSelect';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical, 
  CheckCircle, 
  XCircle,
  Filter
} from 'lucide-react';

const RestaurantsList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, [currentPage, search, statusFilter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        per_page: 15,
        search: search || undefined,
        status: statusFilter || undefined
      };
      
      const response = await adminService.getRestaurants(params);
      
      if (response.success) {
        setRestaurants(response.data.data || []);
        setPagination(response.data);
      } else {
        setError(response.message || 'Failed to load restaurants');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Restaurants error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await adminService.deleteRestaurant(id);
      if (response.success) {
        fetchRestaurants();
      } else {
        alert(response.message || 'Failed to delete restaurant');
      }
    } catch (err) {
      alert('Error deleting restaurant. Please try again.');
      console.error('Delete error:', err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await adminService.toggleRestaurantStatus(id, !currentStatus);
      if (response.success) {
        fetchRestaurants();
      } else {
        alert(response.message || 'Failed to update restaurant status');
      }
    } catch (err) {
      alert('Error updating restaurant status. Please try again.');
      console.error('Toggle status error:', err);
    }
    setActionMenu(null);
  };

  if (loading && !restaurants.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Restaurants</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Manage all restaurants in the system
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/restaurants/create')}
            className="mt-4 sm:mt-0 flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add Restaurant</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <div className="w-48">
                <CustomSelect
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'blocked', label: 'Blocked' },
                  ]}
                  placeholder="All Status"
                  icon={Filter}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Restaurants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : restaurants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No restaurants found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Restaurant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {restaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                            <div className="text-sm text-gray-500">{restaurant.slug}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {restaurant.owner?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {restaurant.owner?.email || ''}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{restaurant.city || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{restaurant.country || ''}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Meals: {restaurant.meals_count || 0}</div>
                          <div>Orders: {restaurant.orders_count || 0}</div>
                          <div>Tables: {restaurant.tables_count || 0}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              restaurant.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {restaurant.is_active ? (
                              <>
                                <CheckCircle size={14} className="mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={14} className="mr-1" />
                                Blocked
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => setActionMenu(actionMenu === restaurant.id ? null : restaurant.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreVertical size={18} className="text-gray-600" />
                            </button>
                            {actionMenu === restaurant.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActionMenu(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-200">
                                  <button
                                    onClick={() => {
                                      navigate(`/admin/restaurants/${restaurant.id}`);
                                      setActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  >
                                    <Eye size={16} />
                                    <span>View Details</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigate(`/admin/restaurants/${restaurant.id}/edit`);
                                      setActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  >
                                    <Edit size={16} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(restaurant.id, restaurant.is_active)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  >
                                    {restaurant.is_active ? (
                                      <>
                                        <XCircle size={16} />
                                        <span>Block</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle size={16} />
                                        <span>Activate</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDelete(restaurant.id);
                                      setActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                  >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                      disabled={currentPage === pagination.last_page}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantsList;

