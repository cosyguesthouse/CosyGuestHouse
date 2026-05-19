import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/common.json';
import hi from './locales/hi/common.json';
import fr from './locales/fr/common.json';
import es from './locales/es/common.json';
import de from './locales/de/common.json';
import ar from './locales/ar/common.json';
import zh from './locales/zh/common.json';
import ja from './locales/ja/common.json';
import ru from './locales/ru/common.json';
import gu from './locales/gu/common.json';
import mr from './locales/mr/common.json';
import ta from './locales/ta/common.json';
import te from './locales/te/common.json';
import pa from './locales/pa/common.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
  ar: { translation: ar },
  zh: { translation: zh },
  ja: { translation: ja },
  ru: { translation: ru },
  gu: { translation: gu },
  mr: { translation: mr },
  ta: { translation: ta },
  te: { translation: te },
  pa: { translation: pa },
};

const savedLanguage = localStorage.getItem('appLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;

// Dynamic Translation Helper using MyMemory (CORS-enabled) and Google Translate API
const translationCache = JSON.parse(localStorage.getItem('dynamicTranslationCache') || '{}');

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!text) return text;
  if (targetLang === 'en' || targetLang === 'en-US') return text; // Assuming base content is English

  const cacheKey = `${targetLang}_${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  // Try CORS-friendly MyMemory API first
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.responseData && data.responseData.translatedText) {
      const translatedText = data.responseData.translatedText;
      translationCache[cacheKey] = translatedText;
      localStorage.setItem('dynamicTranslationCache', JSON.stringify(translationCache));
      return translatedText;
    }
  } catch (error) {
    console.warn('MyMemory translation failed, trying Google Translate fallback:', error);
  }

  // Fallback to Google Translate (which may fail in browser due to CORS, but works in other contexts)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    const translatedText = data[0].map((item: any) => item[0]).join('');
    
    translationCache[cacheKey] = translatedText;
    localStorage.setItem('dynamicTranslationCache', JSON.stringify(translationCache));
    
    return translatedText;
  } catch (error) {
    console.error('Dynamic translation failed:', error);
    return text;
  }
};
