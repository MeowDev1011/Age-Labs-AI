import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, getDeviceLanguage, type SupportedLanguage, type LanguageInfo } from '../i18n/languages';
import { TRANSLATIONS, type Translations } from '../i18n/translations';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof Translations) => string;
  currentLanguageInfo: LanguageInfo;
  availableLanguages: LanguageInfo[];
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'age_labes_lang';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
    return getDeviceLanguage();
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const currentLanguageInfo = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const dir = currentLanguageInfo.dir || 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const t = (key: keyof Translations): string => {
    const activePack = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (activePack[key]) return activePack[key];
    return TRANSLATIONS.en[key] || TRANSLATIONS.es[key] || '';
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageInfo,
        availableLanguages: LANGUAGES,
        dir,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
};
