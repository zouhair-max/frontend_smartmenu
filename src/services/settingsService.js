import { api } from './api';

export const settingsService = {
  // Get complete profile (user + restaurant)
  async getProfile() {
    try {
      const response = await api.get('/owner/settings/profile');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/owner/settings/profile', profileData);
      return response;
    } catch (error) {
      // Preserve the full error object including validation errors
      // The error already contains errors object from api.js error handling
      throw error;
    }
  },

  // Update user avatar
  async updateAvatar(avatarFile) {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await api.post('/owner/settings/avatar', formData);
      return response;
    } catch (error) {
      // Preserve the full error object including validation errors
      throw error;
    }
  },

  // Delete user avatar
  async deleteAvatar() {
    try {
      const response = await api.delete('/owner/settings/avatar');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete avatar');
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.post('/owner/settings/change-password', passwordData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  },

  // Restaurant Settings
  async updateRestaurant(restaurantData) {
    try {
      const response = await api.put('/owner/settings/restaurant', restaurantData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update restaurant');
    }
  },

  async updateRestaurantLogo(logoFile) {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await api.post('/owner/settings/restaurant/logo', formData);
      return response;
    } catch (error) {
      // Preserve the full error object including validation errors
      throw error;
    }
  },

  async deleteRestaurantLogo() {
    try {
      const response = await api.delete('/owner/settings/restaurant/logo');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete restaurant logo');
    }
  },

  async updateRestaurantCover(coverFile) {
    try {
      const formData = new FormData();
      formData.append('cover_image', coverFile);
      
      const response = await api.post('/owner/settings/restaurant/cover', formData);
      return response;
    } catch (error) {
      // Preserve the full error object including validation errors
      throw error;
    }
  },

  async deleteRestaurantCover() {
    try {
      const response = await api.delete('/owner/settings/restaurant/cover');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete restaurant cover');
    }
  }
};

export default settingsService;