export interface CalculatorMeta {
  id: string;
  name: string;
  description: string;
  category: CalculatorCategory;
  type: CalculatorType;
  path: string;
  features: string[];
  inputs: CalculatorInput[];
  outputs: CalculatorOutput[];
  isNew?: boolean;
  isPopular?: boolean;
}

export type CalculatorCategory =
  | 'investment'
  | 'loan'
  | 'tax'
  | 'salary'
  | 'insurance'
  | 'goal'
  | 'business'
  | 'misc';

export type CalculatorType =
  // Investment & Wealth Building
  | 'compound-interest'
  | 'simple-interest'
  | 'sip'
  | 'lumpsum'
  | 'swp'
  | 'mutual-fund'
  | 'retirement'
  | 'annuity'
  | 'gold'
  | 'dividend'
  | 'fixed-deposit'
  | 'recurring-deposit'
  | 'epf'
  | 'ppf'
  
  // Loan & Borrowing
  | 'loan-emi'
  | 'loan-amortization'
  | 'interest-only-loan'
  | 'balloon-loan'
  | 'debt-payoff'
  
  // Tax & Salary
  | 'income-tax'
  | 'gst'
  | 'ctc'
  | 'hra'
  | 'ltcg'
  | 'gratuity'
  | 'tds'
  
  // Goal Planning
  | 'education-goal'
  | 'marriage-goal'
  | 'custom-goal'
  
  // Insurance
  | 'life-insurance'
  | 'health-insurance'
  | 'vehicle-insurance'
  
  // Business & Analysis
  | 'break-even'
  | 'roi'
  | 'payback-period'
  | 'working-capital'
  | 'gross-profit'
  
  // Miscellaneous
  | 'currency-converter'
  | 'future-value'
  | 'present-value'
  | 'inflation-adjusted'
  | 'rule-of-72';

export interface CalculatorInput {
  name: string;
  label: string;
  type: 'number' | 'percentage' | 'currency' | 'date' | 'select' | 'text';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
  validate?: (value: any) => string | null;
}

export interface CalculatorOutput {
  name: string;
  label: string;
  type: 'number' | 'percentage' | 'currency' | 'text';
  description?: string;
  format?: (value: number) => string;
}

// Calculator Categories Configuration
export const CALCULATOR_CATEGORIES = {
  investment: {
    id: 'investment',
    name: 'Investment & Wealth Building',
    description: 'Calculate returns and plan your investments',
    icon: 'TrendingUp'
  },
  loan: {
    id: 'loan',
    name: 'Loan & Borrowing',
    description: 'Calculate EMIs and plan your loans',
    icon: 'Landmark'
  },
  tax: {
    id: 'tax',
    name: 'Tax & Salary',
    description: 'Calculate taxes and plan your salary',
    icon: 'Receipt'
  },
  goal: {
    id: 'goal',
    name: 'Goal-based Planning',
    description: 'Plan for your financial goals',
    icon: 'Target'
  },
  insurance: {
    id: 'insurance',
    name: 'Insurance & Protection',
    description: 'Calculate premiums and coverage',
    icon: 'Shield'
  },
  business: {
    id: 'business',
    name: 'Business & Analysis',
    description: 'Business financial calculations',
    icon: 'Briefcase'
  },
  misc: {
    id: 'misc',
    name: 'Other Calculators',
    description: 'Additional financial tools',
    icon: 'Calculator'
  }
} as const;

// Core Calculator Features
export const CALCULATOR_FEATURES = {
  history: 'Save calculation history',
  comparison: 'Compare different scenarios',
  charts: 'Visual charts and graphs',
  export: 'Export results to CSV/PDF',
  schedule: 'Generate payment/investment schedule',
  share: 'Share results with others'
} as const;

// Define relationships between calculators
export const CALCULATOR_RELATIONSHIPS = {
  'loan-emi': ['loan-amortization', 'interest-only-loan', 'balloon-loan'],
  'sip': ['lumpsum', 'swp', 'mutual-fund'],
  'compound-interest': ['simple-interest', 'fixed-deposit', 'recurring-deposit'],
  'income-tax': ['hra', 'ltcg', 'tds'],
  'retirement': ['annuity', 'pension', 'gratuity']
} as const;
