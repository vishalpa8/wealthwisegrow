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
  const principal = parseRobustNumber(inputs.principal);
  const rate = parseRobustNumber(inputs.rate);
  const years = parseRobustNumber(inputs.years);
  const extraPayment = parseRobustNumber(inputs.extraPayment);

  if (principal <= 0 || rate < 0 || years <= 0) {
    return createDefaultLoanResult(principal);
  }

  const monthlyRate = rate / 1200;
  const numberOfPayments = years * 12;

  const monthlyPayment = calculateMonthlyPayment(principal, monthlyRate, numberOfPayments);
  const roundedMonthlyPayment = Math.round(monthlyPayment * 100) / 100;

  const standardTotalPayment = roundedMonthlyPayment * numberOfPayments;
  const standardTotalInterest = Math.max(0, standardTotalPayment - principal);

  const paymentSchedule = generateLoanPaymentSchedule(
    principal,
    monthlyRate,
    numberOfPayments,
    roundedMonthlyPayment,
    extraPayment
  );

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

function calculateMonthlyPayment(principal: number, monthlyRate: number, numberOfPayments: number): number {
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  const powerTerm = Math.pow(1 + monthlyRate, numberOfPayments);
  return principal * (monthlyRate * powerTerm) / (powerTerm - 1);
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

  for (let month = 1; month <= numberOfPayments; month++) {
    if (balance <= 0.01) break;

    const interestPayment = balance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;
    let actualPayment = monthlyPayment;
    let appliedExtraPayment = extraPayment;

    if (balance <= monthlyPayment + extraPayment) {
      principalPayment = balance;
      actualPayment = balance + interestPayment;
      appliedExtraPayment = 0;
    }
    
    const totalPrincipalToPay = principalPayment + appliedExtraPayment;
    
    if (totalPrincipalToPay > balance) {
        principalPayment = balance;
        appliedExtraPayment = 0;
    }

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