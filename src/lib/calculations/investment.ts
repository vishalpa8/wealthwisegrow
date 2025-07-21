import type { InvestmentInputs } from "../validations/calculator";

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
    initialAmount,
    monthlyContribution,
    annualReturn,
    years,
    compoundingFrequency,
  } = inputs;

  const compoundingPeriods = getCompoundingPeriods(compoundingFrequency);
  const periodicRate = (annualReturn / 100) / compoundingPeriods;
  // const totalPeriods = years * compoundingPeriods; // Not used in the calculation

  // Calculate future value with compound interest
  let currentBalance = initialAmount;
  let totalContributions = initialAmount;
  const yearlyBreakdown: InvestmentYearlyBreakdown[] = [];

  for (let year = 1; year <= years; year++) {
    const startingBalance = currentBalance;
    const yearlyContributions = monthlyContribution * 12;
    
    // Calculate growth for this year with monthly contributions
    let yearEndBalance = startingBalance;
    let yearGrowth = 0;

    for (let month = 1; month <= 12; month++) {
      // Add monthly contribution at the beginning of the month
      yearEndBalance += monthlyContribution;
      
      // Apply monthly growth
      const monthlyGrowth = yearEndBalance * (periodicRate / (12 / compoundingPeriods));
      yearEndBalance += monthlyGrowth;
      yearGrowth += monthlyGrowth;
    }

    totalContributions += yearlyContributions;
    currentBalance = yearEndBalance;

    yearlyBreakdown.push({
      year,
      startingBalance,
      contributions: yearlyContributions,
      growth: yearGrowth,
      endingBalance: yearEndBalance,
      cumulativeContributions: totalContributions,
      cumulativeGrowth: yearEndBalance - totalContributions,
    });
  }

  const finalAmount = currentBalance;
  const totalGrowth = finalAmount - totalContributions;
  const annualizedReturn = totalContributions > 0 
    ? (Math.pow(finalAmount / totalContributions, 1 / years) - 1) * 100
    : 0;

  return {
    finalAmount,
    totalContributions,
    totalGrowth,
    annualizedReturn,
    yearlyBreakdown,
  };
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