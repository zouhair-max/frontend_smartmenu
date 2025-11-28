import {api} from './api'; // Import as default

class MealsService {
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
    return api.post('/owner/meals', mealData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Update an existing meal
  updateMeal(id, mealData) {
    return api.post(`/owner/meals/${id}`, mealData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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

export default new MealsService();