import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Upload, ChefHat, Globe, DollarSign, ListOrdered, Image, CheckCircle, Utensils } from 'lucide-react';
import mealsService from '../../../../services/MealsService';
import categoriesService from '../../../../services/categoryApi';

// Enhanced Loading Spinner with Food Theme
const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Chef Container */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Rotating Plate */}
          <div className="absolute inset-0 rounded-full border-4 border-yellow-200 border-t-yellow-500 animate-spin"></div>
          
          {/* Floating Utensils */}
          <div className="absolute -top-2 -left-2 w-6 h-6 text-orange-500 animate-bounce">
            <Utensils className="w-6 h-6" />
          </div>
          <div className="absolute -top-2 -right-2 w-5 h-5 text-amber-500 animate-bounce" style={{ animationDelay: '0.3s' }}>
            <Utensils className="w-5 h-5 transform rotate-45" />
          </div>
          
          {/* Center Chef Hat */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">Saving Your Meal</h3>
        <p className="text-gray-600 mb-4">Please wait while we process your delicious creation</p>
        
        {/* Colorful Loading Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const MealForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: '',
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    price: '',
    image: null,
    available: true,
    order: 0
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchMeal();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const result = await categoriesService.getCategories();
      if (result.success) {
        const categoriesData = result.data || [];
        setCategories(categoriesData);
      } else {
        console.error('Failed to load categories:', result.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMeal = async () => {
    try {
      const response = await mealsService.getMeal(id);
      const meal = response.data;
      
      const nameTranslations = { en: '', ar: '' };
      const descriptionTranslations = { en: '', ar: '' };

      if (meal.translations) {
        meal.translations.forEach(trans => {
          if (trans.locale === 'en' || trans.locale === 'ar') {
            nameTranslations[trans.locale] = trans.name || '';
            descriptionTranslations[trans.locale] = trans.description || '';
          }
        });
      }

      setFormData({
        category_id: meal.category_id || '',
        name: nameTranslations,
        description: descriptionTranslations,
        price: meal.price || '',
        image: null,
        available: meal.available ?? true,
        order: meal.order || 0
      });

      if (meal.image) {
setImagePreview(meal.image);
        console.log('Meal image path:', imagePreview);
      }
    } catch (error) {
      console.error('Error fetching meal:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTranslationChange = (field, locale, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      submitData.append('category_id', formData.category_id);
      submitData.append('price', formData.price);
      submitData.append('available', formData.available ? 1 : 0);
      submitData.append('order', formData.order);
      
      Object.keys(formData.name).forEach(locale => {
        submitData.append(`name[${locale}]`, formData.name[locale]);
        submitData.append(`description[${locale}]`, formData.description[locale]);
      });
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (isEdit) {
        await mealsService.updateMeal(id, submitData);
      } else {
        await mealsService.createMeal(submitData);
      }

      navigate('/meals');
    } catch (error) {
      console.error('Error saving meal:', error);
      const errorMessage = error.message || error.errors?.message || 'Error saving meal. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner />}
      
      <div className="min-h-screen  py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-yellow-500 rounded-full shadow-lg">
                <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                {isEdit ? 'Edit Meal' : 'Create New Meal'}
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              {isEdit ? 'Update your delicious meal details' : 'Add a new mouth-watering meal to your menu'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Column - Basic Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 sm:p-6 rounded-xl border border-yellow-100">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                      <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                      Basic Information
                    </h2>

                    {/* Category */}
                    <div className="mb-4 sm:mb-6">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        <ListOrdered className="w-4 h-4 text-yellow-500" />
                        Category *
                      </label>
                      <select
                        required
                        className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                        value={formData.category_id}
                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.translations?.[0]?.name || category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div className="mb-4 sm:mb-6">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        <DollarSign className="w-4 h-4 text-amber-500" />
                        Price *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          className="w-full p-3 sm:p-4 pl-10 sm:pl-12 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                        />
                        <DollarSign className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

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
                      />
                    </div>

                    {/* Availability */}
                    <div className="mb-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.available}
                            onChange={(e) => handleInputChange('available', e.target.checked)}
                          />
                          <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                            formData.available ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}></div>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                            formData.available ? 'transform translate-x-6' : ''
                          }`}></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                          Available for ordering
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-6 rounded-xl border border-red-100">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                      <Image className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                      Meal Image
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
                          <p className="text-sm sm:text-base text-gray-600 font-medium">Click to upload meal image</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      </label>
                      
                      {imagePreview && (
                        <div className="mt-3 sm:mt-4">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Image Preview:</p>
                          <div className="relative inline-block">
                            <img
                              src={`http://127.0.0.1:8000/storage/${imagePreview}`}
                              alt="Preview"
                              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-lg sm:rounded-xl shadow-md border-2 border-white"
                            />
                            <div className="absolute inset-0 border-2 border-yellow-200 rounded-lg sm:rounded-xl pointer-events-none"></div>
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
                          placeholder="Enter meal name in English"
                          value={formData.name.en}
                          onChange={(e) => handleTranslationChange('name', 'en', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows="4"
                          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 bg-white shadow-sm resize-none text-sm sm:text-base"
                          placeholder="Describe your meal in English..."
                          value={formData.description.en}
                          onChange={(e) => handleTranslationChange('description', 'en', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arabic Translation */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 sm:p-6 rounded-xl border border-orange-100">
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
                          placeholder="أدخل اسم الوجبة بالعربية"
                          value={formData.name.ar}
                          onChange={(e) => handleTranslationChange('name', 'ar', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows="4"
                          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm resize-none text-right text-sm sm:text-base"
                          placeholder="صف وجبتك باللغة العربية..."
                          value={formData.description.ar}
                          onChange={(e) => handleTranslationChange('description', 'ar', e.target.value)}
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
                  onClick={() => navigate('/meals')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg sm:rounded-xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  {loading ? 'Saving...' : (isEdit ? 'Update Meal' : 'Create Meal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default MealForm;