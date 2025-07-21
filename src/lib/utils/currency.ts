// Global currency and number formatting utilities
export interface CurrencyConfig {
  symbol: string;
  code: string;
  locale: string;
  precision: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { symbol: '$', code: 'USD', locale: 'en-US', precision: 2 },
  EUR: { symbol: '€', code: 'EUR', locale: 'de-DE', precision: 2 },
  GBP: { symbol: '£', code: 'GBP', locale: 'en-GB', precision: 2 },
  JPY: { symbol: '¥', code: 'JPY', locale: 'ja-JP', precision: 0 },
  INR: { symbol: '₹', code: 'INR', locale: 'en-IN', precision: 2 },
  CAD: { symbol: 'C$', code: 'CAD', locale: 'en-CA', precision: 2 },
  AUD: { symbol: 'A$', code: 'AUD', locale: 'en-AU', precision: 2 },
  CHF: { symbol: 'CHF', code: 'CHF', locale: 'de-CH', precision: 2 },
  CNY: { symbol: '¥', code: 'CNY', locale: 'zh-CN', precision: 2 },
  SGD: { symbol: 'S$', code: 'SGD', locale: 'en-SG', precision: 2 },
};

// Default currency (can be changed based on user location/preference)
// Initialize with a safe fallback
let currentCurrency: CurrencyConfig = SUPPORTED_CURRENCIES.USD || {
  symbol: '$',
  code: 'USD',
  locale: 'en-US',
  precision: 2
};

export function setGlobalCurrency(currencyCode: string) {
  if (SUPPORTED_CURRENCIES[currencyCode]) {
    currentCurrency = SUPPORTED_CURRENCIES[currencyCode];
  }
}

export function getCurrentCurrency(): CurrencyConfig {
  return currentCurrency;
}

// Auto-detect user's preferred currency based on location
export function detectUserCurrency(): string {
  try {
    const userLocale = navigator.language || 'en-US';
    const region = userLocale.split('-')[1];
    
    const regionToCurrency: Record<string, string> = {
      'US': 'USD',
      'GB': 'GBP',
      'IN': 'INR',
      'CA': 'CAD',
      'AU': 'AUD',
      'JP': 'JPY',
      'DE': 'EUR',
      'FR': 'EUR',
      'IT': 'EUR',
      'ES': 'EUR',
      'CH': 'CHF',
      'CN': 'CNY',
      'SG': 'SGD',
    };
    
    return region && regionToCurrency[region] ? regionToCurrency[region] : 'USD';
  } catch {
    return 'USD';
  }
}

// Format number as currency
export function formatCurrency(
  amount: number,
  options: {
    currency?: string;
    showSymbol?: boolean;
    precision?: number;
    compact?: boolean;
  } = {}
): string {
  const {
    currency = currentCurrency.code,
    showSymbol = true,
    precision,
    compact = false
  } = options;

  const config = SUPPORTED_CURRENCIES[currency] || currentCurrency;
  const actualPrecision = precision ?? config.precision;

  try {
    // Handle very large numbers with compact notation
    if (compact && Math.abs(amount) >= 1000000) {
      return formatCompactCurrency(amount, config, showSymbol);
    }

    // Handle edge cases
    if (!isFinite(amount) || isNaN(amount)) {
      return showSymbol ? `${config.symbol}0` : '0';
    }

    // Handle very large numbers
    if (Math.abs(amount) > Number.MAX_SAFE_INTEGER) {
      return showSymbol ? `${config.symbol}∞` : '∞';
    }

    const formatter = new Intl.NumberFormat(config.locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: config.code,
      minimumFractionDigits: actualPrecision,
      maximumFractionDigits: actualPrecision,
    });

    return formatter.format(amount);
  } catch {
    // Fallback formatting
    const formattedAmount = amount.toFixed(actualPrecision).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return showSymbol ? `${config.symbol}${formattedAmount}` : formattedAmount;
  }
}

// Format large numbers in compact form (e.g., 1.2M, 3.4B)
function formatCompactCurrency(amount: number, config: CurrencyConfig, showSymbol: boolean): string {
  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ];

  for (const unit of units) {
    if (Math.abs(amount) >= unit.value) {
      const compactValue = amount / unit.value;
      const formatted = compactValue.toFixed(1);
      return showSymbol 
        ? `${config.symbol}${formatted}${unit.suffix}`
        : `${formatted}${unit.suffix}`;
    }
  }

  return formatCurrency(amount, { currency: config.code, showSymbol, compact: false });
}

// Format percentage
export function formatPercentage(
  value: number,
  precision: number = 2,
  showSign: boolean = false
): string {
  try {
    if (!isFinite(value) || isNaN(value)) {
      return '0%';
    }

    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(precision)}%`;
  } catch {
    return '0%';
  }
}

// Parse currency string to number
export function parseCurrencyString(value: string): number {
  try {
    // Remove all non-numeric characters except decimal points and minus signs
    const cleanValue = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleanValue);
    
    if (isNaN(parsed)) {
      return 0;
    }
    
    return parsed;
  } catch {
    return 0;
  }
}

// Validate if a number is safe for calculations
export function isSafeNumber(value: number): boolean {
  return (
    isFinite(value) &&
    !isNaN(value) &&
    Math.abs(value) <= Number.MAX_SAFE_INTEGER
  );
}

// Safe mathematical operations
export const SafeMath = {
  add: (a: number, b: number): number => {
    if (!isSafeNumber(a) || !isSafeNumber(b)) return 0;
    const result = a + b;
    return isSafeNumber(result) ? result : 0;
  },

  subtract: (a: number, b: number): number => {
    if (!isSafeNumber(a) || !isSafeNumber(b)) return 0;
    const result = a - b;
    return isSafeNumber(result) ? result : 0;
  },

  multiply: (a: number, b: number): number => {
    if (!isSafeNumber(a) || !isSafeNumber(b)) return 0;
    const result = a * b;
    return isSafeNumber(result) ? result : 0;
  },

  divide: (a: number, b: number): number => {
    if (!isSafeNumber(a) || !isSafeNumber(b) || b === 0) return 0;
    const result = a / b;
    return isSafeNumber(result) ? result : 0;
  },

  power: (base: number, exponent: number): number => {
    if (!isSafeNumber(base) || !isSafeNumber(exponent)) return 0;
    if (exponent > 1000) return 0; // Prevent extremely large calculations
    const result = Math.pow(base, exponent);
    return isSafeNumber(result) ? result : 0;
  },

  compound: (principal: number, rate: number, periods: number): number => {
    if (!isSafeNumber(principal) || !isSafeNumber(rate) || !isSafeNumber(periods)) return 0;
    if (periods > 10000) return 0; // Prevent extremely long calculations
    
    const rateDecimal = rate / 100;
    const result = SafeMath.multiply(principal, SafeMath.power(1 + rateDecimal, periods));
    return result;
  }
};

// Round to avoid floating point precision issues
export function roundToPrecision(value: number, precision: number = 2): number {
  if (!isSafeNumber(value)) return 0;
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}