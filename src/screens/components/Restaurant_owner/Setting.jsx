import React, { useState, useEffect } from 'react';
import settingsService from '../../../services/settingsService';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from '../../../contexts/AuthContext';

// Get base URL for storage files (without /api)
const STORAGE_BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL 
  : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000');
import {
  Settings,
  User,
  Building,
  Lock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Upload,
  Trash2,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Menu
} from 'lucide-react';

const Setting = () => {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User profile data - only fields that exist in users table
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: null,
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  // Restaurant data
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    plan: 'free',
    logo: null,
    cover_image: null
  });

  // URLs for images
  const [avatarUrl, setAvatarUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setInitialLoading(true);
      setError('');
      const response = await settingsService.getProfile();
      
      if (response.success) {
        // Set user data - only fields that exist in users table
        if (response.user) {
          const nameParts = (response.user.name || '').split(' ');
          setUserData(prevData => ({
            ...prevData,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: response.user.email ?? '',
            phone: response.user.phone ?? '',
            avatar: response.user.avatar ?? null
          }));
          if (response.user.avatar) {
            setAvatarUrl(`${STORAGE_BASE_URL}/storage/${response.user.avatar}`);
          } else {
            setAvatarUrl('');
          }
        }

        // Set restaurant data
        if (response.restaurant) {
          setRestaurantData({
            name: response.restaurant.name ?? '',
            phone: response.restaurant.phone ?? '',
            address: response.restaurant.address ?? '',
            city: response.restaurant.city ?? '',
            country: response.restaurant.country ?? '',
            plan: response.restaurant.plan ?? 'free',
            logo: response.restaurant.logo ?? null,
            cover_image: response.restaurant.cover_image ?? null
          });
          if (response.restaurant.logo) {
            setLogoUrl(`${STORAGE_BASE_URL}/storage/${response.restaurant.logo}`);
          } else {
            setLogoUrl('');
          }
          if (response.restaurant.cover_image) {
            setCoverUrl(`${STORAGE_BASE_URL}/storage/${response.restaurant.cover_image}`);
          } else {
            setCoverUrl('');
          }
        }
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile data');
    } finally {
      setInitialLoading(false);
    }
  };

  // Handle user profile update
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const fullName = `${userData.firstName} ${userData.lastName}`.trim();
      
      // Validate required fields
      if (!fullName) {
        setError('First name and last name are required');
        setLoading(false);
        return;
      }
      
      if (!userData.email || !userData.email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      
      // Build update data with only fields that backend accepts
      const updateData = {
        name: fullName,
        email: userData.email.trim(),
        phone: userData.phone && userData.phone.trim() !== '' ? userData.phone.trim() : null,
      };

      // Only include password fields if user is trying to change password
      if (userData.new_password && userData.new_password.trim() !== '') {
        if (!userData.current_password || !userData.current_password.trim()) {
          setError('Current password is required to change password');
          setLoading(false);
          return;
        }
        updateData.current_password = userData.current_password;
        updateData.new_password = userData.new_password;
        updateData.new_password_confirmation = userData.new_password_confirmation;
      }
      
      const response = await settingsService.updateProfile(updateData);
      if (response.success) {
        setSuccess('Profile updated successfully!');
        // Clear password fields after successful update
        setUserData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        }));
        // Update avatar URL if changed
        if (response.user && response.user.avatar_url) {
          setAvatarUrl(response.user.avatar_url);
        }
        // Update AuthContext and localStorage with the new user data
        if (response.user) {
          // Update user data in AuthContext - preserve all existing fields
          updateUser({
            name: response.user.name || fullName,
            email: response.user.email || userData.email,
            phone: response.user.phone !== undefined ? response.user.phone : userData.phone,
            avatar: response.user.avatar || response.user.avatar_url || null
          });
        } else {
          // If response doesn't have user object, update with what we sent
          updateUser({
            name: fullName,
            email: userData.email,
            phone: userData.phone || null
          });
        }
        // Refresh profile data to get updated information
        await fetchProfileData();
      }
    } catch (err) {
      // Handle validation errors from backend
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(', ');
        setError(errorMessages || err.message || 'Failed to update profile');
      } else {
        setError(err.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle restaurant update
  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { logo, cover_image, ...restaurantUpdateData } = restaurantData;
      const response = await settingsService.updateRestaurant(restaurantUpdateData);
      if (response.success) {
        setSuccess('Restaurant updated successfully!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, JPG, GIF)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await settingsService.updateAvatar(file);
      if (response.success) {
        setSuccess('Avatar updated successfully!');
        setAvatarUrl(response.avatar_url);
        fetchProfileData();
      }
    } catch (err) {
      // Handle validation errors from backend
      if (err.errors && err.errors.avatar) {
        setError(err.errors.avatar.join(', '));
      } else {
        setError(err.message || 'Failed to update avatar');
      }
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle avatar delete
  const handleAvatarDelete = async () => {
    try {
      const response = await settingsService.deleteAvatar();
      if (response.success) {
        setSuccess('Avatar deleted successfully!');
        setAvatarUrl('');
        setUserData(prev => ({ ...prev, avatar: null }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, JPG, GIF)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await settingsService.updateRestaurantLogo(file);
      if (response.success) {
        setSuccess('Logo updated successfully!');
        setLogoUrl(response.logo_url);
        fetchProfileData();
      }
    } catch (err) {
      // Handle validation errors from backend
      if (err.errors && err.errors.logo) {
        setError(err.errors.logo.join(', '));
      } else {
        setError(err.message || 'Failed to update logo');
      }
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle logo delete
  const handleLogoDelete = async () => {
    try {
      const response = await settingsService.deleteRestaurantLogo();
      if (response.success) {
        setSuccess('Logo deleted successfully!');
        setLogoUrl('');
        setRestaurantData(prev => ({ ...prev, logo: null }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, JPG, GIF)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await settingsService.updateRestaurantCover(file);
      if (response.success) {
        setSuccess('Cover image updated successfully!');
        setCoverUrl(response.cover_image_url);
        fetchProfileData();
      }
    } catch (err) {
      // Handle validation errors from backend
      if (err.errors && err.errors.cover_image) {
        setError(err.errors.cover_image.join(', '));
      } else {
        setError(err.message || 'Failed to update cover image');
      }
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle cover image delete
  const handleCoverDelete = async () => {
    try {
      const response = await settingsService.deleteRestaurantCover();
      if (response.success) {
        setSuccess('Cover image deleted successfully!');
        setCoverUrl('');
        setRestaurantData(prev => ({ ...prev, cover_image: null }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await settingsService.changePassword({
        current_password: userData.current_password,
        new_password: userData.new_password,
        new_password_confirmation: userData.new_password_confirmation
      });
      if (response.success) {
        setSuccess('Password changed successfully!');
        setUserData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Close mobile menu when tab is selected
  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-white rounded-xl p-4 shadow-lg border border-slate-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-slate-700" />
              <span className="text-slate-700 font-semibold">Settings Menu</span>
            </div>
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className={`lg:col-span-1 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 lg:sticky lg:top-6">
              <h3 className="text-slate-700 text-lg font-semibold mb-4 flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Settings className="w-5 h-5" />
                <span>Navigation</span>
              </h3>
              <nav className="space-y-1 sm:space-y-2">
                {[
                  { id: 'profile', label: 'Profile Settings', icon: User },
                  { id: 'restaurant', label: 'Restaurant Settings', icon: Building },
                  { id: 'password', label: 'Change Password', icon: Lock }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 sm:px-5 py-3 sm:py-4 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-slate-200">
              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 flex justify-between items-center">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{error}</span>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 flex justify-between items-center">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{success}</span>
                  </div>
                  <button
                    onClick={() => setSuccess('')}
                    className="text-green-500 hover:text-green-700 transition-colors flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}

              {/* Profile Settings Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Profile Information</h2>
                      <p className="text-slate-600 mt-1 text-sm sm:text-base">Update your personal information and profile picture</p>
                    </div>
                  </div>

                  {/* Avatar Section */}
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-6 bg-slate-50 mb-6 sm:mb-8">
                    <h3 className="text-slate-700 text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center space-x-2">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Profile Picture</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl border-2 border-slate-300 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center space-y-1 sm:space-y-2 text-slate-400">
                            <User className="w-6 h-6 sm:w-8 sm:h-8" />
                            <span className="text-xs sm:text-sm">No Avatar</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-auto">
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg, image/gif"
                          onChange={handleAvatarUpload}
                          id="avatar-upload"
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Upload New Avatar</span>
                        </label>
                        {avatarUrl && (
                          <button
                            onClick={handleAvatarDelete}
                            className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 text-sm sm:text-base"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Remove Avatar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleUserSubmit}>
                    <div className="space-y-4 sm:space-y-6 max-w-2xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-sm sm:text-base">First Name *</span>
                          </label>
                          <input
                            type="text"
                            value={userData.firstName}
                            onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                            required
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-sm sm:text-base">Last Name *</span>
                          </label>
                          <input
                            type="text"
                            value={userData.lastName}
                            onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                            required
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">Email Address *</span>
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                          required
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">Phone Number</span>
                        </label>
                        <input
                          type="text"
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          placeholder="+212 XXX XXX XXX"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Update Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Restaurant Settings Tab */}
              {activeTab === 'restaurant' && (
                <div>
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Restaurant Information</h2>
                      <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage your restaurant details and branding</p>
                    </div>
                  </div>

                  {/* Logo Section */}
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-6 bg-slate-50 mb-6 sm:mb-8">
                    <h3 className="text-slate-700 text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center space-x-2">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Restaurant Logo</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl border-2 border-slate-300 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Restaurant Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center space-y-1 sm:space-y-2 text-slate-400">
                            <Building className="w-6 h-6 sm:w-8 sm:h-8" />
                            <span className="text-xs sm:text-sm">No Logo</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-auto">
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg, image/gif"
                          onChange={handleLogoUpload}
                          id="logo-upload"
                          className="hidden"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Upload Logo</span>
                        </label>
                        {logoUrl && (
                          <button
                            onClick={handleLogoDelete}
                            className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 text-sm sm:text-base"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Remove Logo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Section */}
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-6 bg-slate-50 mb-6 sm:mb-8">
                    <h3 className="text-slate-700 text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center space-x-2">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Cover Image</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                      <div className="w-full sm:w-48 lg:w-64 h-32 sm:h-36 lg:h-40 rounded-2xl border-2 border-slate-300 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                        {coverUrl ? (
                          <img src={coverUrl} alt="Restaurant Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center space-y-1 sm:space-y-2 text-slate-400">
                            <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
                            <span className="text-xs sm:text-sm">No Cover Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-auto">
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg, image/gif"
                          onChange={handleCoverUpload}
                          id="cover-upload"
                          className="hidden"
                        />
                        <label
                          htmlFor="cover-upload"
                          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Upload Cover</span>
                        </label>
                        {coverUrl && (
                          <button
                            onClick={handleCoverDelete}
                            className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 text-sm sm:text-base"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Remove Cover</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleRestaurantSubmit}>
                    <div className="space-y-4 sm:space-y-6 max-w-2xl">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                          <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">Restaurant Name *</span>
                        </label>
                        <input
                          type="text"
                          value={restaurantData.name}
                          onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
                          required
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-sm sm:text-base">Phone Number</span>
                          </label>
                          <input
                            type="text"
                            value={restaurantData.phone}
                            onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-sm sm:text-base">Plan</span>
                          </label>
                          <select
                            value={restaurantData.plan}
                            onChange={(e) => setRestaurantData({ ...restaurantData, plan: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">Address</span>
                        </label>
                        <input
                          type="text"
                          value={restaurantData.address}
                          onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-sm sm:text-base">City</span>
                          </label>
                          <input
                            type="text"
                            value={restaurantData.city}
                            onChange={(e) => setRestaurantData({ ...restaurantData, city: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-sm sm:text-base">Country</span>
                          </label>
                          <input
                            type="text"
                            value={restaurantData.country}
                            onChange={(e) => setRestaurantData({ ...restaurantData, country: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Update Restaurant</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lock className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Change Password</h2>
                      <p className="text-slate-600 mt-1 text-sm sm:text-base">Update your password to keep your account secure</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-4 sm:space-y-6 max-w-2xl">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">Current Password *</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? "text" : "password"}
                            value={userData.current_password}
                            onChange={(e) => setUserData({ ...userData, current_password: e.target.value })}
                            required
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-10 sm:pr-12 text-sm sm:text-base"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {showPassword.current ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">New Password *</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? "text" : "password"}
                            value={userData.new_password}
                            onChange={(e) => setUserData({ ...userData, new_password: e.target.value })}
                            required
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-10 sm:pr-12 text-sm sm:text-base"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {showPassword.new ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-2">
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">Confirm New Password *</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? "text" : "password"}
                            value={userData.new_password_confirmation}
                            onChange={(e) => setUserData({ ...userData, new_password_confirmation: e.target.value })}
                            required
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-10 sm:pr-12 text-sm sm:text-base"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {showPassword.confirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Changing...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Change Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;