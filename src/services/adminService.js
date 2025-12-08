import { api } from './api';

export const adminService = {
  // ============================================
  // DASHBOARD
  // ============================================
  
  getDashboard: async (period = 'all') => {
    return api.get('/admin/dashboard', {
      params: { period }
    });
  },

  // ============================================
  // RESTAURANT MANAGEMENT
  // ============================================
  
  getRestaurants: async (params = {}) => {
    return api.get('/admin/restaurants', { params });
  },

  getRestaurant: async (id) => {
    return api.get(`/admin/restaurants/${id}`);
  },

  createRestaurant: async (data) => {
    return api.post('/admin/restaurants', data);
  },

  updateRestaurant: async (id, data) => {
    return api.put(`/admin/restaurants/${id}`, data);
  },

  deleteRestaurant: async (id) => {
    return api.delete(`/admin/restaurants/${id}`);
  },

  toggleRestaurantStatus: async (id, isActive, blockUsers = false) => {
    return api.patch(`/admin/restaurants/${id}/toggle-status`, {
      is_active: isActive,
      block_users: blockUsers
    });
  },

  getRestaurantMeals: async (id, params = {}) => {
    return api.get(`/admin/restaurants/${id}/meals`, { params });
  },

  getRestaurantOrders: async (id, params = {}) => {
    return api.get(`/admin/restaurants/${id}/orders`, { params });
  },

  getRestaurantTables: async (id) => {
    return api.get(`/admin/restaurants/${id}/tables`);
  },

  getRestaurantUsers: async (id) => {
    return api.get(`/admin/restaurants/${id}/users`);
  },

  // ============================================
  // USER MANAGEMENT
  // ============================================
  
  getUsers: async (params = {}) => {
    return api.get('/admin/users', { params });
  },

  getUser: async (id) => {
    return api.get(`/admin/users/${id}`);
  },

  createUser: async (data) => {
    return api.post('/admin/users', data);
  },

  updateUser: async (id, data) => {
    return api.put(`/admin/users/${id}`, data);
  },

  deleteUser: async (id) => {
    return api.delete(`/admin/users/${id}`);
  },

  updateUserRole: async (id, role) => {
    return api.patch(`/admin/users/${id}/role`, { role });
  },

  toggleUserStatus: async (id, isActive) => {
    return api.patch(`/admin/users/${id}/toggle-status`, {
      is_active: isActive
    });
  },
};

