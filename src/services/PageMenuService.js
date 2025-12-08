import { api } from './api';

export default class PageMenuService {
  static async getMenu(restaurantId, tableId) {
    try {
      // Use publicGet to skip authentication for public menu endpoint
      const response = await api.publicGet(`/menu/${restaurantId}/${tableId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch menu');
    }
  }

  static async createOrder(restaurantId, tableId, orderItems) {
    try {
      // Use public post (skipAuth) for public order endpoint
      const orderData = {
        restaurant_id: restaurantId,
        table_id: tableId,
        order_items: orderItems.map(item => ({
          meal_id: item.meal_id,
          quantity: item.quantity,
          price: item.price,
          note: item.note || null // Always include note field (nullable)
        }))
      };

      // Debug: Log the order data being sent
      console.log('Order data being sent:', JSON.stringify(orderData, null, 2));
      
      const response = await api.publicPost('/orders', orderData);
      return response;
    } catch (error) {
      // Handle validation errors and other errors
      if (error.errors) {
        const errorMessage = Object.values(error.errors)
          .flat()
          .join(', ');
        throw new Error(errorMessage || error.message || 'Failed to create order');
      }
      throw new Error(error.message || 'Failed to create order');
    }
  }

  static async getLastOrder(restaurantId, tableId) {
    try {
      // Use publicGet to skip authentication for public last order endpoint
      const response = await api.publicGet(`/orders/table/${restaurantId}/${tableId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch last order');
    }
  }
}