# Developer Guide

This guide provides information for developers working on the SmartMenu project.

## 📚 Table of Contents

- [Architecture](#architecture)
- [Code Style](#code-style)
- [Utilities & Hooks](#utilities--hooks)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## 🏗️ Architecture

### Component Structure

- **Public Components**: Authentication pages, landing page
- **Protected Components**: Dashboard, management pages (require authentication)
- **Role-Based Components**: Owner-only features (require specific role)

### State Management

- **Context API**: Used for global state (Auth, Loading)
- **Local State**: useState for component-specific state
- **Custom Hooks**: Reusable stateful logic

### API Layer

- **Service Classes**: Organized by domain (meals, orders, etc.)
- **Centralized API Service**: `src/services/api.js` handles all HTTP requests
- **Error Handling**: Centralized error handling with user-friendly messages

## 💻 Code Style

### Component Structure

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks';

// 2. Component
const MyComponent = () => {
  // 3. Hooks
  const { user } = useAuth();
  const [state, setState] = useState(null);
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 5. Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

### Naming Conventions

- **Components**: PascalCase (e.g., `MealForm.jsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useApi.js`)
- **Utilities**: camelCase (e.g., `errorHandler.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

## 🛠️ Utilities & Hooks

### Using Custom Hooks

#### useApi Hook

```javascript
import { useApi } from '../hooks';
import { mealsService } from '../services/mealsService';

function MealsList() {
  const { data, loading, error, execute, reset } = useApi(mealsService.getAllMeals);
  
  useEffect(() => {
    execute();
  }, [execute]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* Render data */}</div>;
}
```

#### useDebounce Hook

```javascript
import { useState } from 'react';
import { useDebounce } from '../hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearch) {
      // Perform search API call
      searchAPI(debouncedSearch);
    }
  }, [debouncedSearch]);
  
  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

#### useLocalStorage Hook

```javascript
import { useLocalStorage } from '../hooks';

function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

### Using Utility Functions

#### Error Handling

```javascript
import { handleApiError, extractValidationErrors } from '../utils';

async function createMeal(mealData) {
  try {
    const response = await mealsService.createMeal(mealData);
    return { success: true, data: response };
  } catch (error) {
    const formattedError = handleApiError(error);
    
    // Handle validation errors
    if (formattedError.errors) {
      const validationErrors = extractValidationErrors(formattedError.errors);
      // Display validation errors to user
    }
    
    return { success: false, error: formattedError };
  }
}
```

#### Validation

```javascript
import { isValidEmail, validatePassword, validateRequired } from '../utils';

function validateForm(formData) {
  const errors = {};
  
  if (!validateRequired(formData.name, 'Name').valid) {
    errors.name = 'Name is required';
  }
  
  if (!isValidEmail(formData.email)) {
    errors.email = 'Invalid email address';
  }
  
  const passwordCheck = validatePassword(formData.password);
  if (!passwordCheck.valid) {
    errors.password = passwordCheck.message;
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
}
```

#### Formatting

```javascript
import { formatCurrency, formatDate, formatPhone } from '../utils';

function OrderCard({ order }) {
  return (
    <div>
      <p>Amount: {formatCurrency(order.total)}</p>
      <p>Date: {formatDate(order.created_at)}</p>
      <p>Phone: {formatPhone(order.customer_phone)}</p>
    </div>
  );
}
```

## ✅ Best Practices

### 1. Error Handling

Always handle errors gracefully:

```javascript
// ✅ Good
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  const formattedError = handleApiError(error);
  toast.error(formattedError.message);
}

// ❌ Bad
const result = await apiCall(); // No error handling
```

### 2. Loading States

Always show loading states:

```javascript
// ✅ Good
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <DataComponent data={data} />;

// ❌ Bad
return <DataComponent data={data} />; // No loading/error handling
```

### 3. Use Constants

Use constants instead of magic strings:

```javascript
// ✅ Good
import { ROUTES, USER_ROLES } from '../constants';
navigate(ROUTES.DASHBOARD);
if (user.role === USER_ROLES.RESTAURANT_OWNER) { }

// ❌ Bad
navigate('/dashboard');
if (user.role === 'restaurant_owner') { }
```

### 4. Component Lazy Loading

Use lazy loading for heavy components:

```javascript
// ✅ Good
const Dashboard = lazy(() => import('./Dashboard'));

// ❌ Bad
import Dashboard from './Dashboard'; // Loads immediately
```

## 🔄 Common Patterns

### API Call Pattern

```javascript
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getData();
        setData(response);
      } catch (err) {
        const formattedError = handleApiError(err);
        setError(formattedError);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Render logic
};
```

### Form Validation Pattern

```javascript
const MyForm = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    if (!validateRequired(formData.name, 'Name').valid) {
      newErrors.name = 'Name is required';
    }
    
    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // Submit form
    }
  };
  
  // Render form
};
```

## 🧪 Testing

### Component Testing

```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## 📝 Code Review Checklist

- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Constants used instead of magic strings
- [ ] Proper validation
- [ ] Accessibility considered
- [ ] No console.logs in production code
- [ ] Proper TypeScript types (if applicable)
- [ ] Code follows project structure
- [ ] No hardcoded values
- [ ] Environment variables used for configuration

## 🚀 Performance Tips

1. **Use React.memo** for expensive components
2. **Use useMemo/useCallback** for expensive computations
3. **Lazy load** heavy components
4. **Debounce** search inputs and API calls
5. **Optimize images** before uploading
6. **Code split** by route

## 📞 Support

For questions or issues, contact the development team.



