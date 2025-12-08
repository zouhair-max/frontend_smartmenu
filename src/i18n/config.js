import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import arTranslations from './locales/ar.json';

// Detect language from localStorage or browser, default to 'en'
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('app_language');
  if (savedLanguage) return savedLanguage;
  
  // Try to detect from browser
  const browserLang = navigator.language.split('-')[0];
  if (['en', 'fr', 'ar'].includes(browserLang)) {
    return browserLang;
  }
  
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      fr: {
        translation: frTranslations
      },
      ar: {
        translation: arTranslations
      }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;

