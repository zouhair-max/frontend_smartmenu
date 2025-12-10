import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Users, Mail, Phone, Shield, ImageIcon } from 'lucide-react';
import staffService from '../../../../services/StaffService';

// Enhanced Loading Spinner
const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Saving Staff Member</h3>
        <p className="text-gray-600 mb-4">Please wait while we process your request</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const StaffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    avatar: '',
    is_active: true
  });

  useEffect(() => {
    if (isEdit) {
      fetchStaff();
    }
  }, [id]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaff(id);
      const staff = response.data || response;
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        password: '',
        password_confirmation: '',
        avatar: staff.avatar || '',
        is_active: staff.is_active ?? true
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone?.trim() || '',
        avatar: formData.avatar?.trim() || '',
        is_active: formData.is_active,
      };

      if (formData.password) {
        submitData.password = formData.password;
        submitData.password_confirmation = formData.password_confirmation;
      }

      if (isEdit) {
        const response = await staffService.updateStaff(id, submitData);
        if (response.success) {
          navigate('/Staffs');
        } else {
          setError(response.message || 'Failed to update staff member');
        }
      } else {
        if (!formData.password) {
          setError('Password is required for new staff');
          setLoading(false);
          return;
        }
        const response = await staffService.createStaff(submitData);
        if (response.success) {
          navigate('/Staffs');
        } else {
          setError(response.message || 'Failed to create staff member');
        }
      }
    } catch (err) {
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(err.message || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner />}
      
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-orange-500 rounded-full shadow-lg">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                {isEdit ? 'Edit Staff Member' : 'Add New Staff'}
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              {isEdit ? 'Update staff member information' : 'Add a new team member to your restaurant'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
              <div className="flex-shrink-0">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-red-800 text-sm flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Avatar URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEdit}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
                      placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      required={!isEdit && formData.password}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                        formData.is_active ? 'bg-orange-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        formData.is_active ? 'transform translate-x-6' : ''
                      }`}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                      Active Staff Member
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/Staffs')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  {loading ? 'Saving...' : (isEdit ? 'Update Staff' : 'Create Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffForm;

