import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../../../services/adminService';
import LoadingSpinner from '../../Restaurant_owner/components/LoadingSpinner';
import CustomSelect from '../../Restaurant_owner/components/CustomSelect';
import { ArrowLeft, Save, Shield, User as UserIcon, Store } from 'lucide-react';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    restaurant_id: '',
    phone: '',
    avatar: '',
    is_active: true
  });

  useEffect(() => {
    if (isEdit) {
      fetchUser();
    }
    fetchRestaurants();
  }, [id]);

  const fetchRestaurants = async () => {
    try {
      const response = await adminService.getRestaurants({ per_page: 100 });
      if (response.success) {
        setRestaurants(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    }
  };

  const fetchUser = async () => {
    try {
      setLoadingData(true);
      const response = await adminService.getUser(id);
      if (response.success) {
        const user = response.data;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          role: user.role || 'staff',
          restaurant_id: user.restaurant_id?.toString() || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
          is_active: user.is_active !== undefined ? user.is_active : true,
        });
      } else {
        setError(response.message || 'Failed to load user');
      }
    } catch (err) {
      setError('Unable to load user data');
      console.error('Fetch error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = { ...formData };
      if (isEdit && !submitData.password) {
        delete submitData.password;
      }
      if (submitData.restaurant_id === '') {
        submitData.restaurant_id = null;
      }

      let response;
      if (isEdit) {
        response = await adminService.updateUser(id, submitData);
      } else {
        response = await adminService.createUser(submitData);
      }

      if (response.success) {
        navigate('/admin/users');
      } else {
        setError(response.message || 'Failed to save user');
        if (response.errors) {
          console.error('Validation errors:', response.errors);
        }
      }
    } catch (err) {
      setError(err.message || 'Error saving user');
      if (err.errors) {
        console.error('Validation errors:', err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit User' : 'Create User'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {isEdit ? 'Update user information' : 'Add a new user to the system'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                minLength={8}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
              {isEdit && (
                <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password</p>
              )}
            </div>

            <div>
              <CustomSelect
                value={formData.role}
                onChange={(value) => handleChange({ target: { name: 'role', value } })}
                options={[
                  { value: 'staff', label: 'Staff' },
                  { value: 'restaurant_owner', label: 'Restaurant Owner' },
                ]}
                placeholder="Select Role"
                label="Role"
                icon={Shield}
                required
              />
            </div>

            <div>
              <CustomSelect
                value={formData.restaurant_id}
                onChange={(value) => handleChange({ target: { name: 'restaurant_id', value } })}
                options={restaurants.map((restaurant) => ({
                  value: restaurant.id.toString(),
                  label: restaurant.name,
                }))}
                placeholder="Select Restaurant"
                label="Restaurant"
                icon={Store}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Save size={18} />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

