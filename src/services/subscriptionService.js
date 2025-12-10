import { api } from './api';

/**
 * Subscription Service
 * Handles all subscription-related API calls
 */
class SubscriptionService {
  /**
   * Create a Stripe Checkout session
   * @param {number} planId - The ID of the plan to subscribe to
   * @returns {Promise<{success: boolean, checkout_url?: string, session_id?: string, message?: string}>}
   */
  async createCheckoutSession(planId) {
    try {
      const response = await api.post('/checkout', {
        plan_id: planId,
      });

      return {
        success: true,
        checkout_url: response.checkout_url,
        session_id: response.session_id,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        message: error.message || 'Failed to create checkout session. Please try again.',
        errors: error.errors || {},
      };
    }
  }

  /**
   * Get user's subscription details
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async getSubscription() {
    try {
      const response = await api.get('/me/subscription');
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch subscription details.',
        data: null,
      };
    }
  }

  /**
   * Redirect to Stripe Checkout
   * @param {string} checkoutUrl - The Stripe Checkout URL
   */
  redirectToCheckout(checkoutUrl) {
    if (!checkoutUrl) {
      throw new Error('Checkout URL is required');
    }
    window.location.href = checkoutUrl;
  }
}

export const subscriptionService = new SubscriptionService();


