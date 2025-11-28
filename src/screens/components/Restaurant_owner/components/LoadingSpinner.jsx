import React from 'react';
import { Menu, ChefHat, Utensils } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated Logo Container */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          
          {/* Inner rotating ring - opposite direction */}
          <div className="absolute inset-2 rounded-full border-4 border-amber-200 border-b-amber-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <ChefHat className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Menu className="w-7 h-7 text-orange-500" />
            SmartMenu
          </h1>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>

        {/* Animated Loading Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1.5 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full animate-pulse"></div>
        </div>

        {/* Additional Context */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            <span>Preparing your menus</span>
          </div>
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div className="absolute top-20 left-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
        <div className="w-12 h-12 bg-orange-100 rounded-full opacity-50"></div>
      </div>
      <div className="absolute bottom-20 right-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
        <div className="w-16 h-16 bg-amber-100 rounded-full opacity-50"></div>
      </div>
      <div className="absolute top-40 right-32 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
        <div className="w-8 h-8 bg-orange-100 rounded-full opacity-50"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;