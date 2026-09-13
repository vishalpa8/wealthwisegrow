import type { LoanInputs } from "../validations/calculator";
import { 
  parseRobustNumber, 
  roundToPrecision
} from "../utils/number";

export interface LoanResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffTime: number; // in months
  interestSaved: number;
  paymentSchedule: LoanPaymentScheduleItem[];
  principal: number;
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
  inputs = inputs || ({} as any);
  const principal = parseRobustNumber(inputs.principal);
  const rate = parseRobustNumber(inputs.rate);
  const years = parseRobustNumber(inputs.years);
  const extraPayment = parseRobustNumber(inputs.extraPayment);

  if (principal <= 0 || rate < 0 || years <= 0) {
    return createDefaultLoanResult(principal);
  }

  const monthlyRate = rate / 1200;
  const numberOfPayments = years * 12;

  const monthlyPayment = calculateMonthlyPaymentWrapper(principal, rate, numberOfPayments);
  const roundedMonthlyPayment = Math.round(monthlyPayment * 100) / 100;

  const standardSchedule = generateLoanPaymentSchedule(
    principal,
    monthlyRate,
    numberOfPayments,
    roundedMonthlyPayment,
    0
  );

  const standardTotalPayment = standardSchedule.reduce((sum, item) => sum + item.payment, 0);
  const standardTotalInterest = standardSchedule.reduce((sum, item) => sum + item.interest, 0);

  const paymentSchedule = extraPayment > 0 
    ? generateLoanPaymentSchedule(
        principal,
        monthlyRate,
        numberOfPayments,
        roundedMonthlyPayment,
        extraPayment
      )
    : standardSchedule;

  const actualPayoffTime = paymentSchedule.length;
  const totalPayment = paymentSchedule.reduce((sum, item) => sum + item.payment + item.extraPayment, 0);
  const totalInterest = paymentSchedule.reduce((sum, item) => sum + item.interest, 0);
  const interestSaved = Math.max(0, standardTotalInterest - totalInterest);

  return {
    monthlyPayment: roundedMonthlyPayment,
    totalPayment: roundToPrecision(totalPayment, 2),
    totalInterest: roundToPrecision(totalInterest, 2),
    payoffTime: actualPayoffTime,
    interestSaved: roundToPrecision(interestSaved, 2),
    paymentSchedule,
    principal,
  };
}

import { calculateEMI } from "./financial-math";

function calculateMonthlyPaymentWrapper(principal: number, annualRate: number, numberOfPayments: number): number {
  return calculateEMI(principal, annualRate, numberOfPayments);
}

function generateLoanPaymentSchedule(
  loanAmount: number,
  monthlyRate: number,
  numberOfPayments: number,
  monthlyPayment: number,
  extraPayment: number
): LoanPaymentScheduleItem[] {
  const schedule: LoanPaymentScheduleItem[] = [];
  let balance = loanAmount;
  let cumulativeInterest = 0;
  
  const safeExtraPayment = Math.max(0, extraPayment);

  for (let month = 1; month <= numberOfPayments; month++) {
    if (balance <= 0.005) break;

    const interestPayment = balance * monthlyRate;
    const requiredTotalPayment = balance + interestPayment;
    let intendedTotalPayment = monthlyPayment + safeExtraPayment;
    
    // If it's the last scheduled payment, we MUST clear the remaining balance, 
    // even if it's slightly higher due to rounding downwards in previous months.
    if (month === numberOfPayments) {
      intendedTotalPayment = Math.max(intendedTotalPayment, requiredTotalPayment);
    }
    
    const actualTotalPayment = Math.min(intendedTotalPayment, requiredTotalPayment);
    
    let actualPayment: number;
    let appliedExtraPayment: number;
    
    if (actualTotalPayment <= monthlyPayment) {
      actualPayment = actualTotalPayment;
      appliedExtraPayment = 0;
    } else {
      actualPayment = monthlyPayment;
      appliedExtraPayment = actualTotalPayment - monthlyPayment;
    }
    
    const principalPayment = actualPayment - interestPayment;
    
    balance -= (principalPayment + appliedExtraPayment);
    cumulativeInterest += interestPayment;

    schedule.push({
      month,
      payment: roundToPrecision(actualPayment, 2),
      principal: roundToPrecision(principalPayment + appliedExtraPayment, 2),
      interest: roundToPrecision(interestPayment, 2),
      extraPayment: roundToPrecision(appliedExtraPayment, 2),
      balance: roundToPrecision(Math.max(0, balance), 2),
      cumulativeInterest: roundToPrecision(cumulativeInterest, 2),
    });
  }
  return schedule;
}

function createDefaultLoanResult(principal: number): LoanResults {
  return {
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    payoffTime: 0,
    interestSaved: 0,
    paymentSchedule: [],
    principal: principal > 0 ? principal : 0,
  };
}