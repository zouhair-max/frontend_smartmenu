import { api } from './api';

class CategoryApi {
  
  // GET all categories
  async getCategories() {
    try {
      const response = await api.get('/owner/categories');
      // API returns {success: true, data: [...]}, so return the full response
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // CREATE category
  async createCategory(formData) {
    try {
      // Validate required fields - check if at least one translation exists
      const nameEn = formData.get('name[en]');
      const nameAr = formData.get('name[ar]');
      const nameFr = formData.get('name[fr]');
      
      const hasName = (nameEn && nameEn.toString().trim()) || 
                     (nameAr && nameAr.toString().trim()) || 
                     (nameFr && nameFr.toString().trim());
      
      if (!hasName) {
        throw { 
          message: 'Name field is required in at least one language',
          errors: { name: ['The name field is required in at least one language.'] },
          success: false
        };
      }

      const response = await api.post('/owner/categories', formData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // UPDATE category
  async updateCategory(id, formData) {
    try {
      // Validate required fields - check if at least one translation exists
      const nameEn = formData.get('name[en]');
      const nameAr = formData.get('name[ar]');
      const nameFr = formData.get('name[fr]');
      
      const hasName = (nameEn && nameEn.toString().trim()) || 
                     (nameAr && nameAr.toString().trim()) || 
                     (nameFr && nameFr.toString().trim());
      
      if (!hasName) {
        throw { 
          message: 'Name field is required in at least one language',
          errors: { name: ['The name field is required in at least one language.'] },
          success: false
        };
      }

      // Laravel often requires POST with _method=PUT for FormData uploads
      // Add _method to FormData for Laravel method spoofing
      formData.append('_method', 'PUT');
      
      const response = await api.post(`/owner/categories/${id}`, formData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // GET single category
  async getCategory(id) {
    try {
      const response = await api.get(`/owner/categories/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE category
  async deleteCategory(id) {
    try {
      const response = await api.delete(`/owner/categories/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // UPDATE category order
  async updateCategoryOrder(categories) {
    try {
      const response = await api.patch('/owner/categories/update-order', {
        categories
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    // If it's already a structured error from our API (fetch-based errors from api.js)
    if (error.errors !== undefined || error.success !== undefined) {
      return {
        message: error.message || 'An error occurred',
        errors: error.errors || {},
        success: error.success || false
      };
    }

    // If it's our custom validation error (thrown in createCategory/updateCategory)
    if (error.errors !== undefined) {
      return error;
    }

    // Network errors
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network'))) {
      return { 
        message: 'Network error: Could not connect to server',
        errors: {},
        success: false
      };
    }

    // Default error
    return { 
      message: error.message || 'An unexpected error occurred',
      errors: error.errors || {},
      success: false
    };
  }
}

export default new CategoryApi();