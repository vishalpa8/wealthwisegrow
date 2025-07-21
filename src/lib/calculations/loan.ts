import type { LoanInputs } from "../validations/calculator";

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
  // Use explicit type assertions for input values
  const principal = Number(inputs.principal);
  const rate = Number(inputs.rate);
  const years = Number(inputs.years);
  const extraPayment = Number(inputs.extraPayment || 0);

  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;

  // Calculate standard monthly payment
  const monthlyPayment = monthlyRate === 0 
    ? principal / numberOfPayments
    : (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  // Calculate without extra payments
  const standardTotalPayment = monthlyPayment * numberOfPayments;
  const standardTotalInterest = standardTotalPayment - principal;

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
    monthlyPayment,
    totalPayment,
    totalInterest,
    payoffTime: actualPayoffTime,
    interestSaved,
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
  let balance = loanAmount;
  let cumulativeInterest = 0;
  let month = 1;

  while (balance > 0.01) { // Small threshold to handle rounding
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    const actualExtraPayment = Math.min(extraPayment, balance - principalPayment);
    
    balance -= (principalPayment + actualExtraPayment);
    cumulativeInterest += interestPayment;

    // Ensure balance doesn't go negative
    if (balance < 0) balance = 0;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      extraPayment: actualExtraPayment,
      balance,
      cumulativeInterest,
    });

    month++;

    // Safety check to prevent infinite loops
    if (month > 1000) break;
  }

  return schedule;
}