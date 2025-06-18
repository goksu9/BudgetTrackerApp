import { translations } from '../constants/translations';

export const translate = (key, language) => {
  if (language === 'TR' && translations.TR[key]) {
    return translations.TR[key];
  }
  return key; // İngilizce veya çevirisi olmayan metinler için orijinal metni döndür
}; 