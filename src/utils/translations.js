/**
 * Helper function to get translated meal name/description from backend translations
 * @param {Object} meal - Meal object with translations array
 * @param {string} locale - Current locale (en, fr, ar)
 * @param {string} field - Field to get ('name' or 'description')
 * @returns {string} - Translated text or fallback
 */
export const getMealTranslation = (meal, locale, field = 'name') => {
  if (!meal) return '';
  
  // Handle nested meal object (e.g., from order_items)
  const mealData = meal.meal || meal;
  
  // If meal has translations array from backend (matches meal_translations table structure)
  if (mealData.translations && Array.isArray(mealData.translations)) {
    // Try to find translation for current locale (en, fr, ar)
    const translation = mealData.translations.find(t => t.locale === locale);
    if (translation && translation[field]) {
      return translation[field];
    }
    
    // Fallback to 'en' if current locale not found
    const enTranslation = mealData.translations.find(t => t.locale === 'en');
    if (enTranslation && enTranslation[field]) {
      return enTranslation[field];
    }
    
    // Fallback to 'fr' if available
    const frTranslation = mealData.translations.find(t => t.locale === 'fr');
    if (frTranslation && frTranslation[field]) {
      return frTranslation[field];
    }
    
    // Fallback to 'ar' if available
    const arTranslation = mealData.translations.find(t => t.locale === 'ar');
    if (arTranslation && arTranslation[field]) {
      return arTranslation[field];
    }
    
    // Fallback to first available translation
    if (mealData.translations.length > 0 && mealData.translations[0][field]) {
      return mealData.translations[0][field];
    }
  }
  
  // Fallback to direct property if no translations
  return mealData[field] || meal[field] || '';
};

/**
 * Get meal name with translation
 */
export const getMealName = (meal, locale) => {
  return getMealTranslation(meal, locale, 'name');
};

/**
 * Get meal description with translation
 */
export const getMealDescription = (meal, locale) => {
  return getMealTranslation(meal, locale, 'description');
};

/**
 * Helper function to get translated category name/description from backend translations
 * @param {Object} category - Category object with translations array
 * @param {string} locale - Current locale (en, fr, ar)
 * @param {string} field - Field to get ('name' or 'description')
 * @returns {string} - Translated text or fallback
 */
export const getCategoryTranslation = (category, locale, field = 'name') => {
  if (!category) return '';
  
  // Handle nested category object (e.g., from meals)
  const categoryData = category.category || category;
  
  // If category has translations array from backend (matches category_translations table structure)
  if (categoryData.translations && Array.isArray(categoryData.translations)) {
    // Try to find translation for current locale (en, fr, ar)
    const translation = categoryData.translations.find(t => t.locale === locale);
    if (translation && translation[field]) {
      return translation[field];
    }
    
    // Fallback to 'en' if current locale not found
    const enTranslation = categoryData.translations.find(t => t.locale === 'en');
    if (enTranslation && enTranslation[field]) {
      return enTranslation[field];
    }
    
    // Fallback to 'fr' if available
    const frTranslation = categoryData.translations.find(t => t.locale === 'fr');
    if (frTranslation && frTranslation[field]) {
      return frTranslation[field];
    }
    
    // Fallback to 'ar' if available
    const arTranslation = categoryData.translations.find(t => t.locale === 'ar');
    if (arTranslation && arTranslation[field]) {
      return arTranslation[field];
    }
    
    // Fallback to first available translation
    if (categoryData.translations.length > 0 && categoryData.translations[0][field]) {
      return categoryData.translations[0][field];
    }
  }
  
  // Fallback to direct property if no translations
  return categoryData[field] || category[field] || '';
};

/**
 * Get category name with translation
 */
export const getCategoryName = (category, locale) => {
  return getCategoryTranslation(category, locale, 'name');
};

/**
 * Get category description with translation
 */
export const getCategoryDescription = (category, locale) => {
  return getCategoryTranslation(category, locale, 'description');
};

