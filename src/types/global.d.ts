// Generic Types
export type GenericObject = Record<string, unknown>;
export type GenericFunction = (...args: unknown[]) => unknown;
export type GenericAsyncFunction = (...args: unknown[]) => Promise<unknown>;
export type GenericErrorHandler = (error: Error) => void;

// Calculator Types
export type CalculatorValue = string | number | boolean | null;
export type CalculatorValues = Record<string, CalculatorValue>;

export type ValidationResult = {
  isValid: boolean;
  errors?: Record<string, string>;
};

// Form Field Types
export type FieldType = 'text' | 'number' | 'select' | 'date' | 'percentage' | 'currency';

export type FieldOption = {
  value: string | number;
  label: string;
};

export type FieldValidation = {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: CalculatorValue) => string | null;
};

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  value?: CalculatorValue;
  options?: FieldOption[];
  validation?: FieldValidation;
  placeholder?: string;
  disabled?: boolean;
  tooltip?: string;
};

// Calculation Types
export type CalculationInput = {
  [key: string]: CalculatorValue;
};

export type CalculationResult = {
  [key: string]: CalculatorValue;
  error?: string;
};

// Specific Calculator Types
export type LoanCalculation = {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  interestPercent: number;
  amortizationSchedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
};

export type InvestmentCalculation = {
  totalInvestment: number;
  totalReturns: number;
  maturityAmount: number;
  absoluteReturns: number;
  annualizedReturns: number;
  monthlyBreakdown: Array<{
    month: number;
    investment: number;
    interest: number;
    balance: number;
  }>;
};

// Cache Types
export type CacheKey = string;
export type CacheValue = unknown;
export type CacheOptions = {
  ttl?: number;
  tags?: string[];
};

// API Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
};

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColor = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  error: string;
  warning: string;
  success: string;
};

// Chart Types
export type ChartData = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
};

export type ChartOptions = {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  scales?: {
    x?: {
      type?: string;
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      type?: string;
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled?: boolean;
      mode?: 'index' | 'nearest' | 'point';
    };
  };
};

// Storage Types
export type StorageItem = {
  key: string;
  value: unknown;
  timestamp: number;
  expiry?: number;
};

// i18n Types
export type LocaleCode = 'en' | 'hi' | 'mr' | 'bn' | 'te' | 'ta' | 'gu' | 'kn';
export type TranslationKey = string;
export type TranslationParams = Record<string, string | number>;

// Security Types
export type EncryptionKey = string;
export type HashedValue = string;
export type SecurityContext = {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
};
