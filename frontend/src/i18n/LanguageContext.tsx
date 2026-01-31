import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  translations, 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  TranslationKey,
  LanguageInfo 
} from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  languages: LanguageInfo[];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ai-travel-planner-language';

// Get browser language or default to English
function getBrowserLanguage(): SupportedLanguage {
  const browserLang = navigator.language.split('-')[0];
  const supported = SUPPORTED_LANGUAGES.find(l => l.code === browserLang);
  return supported ? supported.code : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    // Try to get from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.find(l => l.code === stored)) {
      return stored as SupportedLanguage;
    }
    return getBrowserLanguage();
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    
    // Update document direction for RTL languages
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // Set initial document direction
  useEffect(() => {
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === language);
    document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Translation function with parameter substitution
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langTranslations = translations[language] || translations.en;
    let text = langTranslations[key] || translations.en[key] || key;
    
    // Replace parameters like {name} with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  const isRTL = SUPPORTED_LANGUAGES.find(l => l.code === language)?.rtl || false;

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        t, 
        languages: SUPPORTED_LANGUAGES,
        isRTL 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for getting translation function directly
export function useTranslation() {
  const { t, language, isRTL } = useLanguage();
  return { t, language, isRTL };
}
