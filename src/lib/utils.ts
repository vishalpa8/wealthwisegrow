import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Import number utilities to avoid duplication
export {
  formatLargeNumber,
  isEffectivelyZero,
  formatCurrencyIndian as formatCurrency,
  parseRobustNumber,
  roundToPrecision,
  safeDivide,
  safeMultiply,
  safeAdd,
  safePower
} from './utils/number';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
