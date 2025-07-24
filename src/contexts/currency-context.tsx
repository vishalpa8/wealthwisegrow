'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' }
];

// Default currency
export const DEFAULT_CURRENCY: Currency = { 
  code: 'INR', 
  symbol: '₹', 
  name: 'Indian Rupee', 
  locale: 'en-IN' 
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) => string;
  formatNumber: (amount: number, options?: Intl.NumberFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY); // Default to INR

  // Load currency from localStorage or detect from browser locale
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem('wealthwisegrow-currency');
      if (savedCurrency) {
        const parsedCurrency = JSON.parse(savedCurrency);
        const foundCurrency = CURRENCIES.find(c => c.code === parsedCurrency.code);
        if (foundCurrency) {
          setCurrencyState(foundCurrency);
          return; // Exit early if we found a saved currency
        }
      }

      // No saved currency found, attempt to detect from browser locale
      detectUserCurrency();
    } catch (error) {
      console.error('Error loading currency from localStorage:', error);
    }
  }, []);

  // Detect user's currency based on browser locale
  const detectUserCurrency = () => {
    try {
      // Get user's locale from browser
      const userLocale = navigator.language || 
                        (Intl.DateTimeFormat().resolvedOptions().locale) || 
                        'en-US';
      
      // First try to find an exact locale match
      let detectedCurrency = CURRENCIES.find(c => c.locale.toLowerCase() === userLocale.toLowerCase());
      
      // If no exact match, try to match by language part (first 2 chars)
      if (!detectedCurrency && userLocale) {
        const languageCode = userLocale.split('-')[0]?.toLowerCase();
        // Find currencies with matching language code in their locale
        const matchingCurrencies = languageCode ? CURRENCIES.filter(c => 
          c.locale.toLowerCase().startsWith(languageCode)
        ) : [];
        
        if (matchingCurrencies.length > 0) {
          detectedCurrency = matchingCurrencies[0]; // Take the first match
        }
      }
      
      // If we found a matching currency, set it
      if (detectedCurrency) {
        setCurrencyState(detectedCurrency);
        // Also save to localStorage
        localStorage.setItem('wealthwisegrow-currency', JSON.stringify(detectedCurrency));
      }
      // If no match found, the default currency (INR) will be used
    } catch (error) {
      console.error('Error detecting user currency:', error);
      // Fallback to default currency if detection fails
    }
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('wealthwisegrow-currency', JSON.stringify(newCurrency));
    } catch (error) {
      console.error('Error saving currency to localStorage:', error);
    }
  };

  const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions): string => {
    try {
      if (isNaN(amount) || !isFinite(amount)) {
        return `${currency.symbol}0`;
      }

      const formatter = new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options
      });

      return formatter.format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      // Fallback formatting
      return `${currency.symbol}${amount.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      })}`;
    }
  };

  const formatNumber = (amount: number, options?: Intl.NumberFormatOptions): string => {
    try {
      if (isNaN(amount) || !isFinite(amount)) {
        return '0';
      }

      const formatter = new Intl.NumberFormat(currency.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options
      });

      return formatter.format(amount);
    } catch (error) {
      console.error('Error formatting number:', error);
      return amount.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      });
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, formatNumber }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}