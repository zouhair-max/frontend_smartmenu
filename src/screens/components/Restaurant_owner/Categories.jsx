import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image, X, Search, Grid, List, Loader, ChefHat, Utensils, Menu } from 'lucide-react';
import CategoryApi from '../../../services/categoryApi';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [formData, setFormData] = useState({
    name: '',
    order: 0,
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'order' ? parseInt(value) || 0 : value 
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Category name is required');
      setModalLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('order', formData.order.toString());
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      let result;
      if (editingCategory) {
        result = await CategoryApi.updateCategory(editingCategory.id, submitData);
      } else {
        result = await CategoryApi.createCategory(submitData);
      }

      if (result.success) {
        setSuccess(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        resetForm();
        fetchCategories();
      } else {
        setError(result.message || 'Operation failed');
      }
    } catch (err) {
      console.error('API Error:', err);
      if (err.errors) {
        const errorMessages = Object.entries(err.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        setError(`Validation errors: ${errorMessages}`);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      order: category.order,
      image: null
    });
    setPreviewUrl(category.image_url || category.image || null);
    setShowModal(true);
    setError('');
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

  const resetForm = () => {
    setFormData({ name: '', order: 0, image: null });
    setEditingCategory(null);
    setPreviewUrl(null);
    setShowModal(false);
    setError('');
    setModalLoading(false);
  };

  const clearError = () => setError('');
  const clearSuccess = () => setSuccess('');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enhanced Loading Component with Orange/Amber Theme
  const CategoriesLoadingSpinner = () => (
    <div className="min-h-[60vh] bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4 rounded-2xl">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-8xl mx-auto">
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
              onClick={() => setShowModal(true)}
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
                onClick={() => setShowModal(true)}
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
                      src={`http://127.0.0.1:8000/storage/${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
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
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <span>Order: {category.order}</span>
                    <span className="font-mono">#{category.id}</span>
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
                      src={`http://127.0.0.1:8000/storage/${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Image size={20} className="sm:w-6 sm:h-6 text-orange-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1 truncate">
                    {category.name}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in border border-orange-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-orange-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={resetForm}
                disabled={modalLoading}
                className="p-1.5 sm:p-2 hover:bg-orange-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <X size={18} className="sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={modalLoading}
                  className="w-full px-3 sm:px-4 py-2.5 border border-orange-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 text-sm sm:text-base transition-colors bg-white/50"
                  placeholder="e.g., Appetizers, Main Courses"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  disabled={modalLoading}
                  className="w-full px-3 sm:px-4 py-2.5 border border-orange-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 text-sm sm:text-base transition-colors bg-white/50"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <div className="space-y-3">
                  {previewUrl && (
                    <div className="relative w-full h-32 sm:h-40 rounded-lg sm:rounded-xl overflow-hidden bg-orange-50 border border-orange-200">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => { 
                          setPreviewUrl(null); 
                          setFormData(prev => ({ ...prev, image: null })); 
                        }}
                        disabled={modalLoading}
                        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                      >
                        <X size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  )}
                  <label className={`flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                    modalLoading 
                      ? 'opacity-50 cursor-not-allowed border-orange-300' 
                      : 'border-orange-300 hover:border-orange-500 hover:bg-orange-50/50'
                  }`}>
                    <Image size={24} className="sm:w-8 sm:h-8 text-orange-400 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm text-gray-600 text-center px-2">
                      Click to upload image
                    </span>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={modalLoading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 text-center">
                    Supported formats: JPEG, PNG, GIF • Max size: 5MB
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2.5 border border-orange-300 text-gray-700 rounded-lg font-medium hover:bg-orange-50 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {modalLoading ? (
                    <>
                      <Loader size={18} className="sm:w-5 sm:h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    editingCategory ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}