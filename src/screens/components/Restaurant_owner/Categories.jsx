import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Image, X, Search, Grid, List, ChefHat, Utensils, Menu } from 'lucide-react';
import CategoryApi from '../../../services/categoryApi';
import { getCategoryName } from '../../../utils/translations';

// Get base URL for storage files (without /api)
// Use the same base URL as API service but without /api suffix
// If REACT_APP_API_URL is not set, try to detect from window location or use production URL
const getStorageBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // If in production (not localhost), use production URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://backend-endsmartmenu-production.up.railway.app';
  }
  // Default to localhost for development
  return 'http://localhost:8000';
};

const STORAGE_BASE_URL = getStorageBaseUrl();

// Helper function to build image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  let path = imagePath;
  // Remove leading slash if present
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  // If path already includes 'storage/', don't add it again
  if (path.startsWith('storage/')) {
    return `${STORAGE_BASE_URL}/${path}`;
  }
  // Otherwise, add 'storage/' prefix
  return `${STORAGE_BASE_URL}/storage/${path}`;
};

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await CategoryApi.getCategories();
      
      if (result.success) {
        const categoriesData = result.data || [];
        setCategories(categoriesData);
      } else {
        setError(result.message || 'Failed to load categories');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    navigate(`/categories/${category.id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    setLoading(true);
    try {
      const result = await CategoryApi.deleteCategory(id);
      if (result.success) {
        setSuccess('Category deleted successfully!');
        fetchCategories();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };


  const clearError = () => setError('');
  const clearSuccess = () => setSuccess('');

  const filteredCategories = categories.filter(cat => {
    const categoryName = getCategoryName(cat, 'en') || cat.name || '';
    return categoryName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Enhanced Loading Component with Orange/Amber Theme
  const CategoriesLoadingSpinner = () => (
    <div className="w-full bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4 rounded-2xl">
      <div className="text-center">
        {/* Animated Logo Container */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          
          {/* Inner rotating ring - opposite direction */}
          <div className="absolute inset-2 rounded-full border-4 border-amber-200 border-b-amber-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-2 shadow-lg">
              <ChefHat className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Menu className="w-5 h-5 text-orange-500" />
            Loading Categories
          </h3>
          <p className="text-gray-600 font-medium">Preparing your menu...</p>
        </div>

        {/* Animated Loading Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1.5 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full animate-pulse"></div>
        </div>

        {/* Additional Context */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Utensils className="w-3 h-3" />
            <span>Loading your categories</span>
          </div>
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div className="absolute top-10 left-10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
        <div className="w-8 h-8 bg-orange-100 rounded-full opacity-50"></div>
      </div>
      <div className="absolute bottom-10 right-10 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
        <div className="w-12 h-12 bg-amber-100 rounded-full opacity-50"></div>
      </div>
    </div>
  );

  return (
    <div className=" w-full">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2 justify-center sm:justify-start">
                <Menu className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                Categories
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Organize and manage your menu categories
              </p>
            </div>
            <button 
              onClick={() => navigate('/categories/create')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Add Category</span>
            </button>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-sm border border-orange-100">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base bg-white/50"
              />
            </div>
            <div className="flex gap-1 bg-orange-100 rounded-lg p-1 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-orange-600 transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-orange-200'
                }`}
              >
                <Grid size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-orange-600 transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-orange-200'
                }`}
              >
                <List size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3 mb-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex justify-between items-center animate-fade-in">
              <span className="text-sm sm:text-base">{error}</span>
              <button onClick={clearError} className="text-red-700 hover:text-red-900 flex-shrink-0 ml-2">
                <X size={16} />
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex justify-between items-center animate-fade-in">
              <span className="text-sm sm:text-base">{success}</span>
              <button onClick={clearSuccess} className="text-green-700 hover:text-green-900 flex-shrink-0 ml-2">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && <CategoriesLoadingSpinner />}

        {/* Empty State */}
        {!loading && filteredCategories.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 sm:p-8 md:p-12 text-center border border-orange-100">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-100 mb-4">
              <Image size={32} className="sm:w-10 sm:h-10 text-orange-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search terms or create a new category' : 'Start organizing your menu by creating your first category'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/categories/create')}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 text-sm sm:text-base"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                Add Your First Category
              </button>
            )}
          </div>
        )}

        {/* Categories Grid View */}
        {!loading && filteredCategories.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-100 hover:border-orange-300 hover:transform hover:-translate-y-1"
              >
                <div className="relative h-36 sm:h-48 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
                  {category.image ? (
                    <img
                      src={getImageUrl(category.image)}
                      alt={getCategoryName(category, 'en') || category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Failed to load category image:', {
                          categoryId: category.id,
                          categoryName: getCategoryName(category, 'en'),
                          imagePath: category.image,
                          fullUrl: getImageUrl(category.image),
                          storageBaseUrl: STORAGE_BASE_URL
                        });
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Image size={32} className="sm:w-12 sm:h-12 text-orange-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => handleEdit(category)}
                      disabled={loading}
                      className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-orange-50 transition-all duration-200 hover:scale-110 disabled:opacity-50"
                    >
                      <Edit size={14} className="sm:w-4 sm:h-4 text-orange-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={loading}
                      className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-red-50 transition-all duration-200 hover:scale-110 disabled:opacity-50"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-1">
                    {getCategoryName(category, 'en') || category.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <span>Order: {category.order}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories List View */}
        {!loading && filteredCategories.length > 0 && viewMode === 'list' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm overflow-hidden border border-orange-100">
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-orange-50/50 transition-all duration-200 group ${
                  index !== filteredCategories.length - 1 ? 'border-b border-orange-100' : ''
                }`}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {category.image ? (
                    <img
                      src={getImageUrl(category.image)}
                      alt={getCategoryName(category, 'en') || category.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Failed to load category image in list view:', {
                          categoryId: category.id,
                          categoryName: getCategoryName(category, 'en'),
                          imagePath: category.image,
                          fullUrl: getImageUrl(category.image),
                          storageBaseUrl: STORAGE_BASE_URL
                        });
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Image size={20} className="sm:w-6 sm:h-6 text-orange-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1 truncate">
                    {getCategoryName(category, 'en') || category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Order: {category.order} • ID: {category.id}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEdit(category)}
                    disabled={loading}
                    className="p-1.5 sm:p-2 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                  >
                    <Edit size={16} className="sm:w-5 sm:h-5 text-orange-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={loading}
                    className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                  >
                    <Trash2 size={16} className="sm:w-5 sm:h-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}