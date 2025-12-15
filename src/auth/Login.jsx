import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Utensils, Lock, Mail, AlertCircle, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      let redirectPath = '/dashboard'; // default
      if (user?.role === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (user?.role === 'staff') {
        redirectPath = '/Restaurant_Tables';
      } else if (user?.role === 'restaurant_owner') {
        redirectPath = '/dashboard';
      }
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault(); // Support both form submit and button click
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('Login successful');
        // Get user data from the result to determine redirect
        const userData = result.data?.user;
        let redirectPath = '/dashboard'; // default
        if (userData?.role === 'admin') {
          redirectPath = '/admin/dashboard';
        } else if (userData?.role === 'staff') {
          redirectPath = '/Restaurant_Tables';
        } else if (userData?.role === 'restaurant_owner') {
          redirectPath = '/dashboard';
        }
        navigate(redirectPath);
      } else {
        setErrors({ submit: result.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        submit: error.message || 'An error occurred during login. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const fillCredentials = (email, password) => {
    setFormData({
      email,
      password
    });
    setErrors({});
  };

  // Show loading while redirecting if authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4 shadow-lg">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Digital Menu</h1>
          <p className="text-gray-600">Sign in to manage your restaurant menu</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Global Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                  placeholder="you@restaurant.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start mb-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-blue-900">Test Credentials</h3>
            </div>
            <div className="space-y-3 text-xs">
              {/* Restaurant Owner */}
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="font-medium text-blue-900 mb-2">Restaurant Owner:</p>
                <button
                  type="button"
                  onClick={() => fillCredentials('zouhairboudeir0@gmail.com', 'zouhairboudeir0A@gmail.com')}
                  className="text-left w-full hover:bg-blue-50 p-2 rounded transition-colors"
                  disabled={isLoading}
                >
                  <p className="text-gray-700"><span className="font-medium">Email:</span> zouhairboudeir0@gmail.com</p>
                  <p className="text-gray-700"><span className="font-medium">Password:</span> zouhairboudeir0A@gmail.com</p>
                </button>
              </div>

              {/* Staff */}
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="font-medium text-blue-900 mb-2">Staff:</p>
                <button
                  type="button"
                  onClick={() => fillCredentials('staf@gmail.com', 'staf@gmail.com')}
                  className="text-left w-full hover:bg-blue-50 p-2 rounded transition-colors"
                  disabled={isLoading}
                >
                  <p className="text-gray-700"><span className="font-medium">Email:</span> staf@gmail.com</p>
                  <p className="text-gray-700"><span className="font-medium">Password:</span> staf@gmail.com</p>
                </button>
              </div>

              {/* Super Admin */}
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="font-medium text-blue-900 mb-2">Super Admin:</p>
                <button
                  type="button"
                  onClick={() => fillCredentials('SuperAdmin@gmail.com', 'SuperAdmin@gmail.com')}
                  className="text-left w-full hover:bg-blue-50 p-2 rounded transition-colors"
                  disabled={isLoading}
                >
                  <p className="text-gray-700"><span className="font-medium">Email:</span> SuperAdmin@gmail.com</p>
                  <p className="text-gray-700"><span className="font-medium">Password:</span> SuperAdmin@gmail.com</p>
                </button>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Simplify your restaurant experience</p>
          <p className="mt-1">© 2024 Digital Menu. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}