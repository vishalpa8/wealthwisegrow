/**
 * Centralized Financial Math Library
 * 
 * Provides highly robust, mathematically sound formulas for compounding, EMI, SIP, 
 * and present/future values, handling edge cases like 0% interest safely.
 */

/**
 * Calculate Equated Monthly Installment (EMI)
 */
export function calculateEMI(principal: number, annualRate: number, totalMonths: number): number {
  if (principal <= 0 || totalMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / totalMonths;
  
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
         (Math.pow(1 + monthlyRate, totalMonths) - 1);
}

/**
 * Calculate Future Value of a single lumpsum investment
 * @param periodsPerYear 1 for yearly, 12 for monthly compounding
 */
export function calculateFutureValue(principal: number, annualRate: number, totalPeriods: number, periodsPerYear = 1): number {
  if (principal <= 0) return 0;
  const ratePerPeriod = annualRate / 100 / periodsPerYear;
  return principal * Math.pow(1 + ratePerPeriod, totalPeriods);
}

/**
 * Calculate Present Value required to reach a specific Future Value
 */
export function calculatePresentValue(futureValue: number, annualRate: number, totalPeriods: number, periodsPerYear = 1): number {
  if (futureValue <= 0) return 0;
  const ratePerPeriod = annualRate / 100 / periodsPerYear;
  return futureValue / Math.pow(1 + ratePerPeriod, totalPeriods);
}

/**
 * Calculate Future Value of Systematic Investment Plan (SIP)
 * Assumes payments are made at the beginning of each month (Annuity Due)
 */
export function calculateSIPFutureValue(monthlyInvestment: number, annualRate: number, totalMonths: number): number {
  if (monthlyInvestment <= 0 || totalMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return monthlyInvestment * totalMonths;
  
  return monthlyInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
}

/**
 * Calculate Required Monthly SIP to reach a target corpus
 * Assumes payments are made at the beginning of each month (Annuity Due)
 */
export function calculateRequiredSIP(targetCorpus: number, annualRate: number, totalMonths: number): number {
  if (targetCorpus <= 0 || totalMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return targetCorpus / totalMonths;
  
  return (targetCorpus * monthlyRate) / ((Math.pow(1 + monthlyRate, totalMonths) - 1) * (1 + monthlyRate));
}
