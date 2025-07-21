import { SafeMath, roundToPrecision, isSafeNumber } from '../utils/currency';

// Error handling wrapper for all calculations
function safeCalculation<T>(calculation: () => T, fallback: T): T {
  try {
    const result = calculation();
    return result;
  } catch {
    // console.warn('Calculation error:', error);
    return fallback;
  }
}

// SIP (Systematic Investment Plan) Calculator
export interface SIPInputs {
  monthlyInvestment: number;
  annualReturn: number;
  years: number;
}

export interface SIPResults {
  totalInvestment: number;
  maturityAmount: number;
  totalGains: number;
  monthlyBreakdown: SIPMonthlyBreakdown[];
  error?: string;
}

export interface SIPMonthlyBreakdown {
  month: number;
  investment: number;
  balance: number;
  totalInvested: number;
  totalGains: number;
}

export function calculateSIP(inputs: SIPInputs): SIPResults {
  return safeCalculation(() => {
    const { monthlyInvestment, annualReturn, years } = inputs;
    
    // Validate inputs
    if (!isSafeNumber(monthlyInvestment) || !isSafeNumber(annualReturn) || !isSafeNumber(years)) {
      return {
        totalInvestment: 0,
        maturityAmount: 0,
        totalGains: 0,
        monthlyBreakdown: [],
        error: 'Invalid input values'
      };
    }
    
    const monthlyRate = SafeMath.divide(annualReturn, SafeMath.multiply(100, 12));
    const totalMonths = SafeMath.multiply(years, 12);
    
    if (totalMonths > 1200) { // Max 100 years
      return {
        totalInvestment: 0,
        maturityAmount: 0,
        totalGains: 0,
        monthlyBreakdown: [],
        error: 'Investment period too long'
      };
    }
    
    let balance = 0;
    let totalInvested = 0;
    const monthlyBreakdown: SIPMonthlyBreakdown[] = [];
    
    for (let month = 1; month <= totalMonths; month++) {
      totalInvested = SafeMath.add(totalInvested, monthlyInvestment);
      balance = SafeMath.multiply(
        SafeMath.add(balance, monthlyInvestment),
        SafeMath.add(1, monthlyRate)
      );
      
      // Prevent infinite loops and memory issues
      if (!isSafeNumber(balance) || month > 1200) {
        break;
      }
      
      monthlyBreakdown.push({
        month,
        investment: roundToPrecision(monthlyInvestment),
        balance: roundToPrecision(balance),
        totalInvested: roundToPrecision(totalInvested),
        totalGains: roundToPrecision(SafeMath.subtract(balance, totalInvested))
      });
    }
    
    return {
      totalInvestment: roundToPrecision(totalInvested),
      maturityAmount: roundToPrecision(balance),
      totalGains: roundToPrecision(SafeMath.subtract(balance, totalInvested)),
      monthlyBreakdown
    };
  }, {
    totalInvestment: 0,
    maturityAmount: 0,
    totalGains: 0,
    monthlyBreakdown: [],
    error: 'Calculation failed'
  });
}

// Lumpsum Investment Calculator
export interface LumpsumInputs {
  principal: number;
  annualReturn: number;
  years: number;
}

export interface LumpsumResults {
  principal: number;
  maturityAmount: number;
  totalGains: number;
  yearlyBreakdown: LumpsumYearlyBreakdown[];
}

export interface LumpsumYearlyBreakdown {
  year: number;
  amount: number;
  gains: number;
}

export function calculateLumpsum(inputs: LumpsumInputs): LumpsumResults {
  const { principal, annualReturn, years } = inputs;
  const rate = annualReturn / 100;
  
  const yearlyBreakdown: LumpsumYearlyBreakdown[] = [];
  let currentAmount = principal;
  
  for (let year = 1; year <= years; year++) {
    currentAmount = currentAmount * (1 + rate);
    yearlyBreakdown.push({
      year,
      amount: currentAmount,
      gains: currentAmount - principal
    });
  }
  
  const maturityAmount = principal * Math.pow(1 + rate, years);
  
  return {
    principal,
    maturityAmount,
    totalGains: maturityAmount - principal,
    yearlyBreakdown
  };
}

