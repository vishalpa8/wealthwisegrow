import { 
  parseRobustNumber, 
  safeDivide, 
  safeMultiply, 
  safeAdd, 
  safePower,
  roundToPrecision
} from '../utils/number';

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

// Helper function to check if a number is safe for calculations
function isSafeNumber(value: any): boolean {
  const parsed = parseRobustNumber(value);
  return isFinite(parsed) && !isNaN(parsed);
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
    // Use robust parsing and handle edge cases gracefully
    const monthlyInvestment = Math.abs(parseRobustNumber(inputs.monthlyInvestment) || 0);
    const annualReturn = Math.abs(parseRobustNumber(inputs.annualReturn) || 0);
    const years = Math.max(parseRobustNumber(inputs.years) || 1, 1);
    
    // Handle zero investment gracefully
    if (monthlyInvestment === 0) {
      return {
        totalInvestment: 0,
        maturityAmount: 0,
        totalGains: 0,
        monthlyBreakdown: []
      };
    }
    
    const monthlyRate = safeDivide(annualReturn, safeMultiply(100, 12));
    const totalMonths = safeMultiply(years, 12);
    
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
      totalInvested = safeAdd(totalInvested, monthlyInvestment);
      balance = safeMultiply(
        safeAdd(balance, monthlyInvestment),
        safeAdd(1, monthlyRate)
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
        totalGains: roundToPrecision(Math.max(0, balance - totalInvested))
      });
    }
    
    return {
      totalInvestment: roundToPrecision(totalInvested),
      maturityAmount: roundToPrecision(balance),
      totalGains: roundToPrecision(Math.max(0, balance - totalInvested)),
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
  return safeCalculation(() => {
    const { principal, annualReturn, years } = inputs;
    const rate = safeDivide(annualReturn, 100);
    
    const yearlyBreakdown: LumpsumYearlyBreakdown[] = [];
    let currentAmount = parseRobustNumber(principal);
    
    for (let year = 1; year <= years; year++) {
      currentAmount = safeMultiply(currentAmount, safeAdd(1, rate));
      yearlyBreakdown.push({
        year,
        amount: roundToPrecision(currentAmount),
        gains: roundToPrecision(Math.max(0, currentAmount - principal))
      });
    }
    
    const maturityAmount = safeMultiply(principal, safePower(safeAdd(1, rate), years));
    
    return {
      principal: roundToPrecision(principal),
      maturityAmount: roundToPrecision(maturityAmount),
      totalGains: roundToPrecision(Math.max(0, maturityAmount - principal)),
      yearlyBreakdown
    };
  }, {
    principal: 0,
    maturityAmount: 0,
    totalGains: 0,
    yearlyBreakdown: []
  });
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
  return safeCalculation(() => {
    const { yearlyInvestment, years } = inputs;
    const ppfRate = 0.071; // Current PPF rate ~7.1%
    
    let balance = 0;
    let totalInvested = 0;
    const yearlyBreakdown: PPFYearlyBreakdown[] = [];
    
    for (let year = 1; year <= years; year++) {
      totalInvested = safeAdd(totalInvested, yearlyInvestment);
      const interest = safeMultiply(safeAdd(balance, yearlyInvestment), ppfRate);
      balance = safeAdd(safeAdd(balance, yearlyInvestment), interest);
      
      yearlyBreakdown.push({
        year,
        investment: roundToPrecision(yearlyInvestment),
        interest: roundToPrecision(interest),
        balance: roundToPrecision(balance),
        totalInvested: roundToPrecision(totalInvested)
      });
    }
    
    return {
      totalInvestment: roundToPrecision(totalInvested),
      maturityAmount: roundToPrecision(balance),
      totalGains: roundToPrecision(Math.max(0, balance - totalInvested)),
      yearlyBreakdown
    };
  }, {
    totalInvestment: 0,
    maturityAmount: 0,
    totalGains: 0,
    yearlyBreakdown: []
  });
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
  return safeCalculation(() => {
    const { principal, annualRate, years, compoundingFrequency } = inputs;
    const rate = safeDivide(annualRate, 100);
    
    let n: number;
    switch (compoundingFrequency) {
      case 'monthly': n = 12; break;
      case 'quarterly': n = 4; break;
      default: n = 1;
    }
    
    const maturityAmount = safeMultiply(principal, safePower(safeAdd(1, safeDivide(rate, n)), safeMultiply(n, years)));
    const totalInterest = Math.max(0, maturityAmount - principal);
    const effectiveYield = safeMultiply(Math.max(0, safeDivide(maturityAmount, principal) - 1), 100);
    
    return {
      principal: roundToPrecision(principal),
      maturityAmount: roundToPrecision(maturityAmount),
      totalInterest: roundToPrecision(totalInterest),
      effectiveYield: roundToPrecision(effectiveYield)
    };
  }, {
    principal: 0,
    maturityAmount: 0,
    totalInterest: 0,
    effectiveYield: 0
  });
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
  return safeCalculation(() => {
    const { monthlyDeposit, annualRate, years } = inputs;
    const monthlyRate = safeDivide(annualRate, safeMultiply(100, 12));
    const totalMonths = safeMultiply(years, 12);
    
    let balance = 0;
    let totalDeposited = 0;
    const monthlyBreakdown: RDMonthlyBreakdown[] = [];
    
    for (let month = 1; month <= totalMonths; month++) {
      totalDeposited = safeAdd(totalDeposited, monthlyDeposit);
      const interest = safeMultiply(balance, monthlyRate);
      balance = safeAdd(safeAdd(balance, monthlyDeposit), interest);
      
      monthlyBreakdown.push({
        month,
        deposit: roundToPrecision(monthlyDeposit),
        interest: roundToPrecision(interest),
        balance: roundToPrecision(balance),
        totalDeposited: roundToPrecision(totalDeposited)
      });
    }
    
    return {
      totalDeposits: roundToPrecision(totalDeposited),
      maturityAmount: roundToPrecision(balance),
      totalInterest: roundToPrecision(Math.max(0, balance - totalDeposited)),
      monthlyBreakdown
    };
  }, {
    totalDeposits: 0,
    maturityAmount: 0,
    totalInterest: 0,
    monthlyBreakdown: []
  });
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
  return safeCalculation(() => {
    const { basicSalary, employeeContribution, employerContribution, years } = inputs;
    const epfRate = 0.085; // Current EPF rate ~8.5%
    
    const monthlyEmployeeContrib = safeMultiply(basicSalary, safeDivide(employeeContribution, 100));
    const monthlyEmployerContrib = safeMultiply(basicSalary, safeDivide(employerContribution, 100));
    
    let balance = 0;
    let totalEmpContrib = 0;
    let totalEmprerContrib = 0;
    const yearlyBreakdown: EPFYearlyBreakdown[] = [];
    
    for (let year = 1; year <= years; year++) {
      const yearlyEmpContrib = safeMultiply(monthlyEmployeeContrib, 12);
      const yearlyEmprerContrib = safeMultiply(monthlyEmployerContrib, 12);
      const yearlyContrib = safeAdd(yearlyEmpContrib, yearlyEmprerContrib);
      
      totalEmpContrib = safeAdd(totalEmpContrib, yearlyEmpContrib);
      totalEmprerContrib = safeAdd(totalEmprerContrib, yearlyEmprerContrib);
      
      const interest = safeMultiply(safeAdd(balance, yearlyContrib), epfRate);
      balance = safeAdd(safeAdd(balance, yearlyContrib), interest);
      
      yearlyBreakdown.push({
        year,
        employeeContribution: roundToPrecision(yearlyEmpContrib),
        employerContribution: roundToPrecision(yearlyEmprerContrib),
        interest: roundToPrecision(interest),
        balance: roundToPrecision(balance)
      });
    }
    
    const totalContrib = safeAdd(totalEmpContrib, totalEmprerContrib);
    
    return {
      totalEmployeeContribution: roundToPrecision(totalEmpContrib),
      totalEmployerContribution: roundToPrecision(totalEmprerContrib),
      totalContribution: roundToPrecision(totalContrib),
      maturityAmount: roundToPrecision(balance),
      totalInterest: roundToPrecision(Math.max(0, balance - totalContrib)),
      yearlyBreakdown
    };
  }, {
    totalEmployeeContribution: 0,
    totalEmployerContribution: 0,
    totalContribution: 0,
    maturityAmount: 0,
    totalInterest: 0,
    yearlyBreakdown: []
  });
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
  return safeCalculation(() => {
    const { stockPrice, annualDividend, numberOfShares } = inputs;
    
    const dividendYield = safeMultiply(safeDivide(annualDividend, stockPrice), 100);
    const annualDividendIncome = safeMultiply(annualDividend, numberOfShares);
    const totalInvestment = safeMultiply(stockPrice, numberOfShares);
    
    return {
      dividendYield: roundToPrecision(dividendYield),
      annualDividendIncome: roundToPrecision(annualDividendIncome),
      quarterlyDividendIncome: roundToPrecision(safeDivide(annualDividendIncome, 4)),
      monthlyDividendIncome: roundToPrecision(safeDivide(annualDividendIncome, 12)),
      totalInvestment: roundToPrecision(totalInvestment)
    };
  }, {
    dividendYield: 0,
    annualDividendIncome: 0,
    quarterlyDividendIncome: 0,
    monthlyDividendIncome: 0,
    totalInvestment: 0
  });
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
  return safeCalculation(() => {
    const { investmentAmount, goldPricePerGram, years, expectedAnnualReturn } = inputs;
    
    const gramsOfGold = safeDivide(investmentAmount, goldPricePerGram);
    const futureGoldPrice = safeMultiply(goldPricePerGram, safePower(safeAdd(1, safeDivide(expectedAnnualReturn, 100)), years));
    const futureValue = safeMultiply(gramsOfGold, futureGoldPrice);
    const totalReturns = Math.max(0, futureValue - investmentAmount);
    const annualizedReturn = safeMultiply(Math.max(0, safePower(safeDivide(futureValue, investmentAmount), safeDivide(1, years)) - 1), 100);
    
    return {
      gramsOfGold: roundToPrecision(gramsOfGold),
      futureGoldPrice: roundToPrecision(futureGoldPrice),
      futureValue: roundToPrecision(futureValue),
      totalReturns: roundToPrecision(totalReturns),
      annualizedReturn: roundToPrecision(annualizedReturn)
    };
  }, {
    gramsOfGold: 0,
    futureGoldPrice: 0,
    futureValue: 0,
    totalReturns: 0,
    annualizedReturn: 0
  });
}
