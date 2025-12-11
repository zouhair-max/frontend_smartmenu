import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Upload, Menu, Globe, ListOrdered, Image, Utensils } from 'lucide-react';
import CategoryApi from '../../../../services/categoryApi';

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

// Enhanced Loading Spinner with Category Theme
const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Menu Container */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Rotating Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          
          {/* Floating Icons */}
          <div className="absolute -top-2 -left-2 w-6 h-6 text-orange-500 animate-bounce">
            <Utensils className="w-6 h-6" />
          </div>
          <div className="absolute -top-2 -right-2 w-5 h-5 text-amber-500 animate-bounce" style={{ animationDelay: '0.3s' }}>
            <Menu className="w-5 h-5 transform rotate-45" />
          </div>
          
          {/* Center Menu Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Menu className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">Saving Your Category</h3>
        <p className="text-gray-600 mb-4">Please wait while we process your category</p>
        
        {/* Colorful Loading Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: { en: '', ar: '', fr: '' },
    order: 0,
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await CategoryApi.getCategory(id);
      const category = response.data;
      
      const nameTranslations = { en: '', ar: '', fr: '' };

      if (category.translations && Array.isArray(category.translations)) {
        category.translations.forEach(trans => {
          if (trans.locale === 'en' || trans.locale === 'ar' || trans.locale === 'fr') {
            nameTranslations[trans.locale] = trans.name || '';
          }
        });
      } else {
        // Fallback to direct name property if no translations
        nameTranslations.en = category.name || '';
      }

      setFormData({
        name: nameTranslations,
        order: category.order || 0,
        image: null
      });

      if (category.image) {
        setImagePreview(category.image);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTranslationChange = (locale, value) => {
    setFormData(prev => ({
      ...prev,
      name: {
        ...prev.name,
        [locale]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate that at least one name is provided
      const hasName = formData.name.en.trim() || formData.name.ar.trim() || formData.name.fr.trim();
      if (!hasName) {
        alert('Category name is required in at least one language');
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      
      // Get the first available name (English preferred, then Arabic, then French)
      const nameEn = formData.name.en.trim();
      const nameAr = formData.name.ar.trim();
      const nameFr = formData.name.fr.trim();
      
      const defaultName = nameEn || nameAr || nameFr;
      if (!defaultName) {
        alert('Category name is required in at least one language');
        setLoading(false);
        return;
      }
      
      // Use English as default name, or first available if English is empty
      const nameValue = nameEn || defaultName;
      submitData.append('name', nameValue);
      submitData.append('order', formData.order.toString());
      
      // Build translations array for other languages
      const translations = [];
      
      // Add Arabic if it exists and is different from default
      if (nameAr && nameAr !== nameValue) {
        translations.push({ locale: 'ar', name: nameAr });
      }
      
      // Add French if it exists and is different from default
      if (nameFr && nameFr !== nameValue) {
        translations.push({ locale: 'fr', name: nameFr });
      }
      
      // Add English to translations only if it exists but wasn't used as default
      // (i.e., if default was Arabic or French because English was empty)
      if (nameEn && nameEn !== nameValue) {
        translations.push({ locale: 'en', name: nameEn });
      }
      
      // Append translations array to FormData
      translations.forEach((trans, index) => {
        submitData.append(`translations[${index}][locale]`, trans.locale);
        submitData.append(`translations[${index}][name]`, trans.name);
      });
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (isEdit) {
        await CategoryApi.updateCategory(id, submitData);
      } else {
        await CategoryApi.createCategory(submitData);
      }

      navigate('/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error.message || error.errors?.message || 'Error saving category. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner />}
      
      <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-orange-500 rounded-full shadow-lg">
                <Menu className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                {isEdit ? 'Edit Category' : 'Create New Category'}
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              {isEdit ? 'Update your category details' : 'Add a new category to organize your menu'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Column - Basic Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 sm:p-6 rounded-xl border border-orange-100">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                      Basic Information
                    </h2>

                    {/* Display Order */}
                    <div className="mb-4 sm:mb-6">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        <ListOrdered className="w-4 h-4 text-orange-500" />
                        Display Order
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                        value={formData.order}
                        onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-red-100">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                      <Image className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                      Category Image
                    </h2>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <div className="border-2 border-dashed border-red-300 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer hover:border-red-400 hover:bg-orange-25 transition-all duration-200 group">
                          <Upload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-orange-400 mx-auto mb-2 sm:mb-4 group-hover:text-orange-500" />
                          <p className="text-sm sm:text-base text-gray-600 font-medium">Click to upload category image</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      </label>
                      
                      {imagePreview && (
                        <div className="mt-3 sm:mt-4">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Image Preview:</p>
                          <div className="relative inline-block">
                            <img
                              src={imagePreview.startsWith('http') || imagePreview.startsWith('blob:') 
                                ? imagePreview 
                                : `${STORAGE_BASE_URL}/storage/${imagePreview}`}
                              alt="Preview"
                              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-lg sm:rounded-xl shadow-md border-2 border-white"
                            />
                            <div className="absolute inset-0 border-2 border-orange-200 rounded-lg sm:rounded-xl pointer-events-none"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Translations */}
                <div className="space-y-4 sm:space-y-6">
                  {/* English Translation */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-red-100">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      English Translation
                    </h3>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                          placeholder="Enter category name in English"
                          value={formData.name.en}
                          onChange={(e) => handleTranslationChange('en', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* French Translation */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      French Translation
                    </h3>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                          placeholder="Entrez le nom de la catégorie en français"
                          value={formData.name.fr}
                          onChange={(e) => handleTranslationChange('fr', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arabic Translation */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-orange-100">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                      Arabic Translation
                    </h3>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm text-right text-sm sm:text-base"
                          placeholder="أدخل اسم الفئة بالعربية"
                          value={formData.name.ar}
                          onChange={(e) => handleTranslationChange('ar', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/categories')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  {loading ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryForm;

