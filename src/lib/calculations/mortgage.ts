import type { MortgageInputs } from "../validations/calculator";
import { 
  parseRobustNumber, 
  safeDivide, 
  safeMultiply, 
  safeAdd, 
  safePower,
  roundToPrecision,
  isEffectivelyZero
} from "../utils/number";

export interface MortgageResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  loanToValue: number;
  paymentSchedule: PaymentScheduleItem[];
}

export interface PaymentScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
}

export function calculateMortgage(inputs: MortgageInputs): MortgageResults {
  // Use robust number parsing for all input values
  const principal = parseRobustNumber(inputs.principal);
  const rate = parseRobustNumber(inputs.rate);
  const years = parseRobustNumber(inputs.years);
  const downPayment = parseRobustNumber(inputs.downPayment);
  const propertyTax = parseRobustNumber(inputs.propertyTax);
  const insurance = parseRobustNumber(inputs.insurance);
  const pmi = parseRobustNumber(inputs.pmi);

  const loanAmount = Math.max(0, principal - downPayment);
  const monthlyRate = safeDivide(rate, 1200); // rate / 100 / 12
  const numberOfPayments = Math.max(1, years * 12);

  // Calculate monthly principal and interest payment
  let monthlyPrincipalAndInterest: number;
  
  if (isEffectivelyZero(monthlyRate)) {
    // Zero interest rate case
    monthlyPrincipalAndInterest = safeDivide(loanAmount, numberOfPayments);
  } else {
    // Standard mortgage formula with safe operations
    const onePlusRate = 1 + monthlyRate;
    const powerTerm = safePower(onePlusRate, numberOfPayments);
    const numerator = safeMultiply(safeMultiply(loanAmount, monthlyRate), powerTerm);
    const denominator = powerTerm - 1;
    monthlyPrincipalAndInterest = safeDivide(numerator, denominator);
  }

  // Calculate other monthly costs with safe division
  const monthlyPropertyTax = safeDivide(propertyTax, 12);
  const monthlyInsurance = safeDivide(insurance, 12);
  const monthlyPMI = safeDivide(pmi, 12);

  // Total monthly payment with safe addition
  const monthlyPayment = safeAdd(
    monthlyPrincipalAndInterest, 
    monthlyPropertyTax, 
    monthlyInsurance, 
    monthlyPMI
  );

  // Calculate totals with safe operations
  const totalPayment = safeMultiply(monthlyPrincipalAndInterest, numberOfPayments);
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  // Calculate loan-to-value ratio with safe division
  const loanToValue = principal > 0 ? safeDivide(loanAmount, principal) * 100 : 0;

  // Generate payment schedule
  const paymentSchedule = generatePaymentSchedule(loanAmount, monthlyRate, numberOfPayments, monthlyPrincipalAndInterest);

  return {
    monthlyPayment: roundToPrecision(monthlyPayment, 2),
    totalPayment: roundToPrecision(totalPayment, 2),
    totalInterest: roundToPrecision(totalInterest, 2),
    monthlyPrincipalAndInterest: roundToPrecision(monthlyPrincipalAndInterest, 2),
    monthlyPropertyTax: roundToPrecision(monthlyPropertyTax, 2),
    monthlyInsurance: roundToPrecision(monthlyInsurance, 2),
    monthlyPMI: roundToPrecision(monthlyPMI, 2),
    loanToValue: roundToPrecision(loanToValue, 2),
    paymentSchedule,
  };
}

function generatePaymentSchedule(
  loanAmount: number,
  monthlyRate: number,
  numberOfPayments: number,
  monthlyPayment: number
): PaymentScheduleItem[] {
  if (isEffectivelyZero(loanAmount)) {
    return [];
  }

  const schedule: PaymentScheduleItem[] = [];
  let balance = parseRobustNumber(loanAmount);
  let cumulativeInterest = 0;

  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = safeMultiply(balance, monthlyRate);
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    balance = Math.max(0, balance - principalPayment);
    cumulativeInterest = safeAdd(cumulativeInterest, interestPayment);

    schedule.push({
      month,
      payment: roundToPrecision(monthlyPayment, 2),
      principal: roundToPrecision(principalPayment, 2),
      interest: roundToPrecision(interestPayment, 2),
      balance: roundToPrecision(balance, 2),
      cumulativeInterest: roundToPrecision(cumulativeInterest, 2),
    });

    // Break if balance is effectively zero
    if (isEffectivelyZero(balance)) break;
  }

  return schedule;
}