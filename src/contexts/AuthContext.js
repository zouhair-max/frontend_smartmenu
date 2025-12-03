// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api'; // Adjust import path

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // Set the token for API calls
        api.setToken(token);
        
        // Verify token is still valid by making a simple API call
        await api.get('/user'); 
        
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Token validation failed:', error);
        handleLogout();
      }
    }
    
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (response.success) {
        const { user: userData, token } = response.data;
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.setToken(token);
        
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Don't redirect here, let the component handle it
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      handleLogout();
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUserData) => {
    if (!user) {
      console.warn('Cannot update user: user is not set');
      return;
    }
    // Merge with existing user data to preserve all fields (id, role, etc.)
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    // Update localStorage as well
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};