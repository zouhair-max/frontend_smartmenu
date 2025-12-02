import { api } from './api';

class StaffService {
  // Get all staff
  async getAllStaff() {
    try {
      return await api.get('/owner/staff');
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get single staff member
  async getStaff(id) {
    try {
      return await api.get(`/owner/staff/${id}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Create new staff
  async createStaff(staffData) {
    try {
      return await api.post('/owner/staff', staffData);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update staff
  async updateStaff(id, staffData) {
    try {
      return await api.put(`/owner/staff/${id}`, staffData);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete staff
  async deleteStaff(id) {
    try {
      return await api.delete(`/owner/staff/${id}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Search staff
  async searchStaff(query) {
    try {
      return await api.get(`/owner/staff/search/query?search=${query}`);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new StaffService();