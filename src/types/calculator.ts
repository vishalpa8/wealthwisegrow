export interface CalculatorResult {
  id: string;
  type: CalculatorType;
  inputs: Record<string, any>;
  results: Record<string, any>;
  timestamp: Date;
  title: string;
  notes: string;
}

export type CalculatorType = 
  | "mortgage"
  | "loan" 
  | "investment"
  | "retirement"
  | "budget"
  | "debt-payoff"
  | "savings"
  | "tax"
  | "insurance";

export interface ValidationError {
  field: string;
  message: string;
}

export interface CalculatorState {
  isLoading: boolean;
  errors: ValidationError[];
  results: Record<string, any> | null;
  history: CalculatorResult[];
}

export interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "number" | "email" | "tel";
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helpText?: string;
  error?: string | undefined;
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
}

export interface ResultCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  prefix?: string;
  suffix?: string;
  variant?: "default" | "success" | "warning" | "error" | "primary" | "pricing";
  className?: string;
  children?: import('react').ReactNode;
}

export interface CalculatorLayoutProps {
  title: string;
  description?: string;
  children: import('react').ReactNode;
  sidebar?: import('react').ReactNode;
  className?: string;
}