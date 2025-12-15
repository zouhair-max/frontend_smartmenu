import { api } from './api';

class MealsService {
  // Get all meals for a restaurant
  getMealsByRestaurant(restaurantId) {
    return api.get('/owner/meals', { 
      params: { restaurant_id: restaurantId } 
    });
  }

  // Get all meals with optional filters
  getAllMeals(params = {}) {
    return api.get('/owner/meals', { params });
  }

  // Get a single meal by ID
  getMeal(id) {
    return api.get(`/owner/meals/${id}`);
  }

  // Create a new meal
  createMeal(mealData) {
    // api.post automatically handles FormData - no need to set Content-Type manually
    return api.post('/owner/meals', mealData);
  }

  // Update an existing meal
  updateMeal(id, mealData) {
    // api.post automatically handles FormData - no need to set Content-Type manually
    return api.post(`/owner/meals/${id}`, mealData);
  }

  // Delete a meal
  deleteMeal(id) {
    return api.delete(`/owner/meals/${id}`);
  }

  // Toggle meal availability
  toggleAvailability(id) {
    return api.post(`/owner/meals/${id}/toggle-availability`);
  }

  // Get meal options and extras
  getMealOptionsExtras(id) {
    return api.get(`/owner/meals/${id}/options-extras`);
  }

  // Add option to meal
  addOption(mealId, optionData) {
    return api.post(`/owner/meals/${mealId}/options`, optionData);
  }

  // Add extra to meal
  addExtra(mealId, extraData) {
    return api.post(`/owner/meals/${mealId}/extras`, extraData);
  }

  // Delete option
  deleteOption(optionId) {
    return api.delete(`/owner/meals/options/${optionId}`);
  }

  // Delete extra
  deleteExtra(extraId) {
    return api.delete(`/owner/meals/extras/${extraId}`);
  }

  // Update meal order (for drag & drop sorting)
  updateOrder(meals) {
    return api.post('/owner/meals/update-order', { meals });
  }
}

// Export as both default and named export for flexibility
export const mealService = new MealsService();
export default mealService;