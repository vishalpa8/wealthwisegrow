export interface CalculatorResult {
  id: string;
  type: CalculatorType;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
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
  results: Record<string, unknown> | null;
  history: CalculatorResult[];
}


export interface CalculatorLayoutProps {
  title: string;
  description?: string;
  children: import('react').ReactNode;
  sidebar?: import('react').ReactNode;
  className?: string;
}