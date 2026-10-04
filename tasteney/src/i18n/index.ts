import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import de from './locales/de';

export const getDeviceLanguage = (): 'de' | 'en' => {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const languageCode = locales[0]?.languageCode;
      if (languageCode && languageCode.toLowerCase().startsWith('de')) {
        return 'de';
      }
    }
  } catch (e) {
    console.warn('Failed to detect device language:', e);
  }
  return 'en';
};

const initialLang = getDeviceLanguage();

// eslint-disable-next-line import/no-named-as-default-member
void i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const isGerman = (): boolean => {
  return i18next.language === 'de' || i18next.language?.startsWith('de');
};

export const translateArchetype = (archetype: string): string => {
  const currentLang = isGerman() ? 'de' : 'en';
  const dict = (currentLang === 'de' ? de : en).archetypes as Record<string, string>;
  return dict[archetype] || archetype;
};

export const translateSubtype = (archetype: string, subtype?: string): string => {
  if (!subtype) return '';
  const currentLang = isGerman() ? 'de' : 'en';
  const subtypesDict = (currentLang === 'de' ? de : en).subtypes as Record<string, Record<string, string>>;
  const archetypeDict = subtypesDict[archetype];
  if (archetypeDict && archetypeDict[subtype]) {
    return archetypeDict[subtype];
  }
  return subtype;
};

export const translateScoreDescription = (score: number): string => {
  const currentLang = isGerman() ? 'de' : 'en';
  const scoresDict = (currentLang === 'de' ? de : en).rating.scores as Record<number, string>;
  return scoresDict[score] || `${score}.0`;
};

export const translateSensoryTag = (tag: string): string => {
  const currentLang = isGerman() ? 'de' : 'en';
  const presetTagsDict = (currentLang === 'de' ? de : en).sensory.presetTags as Record<string, string>;
  return presetTagsDict[tag] || tag;
};

export const formatDate = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = isGerman() ? 'de-DE' : 'en-US';
  return d.toLocaleDateString(locale, options);
};

export default i18next;
export { i18next as i18n };
