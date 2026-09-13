/**
 * Centralized Financial Math Library
 * 
 * Provides highly robust, mathematically sound formulas for compounding, EMI, SIP, 
 * and present/future values using big.js for arbitrary-precision decimal arithmetic.
 */

import Big from 'big.js';

// Configure Big.js precision if needed, but defaults are usually fine
// Big.DP = 20;

/**
 * Helper to safely instantiate Big without throwing on invalid input
 */
function safeBig(val: number | string | Big): Big {
  try {
    return new Big(val);
  } catch (e) {
    return new Big(0);
  }
}

/**
 * Calculate Equated Monthly Installment (EMI)
 */
export function calculateEMI(principal: number, annualRate: number, totalMonths: number): number {
  if (principal <= 0 || totalMonths <= 0) return 0;
  
  const p = safeBig(principal);
  const rate = safeBig(annualRate).div(100).div(12);
  const months = Math.round(totalMonths);
  
  if (rate.eq(0)) return p.div(months).toNumber();
  
  // (principal * monthlyRate * (1 + monthlyRate)^totalMonths) / ((1 + monthlyRate)^totalMonths - 1)
  const onePlusRatePow = safeBig(1).plus(rate).pow(months);
  const numerator = p.times(rate).times(onePlusRatePow);
  const denominator = onePlusRatePow.minus(1);
  
  // Catch division by zero due to precision loss on incredibly small rates
  if (denominator.eq(0)) return p.div(months).toNumber();
  
  return numerator.div(denominator).toNumber();
}

/**
 * Calculate Future Value of a single lumpsum investment
 * @param periodsPerYear 1 for yearly, 12 for monthly compounding
 */
export function calculateFutureValue(principal: number, annualRate: number, totalPeriods: number, periodsPerYear = 1): number {
  if (principal <= 0 || totalPeriods <= 0) return 0;
  
  const p = safeBig(principal);
  const ratePerPeriod = safeBig(annualRate).div(100).div(periodsPerYear || 1);
  const periods = Math.round(totalPeriods);
  
  return p.times(safeBig(1).plus(ratePerPeriod).pow(periods)).toNumber();
}

/**
 * Calculate Present Value required to reach a specific Future Value
 */
export function calculatePresentValue(futureValue: number, annualRate: number, totalPeriods: number, periodsPerYear = 1): number {
  if (futureValue <= 0 || totalPeriods <= 0) return 0;
  
  const fv = safeBig(futureValue);
  const ratePerPeriod = safeBig(annualRate).div(100).div(periodsPerYear || 1);
  const periods = Math.round(totalPeriods);
  
  const denominator = safeBig(1).plus(ratePerPeriod).pow(periods);
  if (denominator.eq(0)) return 0;
  
  return fv.div(denominator).toNumber();
}

/**
 * Calculate Future Value of Systematic Investment Plan (SIP)
 * Assumes payments are made at the beginning of each month (Annuity Due)
 */
export function calculateSIPFutureValue(monthlyInvestment: number, annualRate: number, totalMonths: number): number {
  if (monthlyInvestment <= 0 || totalMonths <= 0) return 0;
  
  const pmt = safeBig(monthlyInvestment);
  const rate = safeBig(annualRate).div(100).div(12);
  const months = Math.round(totalMonths);
  
  if (rate.eq(0)) return pmt.times(months).toNumber();
  
  // P * [ ((1 + r)^n - 1) / r ] * (1 + r)
  const onePlusRatePow = safeBig(1).plus(rate).pow(months);
  const fraction = onePlusRatePow.minus(1).div(rate);
  
  return pmt.times(fraction).times(safeBig(1).plus(rate)).toNumber();
}

/**
 * Calculate Required Monthly SIP to reach a target corpus
 * Assumes payments are made at the beginning of each month (Annuity Due)
 */
export function calculateRequiredSIP(targetCorpus: number, annualRate: number, totalMonths: number): number {
  if (targetCorpus <= 0 || totalMonths <= 0) return 0;
  
  const fv = safeBig(targetCorpus);
  const rate = safeBig(annualRate).div(100).div(12);
  const months = Math.round(totalMonths);
  
  if (rate.eq(0)) return fv.div(months).toNumber();
  
  // FV / ( [ ((1 + r)^n - 1) / r ] * (1 + r) )
  const onePlusRatePow = safeBig(1).plus(rate).pow(months);
  const fraction = onePlusRatePow.minus(1).div(rate);
  const denominator = fraction.times(safeBig(1).plus(rate));
  
  if (denominator.eq(0)) return fv.div(months).toNumber();
  
  return fv.div(denominator).toNumber();
}
