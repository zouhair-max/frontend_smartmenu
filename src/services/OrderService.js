// orderService.js
import { api } from './api';

export const orderService = {
  // Order methods
  async getAllOrders(restaurantId, filters = {}) {
    try {
      const params = { restaurant_id: restaurantId, ...filters };
      return await api.get('/owner/orders', { params });
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getOrderById(orderId) {
    try {
      return await api.get(`/owner/orders/${orderId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async createOrder(orderData) {
    try {
      return await api.post('/owner/orders', orderData);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateOrder(orderId, updateData) {
    try {
      return await api.put(`/owner/orders/${orderId}`, updateData);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async deleteOrder(orderId) {
    try {
      return await api.delete(`/owner/orders/${orderId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      return await api.patch(`/owner/orders/${orderId}/status`, { status });
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getOrdersByTable(tableId, filters = {}) {
    try {
      const params = { ...filters };
      return await api.get(`/owner/orders/table/${tableId}`, { params });
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Order Item methods
  async getAllOrderItems(filters = {}) {
    try {
      return await api.get('/owner/order-items', { params: filters });
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getOrderItemById(orderItemId) {
    try {
      return await api.get(`/owner/order-items/${orderItemId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async createOrderItem(orderItemData) {
    try {
      return await api.post('/owner/order-items', orderItemData);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateOrderItem(orderItemId, updateData) {
    try {
      return await api.put(`/owner/order-items/${orderItemId}`, updateData);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async deleteOrderItem(orderItemId) {
    try {
      return await api.delete(`/owner/order-items/${orderItemId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getOrderItemsByOrder(orderId) {
    try {
      return await api.get(`/owner/orders/${orderId}/items`);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Utility methods
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response;
      return {
        message: data.message || 'An error occurred',
        errors: data.errors || null,
        status: status,
        data: data
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1
      };
    }
  },

  // Order status constants
  STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Helper methods for status management
  canUpdateOrder(currentStatus) {
    // Allow updates for all statuses except completed and cancelled
    return currentStatus !== 'completed' && currentStatus !== 'cancelled';
  },

  getValidStatusTransitions(currentStatus) {
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served', 'cancelled'],
      served: ['completed'],
      completed: [],
      cancelled: []
    };
    return transitions[currentStatus] || [];
  },

  getStatusOrder(status) {
    const order = {
      pending: 1,
      confirmed: 2,
      preparing: 3,
      ready: 4,
      served: 5,
      completed: 6,
      cancelled: 0
    };
    return order[status] || 0;
  },

  getStatusLabel(status) {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      served: 'Served',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  },

  // Batch operations
  async addMultipleOrderItems(orderId, items) {
    try {
      const promises = items.map(item => 
        this.createOrderItem({
          ...item,
          order_id: orderId
        })
      );
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);
      
      return {
        successful,
        failed,
        total: items.length,
        successCount: successful.length,
        failureCount: failed.length
      };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Order calculations
  calculateOrderTotal(items) {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  }
};

export default orderService;