import { api } from './api';

export const tableService = {
  // Get all tables for the authenticated restaurant
  async getTables() {
    try {
      const response = await api.get('/owner/restaurant-tables');
      // api.get() already returns the JSON data directly
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch tables');
    }
  },

  // Get specific table by ID
  async getTable(id) {
    try {
      const response = await api.get(`/owner/restaurant-tables/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch table');
    }
  },

  // Create a new table
  async createTable(tableData) {
    try {
      const response = await api.post('/owner/restaurant-tables', tableData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create table');
    }
  },

  // Update a table
  async updateTable(id, tableData) {
    try {
      const response = await api.put(`/owner/restaurant-tables/${id}`, tableData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update table');
    }
  },

  // Delete a table
  async deleteTable(id) {
    try {
      const response = await api.delete(`/owner/restaurant-tables/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete table');
    }
  },

  // Generate new QR code for a table
  async generateNewQrCode(id) {
    try {
      const response = await api.post(`/owner/restaurant-tables/${id}/generate-qr`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to generate QR code');
    }
  },

  // Get QR code URL
  async getQrCode(id) {
    try {
      const response = await api.get(`/owner/restaurant-tables/${id}/qr-code`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch QR code');
    }
  }
};

export default tableService;