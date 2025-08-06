import type { InvestmentInputs } from "../validations/calculator";
import {
  parseRobustNumber,
  safeDivide,
  safeMultiply,
  safeAdd,
  safePower,
  roundToPrecision,
} from '../utils/number';

export interface InvestmentResults {
  finalAmount: number;
  totalContributions: number;
  totalGrowth: number;
  annualizedReturn: number;
  yearlyBreakdown: InvestmentYearlyBreakdown[];
}

export interface InvestmentYearlyBreakdown {
  year: number;
  startingBalance: number;
  contributions: number;
  growth: number;
  endingBalance: number;
  cumulativeContributions: number;
  cumulativeGrowth: number;
}

export function calculateInvestment(inputs: InvestmentInputs): InvestmentResults {
  const {
    initialAmount: initialAmountInput,
    monthlyContribution: monthlyContributionInput,
    annualReturn: annualReturnInput,
    years: yearsInput,
    compoundingFrequency,
  } = inputs;

  const initialAmount = parseRobustNumber(initialAmountInput);
  const monthlyContribution = parseRobustNumber(monthlyContributionInput);
  const annualReturn = parseRobustNumber(annualReturnInput);
  const years = parseRobustNumber(yearsInput);

  const compoundingPeriodsPerYear = getCompoundingPeriods(compoundingFrequency);
  const rate = safeDivide(annualReturn, 100);

  // Future value of initial amount
  const fvInitial = safeMultiply(initialAmount, safePower(safeAdd(1, safeDivide(rate, compoundingPeriodsPerYear)), safeMultiply(compoundingPeriodsPerYear, years)));

  // Future value of monthly contributions
  const monthlyRate = safeDivide(rate, 12);
  const totalMonths = safeMultiply(years, 12);
  
  let fvContributions;
  if (rate === 0 || monthlyRate === 0) {
    // For zero interest rate, monthly contributions just accumulate without growth
    fvContributions = safeMultiply(monthlyContribution, totalMonths);
  } else {
    fvContributions = safeMultiply(monthlyContribution, safeDivide(safePower(safeAdd(1, monthlyRate), totalMonths) - 1, monthlyRate));
  }

  const finalAmount = safeAdd(fvInitial, fvContributions);
  const totalContributions = safeAdd(initialAmount, safeMultiply(monthlyContribution, totalMonths));
  const totalGrowth = finalAmount - totalContributions;
  const annualizedReturn = totalContributions > 0
    ? roundToPrecision(safeMultiply(safePower(safeDivide(finalAmount, totalContributions), safeDivide(1, years)) - 1, 100))
    : 0;

  // Generate yearly breakdown
  const yearlyBreakdown = generateYearlyBreakdown(
    initialAmount,
    monthlyContribution,
    monthlyRate,
    years
  );

  return {
    finalAmount: roundToPrecision(finalAmount),
    totalContributions: roundToPrecision(totalContributions),
    totalGrowth: roundToPrecision(totalGrowth),
    annualizedReturn,
    yearlyBreakdown,
  };
}

function generateYearlyBreakdown(
  initialAmount: number,
  monthlyContribution: number,
  monthlyRate: number,
  years: number
): InvestmentYearlyBreakdown[] {
  const breakdown: InvestmentYearlyBreakdown[] = [];
  let balance = initialAmount;
  let cumulativeContributions = initialAmount;
  let cumulativeGrowth = 0;

  for (let year = 1; year <= years; year++) {
    const startingBalance = balance;
    const yearlyContributions = safeMultiply(monthlyContribution, 12);
    
    // Calculate growth for each month of the year
    let yearlyGrowth = 0;
    let currentBalance = startingBalance;
    
    for (let month = 1; month <= 12; month++) {
      const monthlyGrowth = safeMultiply(currentBalance, monthlyRate);
      yearlyGrowth = safeAdd(yearlyGrowth, monthlyGrowth);
      currentBalance = safeAdd(safeAdd(currentBalance, monthlyGrowth), monthlyContribution);
    }
    
    balance = currentBalance;
    cumulativeContributions = safeAdd(cumulativeContributions, yearlyContributions);
    cumulativeGrowth = safeAdd(cumulativeGrowth, yearlyGrowth);
    
    breakdown.push({
      year,
      startingBalance: roundToPrecision(startingBalance),
      contributions: roundToPrecision(yearlyContributions),
      growth: roundToPrecision(yearlyGrowth),
      endingBalance: roundToPrecision(balance),
      cumulativeContributions: roundToPrecision(cumulativeContributions),
      cumulativeGrowth: roundToPrecision(cumulativeGrowth),
    });
  }
  
  return breakdown;
}

function getCompoundingPeriods(frequency: InvestmentInputs["compoundingFrequency"]): number {
  switch (frequency) {
    case "annually":
      return 1;
    case "semiannually":
      return 2;
    case "quarterly":
      return 4;
    case "monthly":
      return 12;
    case "daily":
      return 365;
    default:
      return 12;
  }
}