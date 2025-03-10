import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface LocalizationProviderProps {
  children: ReactNode;
  config: {
    defaultLanguage: string;
    localeDir: string;
  };
}

interface LocalizationContextType {
  locale: Record<string, string>;
  defaultLocale: Record<string, string>;
  language: string;
  setLanguage: (lang: string) => void;
}

const LocalizationContext = createContext<LocalizationContextType | null>(null);

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children, config }) => {
  const [language, setLanguage] = useState(config.defaultLanguage);
  const [locale, setLocale] = useState<Record<string, string>>({});
  const [defaultLocale, setDefaultLocale] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadLocale = async (lang: string, isDefault = false) => {
      try {
        const response = await fetch(`/${config.localeDir}/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to fetch locale file for ${lang}`);

        const data = await response.json();
        if (isDefault) {
          setDefaultLocale(data);
        } else {
          setLocale(data);
        }
      } catch (error) {
        console.error(`Failed to load ${lang} locale:`, error);
      }
    };

    loadLocale(config.defaultLanguage, true);
    loadLocale(language);
  }, [language, config.localeDir]);

  return (
    <LocalizationContext.Provider value={{ locale, defaultLocale, language, setLanguage }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocalizationProvider");
  }
  return context;
};

export const t = (key: string): string => {
  const { locale, defaultLocale, language } = useLocale();

  if (locale[key]) {
    return locale[key]; // Key found in current language
  }

  if (defaultLocale[key]) {
    console.warn(`⚠️ Fallback used for key: "${key}" in language "${language}"`);
    return defaultLocale[key]; // Key found in default language
  }

  console.warn(`❌ Key not found: "${key}" in both "${language}" and default language`);
  return key; // Key not found in either
};
