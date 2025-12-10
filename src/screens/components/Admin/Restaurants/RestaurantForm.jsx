import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../../../services/adminService';
import LoadingSpinner from '../../Restaurant_owner/components/LoadingSpinner';
import CustomSelect from '../../Restaurant_owner/components/CustomSelect';
import { ArrowLeft, Save, Package } from 'lucide-react';

const RestaurantForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    plan: 'free',
    logo: '',
    cover_image: '',
    is_active: true,
    // Owner fields (for create)
    owner_name: '',
    owner_email: '',
    owner_password: '',
    owner_phone: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchRestaurant();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoadingData(true);
      const response = await adminService.getRestaurant(id);
      if (response.success) {
        const restaurant = response.data;
        setFormData({
          name: restaurant.name || '',
          slug: restaurant.slug || '',
          phone: restaurant.phone || '',
          address: restaurant.address || '',
          city: restaurant.city || '',
          country: restaurant.country || '',
          plan: restaurant.plan || 'free',
          logo: restaurant.logo || '',
          cover_image: restaurant.cover_image || '',
          is_active: restaurant.is_active !== undefined ? restaurant.is_active : true,
        });
      } else {
        setError(response.message || 'Failed to load restaurant');
      }
    } catch (err) {
      setError('Unable to load restaurant data');
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
      let response;
      if (isEdit) {
        response = await adminService.updateRestaurant(id, formData);
      } else {
        response = await adminService.createRestaurant(formData);
      }

      if (response.success) {
        navigate('/admin/restaurants');
      } else {
        setError(response.message || 'Failed to save restaurant');
        if (response.errors) {
          console.error('Validation errors:', response.errors);
        }
      }
    } catch (err) {
      setError(err.message || 'Error saving restaurant');
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
            onClick={() => navigate('/admin/restaurants')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Restaurant' : 'Create Restaurant'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {isEdit ? 'Update restaurant information' : 'Add a new restaurant to the system'}
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
          {/* Restaurant Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h2>
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
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
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
                <CustomSelect
                  value={formData.plan}
                  onChange={(value) => handleChange({ target: { name: 'plan', value } })}
                  options={[
                    { value: 'free', label: 'Free' },
                    { value: 'premium', label: 'Premium' },
                  ]}
                  placeholder="Select Plan"
                  label="Plan"
                  icon={Package}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  name="cover_image"
                  value={formData.cover_image}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>

              {isEdit && (
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
              )}
            </div>
          </div>

          {/* Owner Information (only for create) */}
          {!isEdit && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleChange}
                    required={!isEdit}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="owner_email"
                    value={formData.owner_email}
                    onChange={handleChange}
                    required={!isEdit}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="owner_password"
                    value={formData.owner_password}
                    onChange={handleChange}
                    required={!isEdit}
                    minLength={8}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone</label>
                  <input
                    type="text"
                    name="owner_phone"
                    value={formData.owner_phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/restaurants')}
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

export default RestaurantForm;

