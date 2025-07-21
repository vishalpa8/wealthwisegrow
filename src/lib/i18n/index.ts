import { createContext, useContext } from 'react';

export type Locale = 'en' | 'hi' | 'mr' | 'bn' | 'te' | 'ta' | 'gu' | 'kn';

interface LocaleConfig {
  code: string;
  name: string;
  dir: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  currencyFormat: Intl.NumberFormatOptions;
}

export const localeConfigs: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en-IN',
    name: 'English',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    },
    currencyFormat: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  hi: {
    code: 'hi-IN',
    name: 'हिंदी',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    },
    currencyFormat: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  mr: {
    code: 'mr-IN',
    name: 'मराठी',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    },
    currencyFormat: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  bn: {
    code: 'bn-IN',
    name: 'বাংলা',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    },
    currencyFormat: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  te: {
    code: 'te-IN',
    name: 'తెలుగు',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    },
    currencyFormat: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  ta: {
    code: 'ta-IN',
    name: 'தமிழ்',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    },
    currencyFormat: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  gu: {
    code: 'gu-IN',
    name: 'ગુજરાતી',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    },
    currencyFormat: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  kn: {
    code: 'kn-IN',
    name: 'ಕನ್ನಡ',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    },
    currencyFormat: {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  }
};

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date | string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Format functions
export function formatNumber(value: number, locale: Locale): string {
  const config = localeConfigs[locale];
  return new Intl.NumberFormat(config.code, config.numberFormat).format(value);
}

export function formatCurrency(value: number, locale: Locale): string {
  const config = localeConfigs[locale];
  return new Intl.NumberFormat(config.code, config.currencyFormat).format(value);
}

export function formatDate(date: Date | string, locale: Locale): string {
  const config = localeConfigs[locale];
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(config.code).format(dateObj);
}

// Translations definitions (this would normally be more comprehensive)
const translations: Record<Locale, Record<string, string>> = {
  en: {},
  hi: {},
  mr: {},
  bn: {},
  te: {},
  ta: {},
  gu: {},
  kn: {}
};

// Translation function
export function translate(
  key: string,
  locale: Locale,
  params?: Record<string, string | number>
): string {
  // Safely access translations with fallbacks
  const localeTranslations = translations[locale] || {};
  const translation = localeTranslations[key] || key;
  if (!params) return translation;

  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(`{{${key}}}`, String(value)),
    translation
  );
}
