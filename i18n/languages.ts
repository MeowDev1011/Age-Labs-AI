export type SupportedLanguage =
  | 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh' | 'ru'
  | 'ar' | 'hi' | 'tr' | 'nl' | 'pl' | 'id' | 'vi' | 'th' | 'sv' | 'el'
  | 'cs' | 'uk' | 'ro' | 'hu' | 'he' | 'da' | 'no';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'ES' },
  { code: 'en', name: 'English', nativeName: 'English', flag: 'US' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'BR' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: 'FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'IT' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: 'JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'KR' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: 'CN' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'SA', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'IN' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: 'TR' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: 'NL' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: 'PL' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: 'ID' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: 'VN' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: 'TH' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: 'SE' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: 'GR' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: 'CZ' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: 'UA' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: 'RO' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: 'HU' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: 'IL', dir: 'rtl' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: 'DK' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: 'NO' },
];

export const getDeviceLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined' || !navigator.language) return 'es';
  const lang = navigator.language.toLowerCase();
  const primary = lang.split('-')[0] as SupportedLanguage;
  const match = LANGUAGES.find((l) => l.code === primary);
  return match ? match.code : 'en';
};
