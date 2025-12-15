// Get API base URL from environment variables, fallback to default for development
// REACT_APP_API_URL should be the base URL (e.g., https://backend-endsmartmenu-production.up.railway.app)
// The /api path will be appended automatically
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    let url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    // Handle query parameters for GET requests
    if (options.params && Object.keys(options.params).length > 0) {
      const queryString = new URLSearchParams();
      Object.keys(options.params).forEach(key => {
        const value = options.params[key];
        if (value !== null && value !== undefined && value !== '') {
          queryString.append(key, value);
        }
      });
      url += `?${queryString.toString()}`;
    }

    // Check if data is FormData to handle multipart uploads
    const isFormData = options.body instanceof FormData;

    // Remove params and skipAuth from options as we've already processed them
    const { params, skipAuth, ...restOptions } = options;
    
    const config = {
      headers: {
        'Accept': 'application/json',
        ...restOptions.headers,
      },
      ...restOptions,
    };

    // Only set Content-Type to application/json if not FormData
    // For FormData, let the browser set it automatically with the boundary
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Remove Content-Type header for FormData - browser will set it with boundary
      delete config.headers['Content-Type'];
    }

    // Only add Authorization header if token exists and skipAuth is not true
    if (token && !skipAuth) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('Authentication required');
      }

      // Get content type to check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorData = {};
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (isJson) {
          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Failed to parse error JSON:', e);
          }
        } else {
          // If response is HTML, try to get text for debugging
          const text = await response.text().catch(() => '');
          console.error('Server returned HTML instead of JSON:', text.substring(0, 200));
          errorMessage = `Server error (${response.status}). The server returned an HTML page instead of JSON. Please check the API endpoint: ${url}`;
        }
        
        const error = new Error(errorMessage);
        // Preserve the full error structure
        error.errors = errorData.errors || {};
        error.success = errorData.success;
        error.status = response.status;
        throw error;
      }

      // Parse response as JSON only if content type indicates JSON
      if (isJson) {
        const data = await response.json();
        return data;
      } else {
        // If not JSON, return text (shouldn't happen for API calls, but handle gracefully)
        const text = await response.text();
        console.warn('API returned non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned an unexpected response format. Expected JSON.');
      }

    } catch (error) {
      console.error('API request failed:', {
        url,
        error: error.message,
        status: error.status
      });
      throw error;
    }
  }

  handleUnauthorized() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Dispatch event that components can listen to
    window.dispatchEvent(new Event('unauthorized'));
    
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, options);
  }

  // Public GET method that skips authentication
  publicGet(endpoint, options = {}) {
    return this.request(endpoint, { ...options, skipAuth: true });
  }

  // Public POST method that skips authentication
  publicPost(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    const requestOptions = {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      skipAuth: true,
      ...options,
    };
    return this.request(endpoint, requestOptions);
  }

  post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    const requestOptions = {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    };
    return this.request(endpoint, requestOptions);
  }

  put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    const requestOptions = {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    };
    return this.request(endpoint, requestOptions);
  }

  patch(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    const requestOptions = {
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    };
    return this.request(endpoint, requestOptions);
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }

  setToken(token) {
    localStorage.setItem('auth_token', token);
  }
}

// Export as default
export const api = new ApiService();