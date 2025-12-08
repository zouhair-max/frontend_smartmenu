// Application Constants

// API Configuration
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
  },
  USER: {
    PROFILE: '/user',
    UPDATE: '/user',
  },
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: '/categories',
    DELETE: '/categories',
    REORDER: '/categories/reorder',
  },
  MEALS: {
    LIST: '/meals',
    CREATE: '/meals',
    UPDATE: '/meals',
    DELETE: '/meals',
    BY_RESTAURANT: '/meals/restaurant',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders',
    DELETE: '/orders',
    BY_RESTAURANT: '/orders/restaurant',
  },
  STAFF: {
    LIST: '/staff',
    CREATE: '/staff',
    UPDATE: '/staff',
    DELETE: '/staff',
  },
  TABLES: {
    LIST: '/tables',
    CREATE: '/tables',
    UPDATE: '/tables',
    DELETE: '/tables',
  },
  DASHBOARD: {
    DATA: '/dashboard',
  },
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
  PAGE_MENU: {
    GET: '/page-menu',
  },
};

// User Roles
export const USER_ROLES = {
  RESTAURANT_OWNER: 'restaurant_owner',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  LANGUAGE: 'language',
  THEME: 'theme',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/login/ForegetPassword',
  DASHBOARD: '/dashboard',
  MEALS: '/meals',
  MEALS_CREATE: '/meals/create',
  MEALS_EDIT: '/meals/:id/edit',
  CATEGORIES: '/categories',
  CATEGORIES_CREATE: '/categories/create',
  CATEGORIES_EDIT: '/categories/:id/edit',
  ORDERS: '/orders',
  ORDERS_CREATE: '/orders/create',
  STAFF: '/Staffs',
  STAFF_CREATE: '/Staffs/create',
  STAFF_EDIT: '/Staffs/:id/edit',
  TABLES: '/Restaurant_Tables',
  TABLES_CREATE: '/Restaurant_Tables/create',
  TABLES_EDIT: '/Restaurant_Tables/:id/edit',
  SETTINGS: '/settings',
  PAGE_MENU: '/Pagemenu/:restaurant_id/:table_id',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error: Could not connect to server',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to access this resource',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Server error: Please try again later',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created',
  UPDATED: 'Successfully updated',
  DELETED: 'Successfully deleted',
  SAVED: 'Successfully saved',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
};