// PPF (Public Provident Fund) Calculator
export interface PPFInputs {
  yearlyInvestment: number;
  years: number; // minimum 15 years
}

export interface PPFResults {
  totalInvestment: number;
  maturityAmount: number;
  totalGains: number;
  yearlyBreakdown: PPFYearlyBreakdown[];
}

export interface PPFYearlyBreakdown {
  year: number;
  investment: number;
  interest: number;
  balance: number;
  totalInvested: number;
}

export function calculatePPF(inputs: PPFInputs): PPFResults {
  const { yearlyInvestment, years } = inputs;
  const ppfRate = 0.071; // Current PPF rate ~7.1%
  
  let balance = 0;
  let totalInvested = 0;
  const yearlyBreakdown: PPFYearlyBreakdown[] = [];
  
  for (let year = 1; year <= years; year++) {
    totalInvested += yearlyInvestment;
    const interest = (balance + yearlyInvestment) * ppfRate;
    balance += yearlyInvestment + interest;
    
    yearlyBreakdown.push({
      year,
      investment: yearlyInvestment,
      interest,
      balance,
      totalInvested
    });
  }
  
  return {
    totalInvestment: totalInvested,
    maturityAmount: balance,
    totalGains: balance - totalInvested,
    yearlyBreakdown
  };
}

// Fixed Deposit (FD) Calculator
export interface FDInputs {
  principal: number;
  annualRate: number;
  years: number;
  compoundingFrequency: 'monthly' | 'quarterly' | 'yearly';
}

export interface FDResults {
  principal: number;
  maturityAmount: number;
  totalInterest: number;
  effectiveYield: number;
}

export function calculateFD(inputs: FDInputs): FDResults {
  const { principal, annualRate, years, compoundingFrequency } = inputs;
  const rate = annualRate / 100;
  
  let n: number;
  switch (compoundingFrequency) {
    case 'monthly': n = 12; break;
    case 'quarterly': n = 4; break;
    default: n = 1;
  }
  
  const maturityAmount = principal * Math.pow(1 + rate/n, n * years);
  const totalInterest = maturityAmount - principal;
  const effectiveYield = ((maturityAmount / principal) - 1) * 100;
  
  return {
    principal,
    maturityAmount,
    totalInterest,
    effectiveYield
  };
}

// Recurring Deposit (RD) Calculator
export interface RDInputs {
  monthlyDeposit: number;
  annualRate: number;
  years: number;
}

export interface RDResults {
  totalDeposits: number;
  maturityAmount: number;
  totalInterest: number;
  monthlyBreakdown: RDMonthlyBreakdown[];
}

export interface RDMonthlyBreakdown {
  month: number;
  deposit: number;
  interest: number;
  balance: number;
  totalDeposited: number;
}

export function calculateRD(inputs: RDInputs): RDResults {
  const { monthlyDeposit, annualRate, years } = inputs;
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;
  
  let balance = 0;
  let totalDeposited = 0;
  const monthlyBreakdown: RDMonthlyBreakdown[] = [];
  
  for (let month = 1; month <= totalMonths; month++) {
    totalDeposited += monthlyDeposit;
    const interest = balance * monthlyRate;
    balance = balance + monthlyDeposit + interest;
    
    monthlyBreakdown.push({
      month,
      deposit: monthlyDeposit,
      interest,
      balance,
      totalDeposited
    });
  }
  
  return {
    totalDeposits: totalDeposited,
    maturityAmount: balance,
    totalInterest: balance - totalDeposited,
    monthlyBreakdown
  };
}

// EPF (Employee Provident Fund) Calculator
export interface EPFInputs {
  basicSalary: number;
  employeeContribution: number; // percentage
  employerContribution: number; // percentage
  years: number;
}

