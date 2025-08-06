/**
 * Advanced EMI Calculator Logic
 *
 * This module provides the core calculation function for the Advanced EMI calculator,
 * including support for various prepayment scenarios and detailed amortization schedules.
 */

import { parseRobustNumber } from '../utils/number';

/**
 * Defines the input parameters for the advanced EMI calculation.
 */
export interface EMIInputs {
  loanAmount: number;
  interestRate: number;
  loanTenure: number;
  tenureType: "years" | "months";
  prepaymentAmount: number;
  prepaymentFrequency: "none" | "yearly" | "monthly";
}

/**
 * Defines the structure of the calculated EMI result.
 */
export interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
  interestToLoanRatio: number;
  amortizationSchedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
  error?: string;
}


function createErrorResult(error: string): EMIResult {
  return {
    monthlyEMI: 0,
    totalInterest: 0,
    totalAmount: 0,
    interestToLoanRatio: 0,
    amortizationSchedule: [],
    error,
  };
}

/**
 * Calculates the Advanced EMI, including total interest, total amount,
 * and a full amortization schedule with optional prepayments.
 *
 * @param inputs - The EMI calculation parameters.
 * @returns The calculated EMI results.
 */
export function calculateAdvancedEMI(inputs: EMIInputs): EMIResult {
  const loanAmount = parseRobustNumber(inputs.loanAmount);
  const interestRate = parseRobustNumber(inputs.interestRate);
  const loanTenure = parseRobustNumber(inputs.loanTenure);
  const prepaymentAmount = parseRobustNumber(inputs.prepaymentAmount);

  if (loanAmount <= 0) {
    return createErrorResult("Loan amount must be positive.");
  }
  if (interestRate < 0) {
    return createErrorResult("Interest rate cannot be negative.");
  }
  if (loanTenure <= 0) {
    return createErrorResult("Loan tenure must be positive.");
  }
   if (prepaymentAmount < 0) {
    return createErrorResult("Prepayment amount cannot be negative.");
  }

  const tenureType = inputs.tenureType || "years";
  const prepaymentFrequency = inputs.prepaymentFrequency || "none";

  const totalMonths = tenureType === "years" ? loanTenure * 12 : loanTenure;
  const monthlyRate = interestRate / 100 / 12;

  let emi = 0;
  if (monthlyRate === 0) {
    emi = loanAmount / totalMonths;
  } else {
    emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  let balance = loanAmount;
  let totalInterestPaid = 0;
  const amortizationSchedule = [];

  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = emi - interestPayment;

    let prepayment = 0;
    if (prepaymentAmount > 0) {
      if (prepaymentFrequency === "monthly") {
        prepayment = prepaymentAmount;
      } else if (prepaymentFrequency === "yearly" && month % 12 === 0) {
        prepayment = prepaymentAmount;
      }
    }

    principalPayment += prepayment;

    if (principalPayment > balance) {
      principalPayment = balance;
    }

    balance -= principalPayment;
    totalInterestPaid += interestPayment;

    amortizationSchedule.push({
      month,
      emi: emi + prepayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });

    if (balance <= 0) break;
  }

  const totalAmount = loanAmount + totalInterestPaid;
  const interestToLoanRatio =
    loanAmount > 0 ? (totalInterestPaid / loanAmount) * 100 : 0;

  return {
    monthlyEMI: isFinite(emi) ? emi : 0,
    totalInterest: isFinite(totalInterestPaid) ? totalInterestPaid : 0,
    totalAmount: isFinite(totalAmount) ? totalAmount : 0,
    interestToLoanRatio: isFinite(interestToLoanRatio) ? interestToLoanRatio : 0,
    amortizationSchedule,
  };
}
