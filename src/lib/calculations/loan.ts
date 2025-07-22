import type { LoanInputs } from "../validations/calculator";
import { 
  parseRobustNumber, 
  safeDivide, 
  safeMultiply, 
  safeAdd, 
  safePower,
  roundToPrecision,
  isEffectivelyZero
} from "../utils/number";

export interface LoanResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffTime: number; // in months
  interestSaved: number; // if extra payments are made
  paymentSchedule: LoanPaymentScheduleItem[];
}

export interface LoanPaymentScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
  cumulativeInterest: number;
}

export function calculateLoan(inputs: LoanInputs): LoanResults {
  // Use robust number parsing for all input values
  const principal = parseRobustNumber(inputs.principal);
  const rate = parseRobustNumber(inputs.rate);
  const years = parseRobustNumber(inputs.years);
  const extraPayment = parseRobustNumber(inputs.extraPayment);

  const monthlyRate = safeDivide(rate, 1200); // rate / 100 / 12
  const numberOfPayments = Math.max(1, years * 12);

  // Calculate standard monthly payment with safe operations
  let monthlyPayment: number;
  
  if (isEffectivelyZero(monthlyRate)) {
    // Zero interest rate case
    monthlyPayment = safeDivide(principal, numberOfPayments);
  } else {
    // Standard loan formula with safe operations
    const onePlusRate = 1 + monthlyRate;
    const powerTerm = safePower(onePlusRate, numberOfPayments);
    const numerator = safeMultiply(safeMultiply(principal, monthlyRate), powerTerm);
    const denominator = powerTerm - 1;
    monthlyPayment = safeDivide(numerator, denominator);
  }

  // Calculate without extra payments using safe operations
  const standardTotalPayment = safeMultiply(monthlyPayment, numberOfPayments);
  const standardTotalInterest = Math.max(0, standardTotalPayment - principal);

  // Calculate with extra payments
  const paymentSchedule = generateLoanPaymentSchedule(
    principal,
    monthlyRate,
    monthlyPayment,
    extraPayment
  );

  const actualPayoffTime = paymentSchedule.length;
  const totalPayment = paymentSchedule.reduce((sum, item) => sum + item.payment + item.extraPayment, 0);
  const totalInterest = paymentSchedule.reduce((sum, item) => sum + item.interest, 0);
  const interestSaved = standardTotalInterest - totalInterest;

  return {
    monthlyPayment: roundToPrecision(monthlyPayment, 2),
    totalPayment: roundToPrecision(totalPayment, 2),
    totalInterest: roundToPrecision(totalInterest, 2),
    payoffTime: actualPayoffTime,
    interestSaved: roundToPrecision(Math.max(0, interestSaved), 2),
    paymentSchedule,
  };
}

function generateLoanPaymentSchedule(
  loanAmount: number,
  monthlyRate: number,
  monthlyPayment: number,
  extraPayment: number
): LoanPaymentScheduleItem[] {
  const schedule: LoanPaymentScheduleItem[] = [];
  let balance = parseRobustNumber(loanAmount);
  let cumulativeInterest = 0;
  let month = 1;

  while (!isEffectivelyZero(balance) && balance > 0) {
    const interestPayment = safeMultiply(balance, monthlyRate);
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    const actualExtraPayment = Math.min(extraPayment, Math.max(0, balance - principalPayment));
    
    balance = Math.max(0, balance - principalPayment - actualExtraPayment);
    cumulativeInterest = safeAdd(cumulativeInterest, interestPayment);

    schedule.push({
      month,
      payment: roundToPrecision(monthlyPayment, 2),
      principal: roundToPrecision(principalPayment, 2),
      interest: roundToPrecision(interestPayment, 2),
      extraPayment: roundToPrecision(actualExtraPayment, 2),
      balance: roundToPrecision(balance, 2),
      cumulativeInterest: roundToPrecision(cumulativeInterest, 2),
    });

    month++;

    // Safety check to prevent infinite loops
    if (month > 1000) break;
  }

  return schedule;
}