export interface EPFResults {
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  totalContribution: number;
  maturityAmount: number;
  totalInterest: number;
  yearlyBreakdown: EPFYearlyBreakdown[];
}

export interface EPFYearlyBreakdown {
  year: number;
  employeeContribution: number;
  employerContribution: number;
  interest: number;
  balance: number;
}

export function calculateEPF(inputs: EPFInputs): EPFResults {
  const { basicSalary, employeeContribution, employerContribution, years } = inputs;
  const epfRate = 0.085; // Current EPF rate ~8.5%
  
  const monthlyEmployeeContrib = (basicSalary * employeeContribution / 100);
  const monthlyEmployerContrib = (basicSalary * employerContribution / 100);
  // const monthlyTotal = monthlyEmployeeContrib + monthlyEmployerContrib; // Not used in calculation
  
  let balance = 0;
  let totalEmpContrib = 0;
  let totalEmprerContrib = 0;
  const yearlyBreakdown: EPFYearlyBreakdown[] = [];
  
  for (let year = 1; year <= years; year++) {
    const yearlyEmpContrib = monthlyEmployeeContrib * 12;
    const yearlyEmprerContrib = monthlyEmployerContrib * 12;
    const yearlyContrib = yearlyEmpContrib + yearlyEmprerContrib;
    
    totalEmpContrib += yearlyEmpContrib;
    totalEmprerContrib += yearlyEmprerContrib;
    
    const interest = (balance + yearlyContrib) * epfRate;
    balance += yearlyContrib + interest;
    
    yearlyBreakdown.push({
      year,
      employeeContribution: yearlyEmpContrib,
      employerContribution: yearlyEmprerContrib,
      interest,
      balance
    });
  }
  
  return {
    totalEmployeeContribution: totalEmpContrib,
    totalEmployerContribution: totalEmprerContrib,
    totalContribution: totalEmpContrib + totalEmprerContrib,
    maturityAmount: balance,
    totalInterest: balance - (totalEmpContrib + totalEmprerContrib),
    yearlyBreakdown
  };
}

// Stock Dividend Yield Calculator
export interface DividendYieldInputs {
  stockPrice: number;
  annualDividend: number;
  numberOfShares: number;
}

export interface DividendYieldResults {
  dividendYield: number;
  annualDividendIncome: number;
  quarterlyDividendIncome: number;
  monthlyDividendIncome: number;
  totalInvestment: number;
}

export function calculateDividendYield(inputs: DividendYieldInputs): DividendYieldResults {
  const { stockPrice, annualDividend, numberOfShares } = inputs;
  
  const dividendYield = (annualDividend / stockPrice) * 100;
  const annualDividendIncome = annualDividend * numberOfShares;
  const totalInvestment = stockPrice * numberOfShares;
  
  return {
    dividendYield,
    annualDividendIncome,
    quarterlyDividendIncome: annualDividendIncome / 4,
    monthlyDividendIncome: annualDividendIncome / 12,
    totalInvestment
  };
}

// Gold Investment Calculator
export interface GoldInputs {
  investmentAmount: number;
  goldPricePerGram: number;
  years: number;
  expectedAnnualReturn: number;
}

export interface GoldResults {
  gramsOfGold: number;
  futureGoldPrice: number;
  futureValue: number;
  totalReturns: number;
  annualizedReturn: number;
}

export function calculateGoldInvestment(inputs: GoldInputs): GoldResults {
  const { investmentAmount, goldPricePerGram, years, expectedAnnualReturn } = inputs;
  
  const gramsOfGold = investmentAmount / goldPricePerGram;
  const futureGoldPrice = goldPricePerGram * Math.pow(1 + expectedAnnualReturn / 100, years);
  const futureValue = gramsOfGold * futureGoldPrice;
  const totalReturns = futureValue - investmentAmount;
  const annualizedReturn = Math.pow(futureValue / investmentAmount, 1 / years) - 1;
  
  return {
    gramsOfGold,
    futureGoldPrice,
    futureValue,
    totalReturns,
    annualizedReturn: annualizedReturn * 100
  };
}
