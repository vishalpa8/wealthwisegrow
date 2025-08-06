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
    const monthlyInvestment = parseRobustNumber(inputs.monthlyInvestment) || 0;
    const annualReturn = parseRobustNumber(inputs.annualReturn) || 0;
    const years = parseRobustNumber(inputs.years) || 1;

    if (monthlyInvestment === 0) {
      return {
        totalInvestment: 0,
        maturityAmount: 0,
        totalGains: 0,
        monthlyBreakdown: [],
      };
    }

    const monthlyRate = safeDivide(annualReturn, 1200);
    const totalMonths = Math.floor(safeMultiply(years, 12));

    // Generate monthly breakdown
    const monthlyBreakdown: SIPMonthlyBreakdown[] = [];
    let balance = 0;
    let totalInvested = 0;

    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly investment
      totalInvested = safeAdd(totalInvested, monthlyInvestment);
      
      // Calculate interest on previous balance + current investment
      const interestForMonth = safeMultiply(safeAdd(balance, monthlyInvestment), monthlyRate);
      
      // Update balance with investment + interest
      balance = safeAdd(safeAdd(balance, monthlyInvestment), interestForMonth);
      
      const totalGains = Math.max(0, balance - totalInvested);
      
      monthlyBreakdown.push({
        month,
        investment: roundToPrecision(monthlyInvestment),
        balance: roundToPrecision(balance),
        totalInvested: roundToPrecision(totalInvested),
        totalGains: roundToPrecision(totalGains)
      });
    }

    // Use the calculated values from monthly breakdown for consistency
    const lastMonth = monthlyBreakdown[monthlyBreakdown.length - 1];
    const maturityAmount = lastMonth ? lastMonth.balance : 0;
    const totalInvestment = lastMonth ? lastMonth.totalInvested : 0;
    const totalGains = Math.max(0, maturityAmount - totalInvestment);

    return {
      totalInvestment: roundToPrecision(totalInvestment),
      maturityAmount: roundToPrecision(maturityAmount),
      totalGains: roundToPrecision(totalGains),
      monthlyBreakdown,
    };
  }, {
    totalInvestment: 0,
    maturityAmount: 0,
    totalGains: 0,
    monthlyBreakdown: [],
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
      // Calculate interest on previous balance first (before adding current deposit)
      const interest = safeMultiply(balance, monthlyRate);
      
      // Add the monthly deposit and interest
      totalDeposited = safeAdd(totalDeposited, monthlyDeposit);
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
      totalInterest: roundToPrecision(balance - totalDeposited),
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
    // Use robust parsing to handle currency strings and edge cases
    const basicSalary = Math.abs(parseRobustNumber(inputs.basicSalary) || 0);
    // Only apply defaults if input is null/undefined, not if it's explicitly 0
    const employeeContribution = inputs.employeeContribution !== null && inputs.employeeContribution !== undefined 
      ? Math.abs(parseRobustNumber(inputs.employeeContribution)) 
      : 12; // Default 12%
    const employerContribution = inputs.employerContribution !== null && inputs.employerContribution !== undefined 
      ? Math.abs(parseRobustNumber(inputs.employerContribution)) 
      : 12; // Default 12%
    const years = Math.max(1, parseRobustNumber(inputs.years) || 1);
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
  currentGoldPrice?: number; // Support both parameter names
  goldPricePerGram?: number;
  years: number;
  expectedAnnualReturn?: number; // Support both parameter names
  expectedAppreciation?: number;
}

export interface GoldYearlyBreakdown {
  year: number;
  goldPrice: number;
  value: number;
  gains: number;
}

export interface GoldResults {
  investmentAmount: number;
  goldQuantity: number;
  gramsOfGold: number; // Keep for backward compatibility
  futureGoldPrice: number;
  futureValue: number;
  maturityAmount: number; // Add this for test compatibility
  totalReturns: number;
  totalGains: number; // Add this for test compatibility
  annualizedReturn: number;
  yearlyBreakdown: GoldYearlyBreakdown[];
}

export function calculateGoldInvestment(inputs: GoldInputs): GoldResults {
  return safeCalculation(() => {
    // Handle both parameter naming conventions
    const investmentAmount = parseRobustNumber(inputs.investmentAmount) || 0;
    const goldPrice = parseRobustNumber(inputs.currentGoldPrice || inputs.goldPricePerGram) || 1;
    const appreciationRate = parseRobustNumber(inputs.expectedAppreciation || inputs.expectedAnnualReturn) || 0;
    const years = Math.max(0, parseRobustNumber(inputs.years) || 0); // Allow 0 years
    
    // Handle edge cases
    if (investmentAmount <= 0) {
      return {
        investmentAmount: 0,
        goldQuantity: 0,
        gramsOfGold: 0,
        futureGoldPrice: 0,
        futureValue: 0,
        maturityAmount: 0,
        totalReturns: 0,
        totalGains: 0,
        annualizedReturn: 0,
        yearlyBreakdown: Array.from({length: years}, (_, i) => ({
          year: i + 1,
          goldPrice: goldPrice * Math.pow(1 + appreciationRate/100, i + 1),
          value: 0,
          gains: 0
        }))
      };
    }
    
    if (goldPrice <= 0) {
      return {
        investmentAmount: roundToPrecision(investmentAmount),
        goldQuantity: 0,
        gramsOfGold: 0,
        futureGoldPrice: 0,
        futureValue: 0,
        maturityAmount: 0,
        totalReturns: -investmentAmount,
        totalGains: -investmentAmount,
        annualizedReturn: 0,
        yearlyBreakdown: []
      };
    }
    
    const goldQuantity = safeDivide(investmentAmount, goldPrice);
    
    // Handle zero years case
    if (years === 0) {
      return {
        investmentAmount: roundToPrecision(investmentAmount),
        goldQuantity: roundToPrecision(goldQuantity),
        gramsOfGold: roundToPrecision(goldQuantity),
        futureGoldPrice: roundToPrecision(goldPrice),
        futureValue: roundToPrecision(investmentAmount),
        maturityAmount: roundToPrecision(investmentAmount),
        totalReturns: 0,
        totalGains: 0,
        annualizedReturn: 0,
        yearlyBreakdown: []
      };
    }
    
    const futureGoldPrice = safeMultiply(goldPrice, safePower(safeAdd(1, safeDivide(appreciationRate, 100)), years));
    const maturityAmount = safeMultiply(goldQuantity, futureGoldPrice);
    
    // Handle negative appreciation correctly
    let totalGains;
    if (appreciationRate < 0) {
      totalGains = maturityAmount - investmentAmount; // Can be negative
    } else {
      totalGains = Math.max(0, maturityAmount - investmentAmount);
    }
    
    const annualizedReturn = years > 0 ? safeMultiply(Math.max(0, safePower(safeDivide(maturityAmount, investmentAmount), safeDivide(1, years)) - 1), 100) : 0;
    
    // Generate yearly breakdown
    const yearlyBreakdown: GoldYearlyBreakdown[] = [];
    for (let year = 1; year <= years; year++) {
      const yearlyGoldPrice = safeMultiply(goldPrice, safePower(safeAdd(1, safeDivide(appreciationRate, 100)), year));
      const yearlyValue = safeMultiply(goldQuantity, yearlyGoldPrice);
      const yearlyGains = yearlyValue - investmentAmount; // Can be negative
      
      yearlyBreakdown.push({
        year,
        goldPrice: roundToPrecision(yearlyGoldPrice, 4),
        value: roundToPrecision(yearlyValue, 2),
        gains: roundToPrecision(yearlyGains, 2)
      });
    }
    
    return {
      investmentAmount: roundToPrecision(investmentAmount, 2),
      goldQuantity: roundToPrecision(goldQuantity, 4),
      gramsOfGold: roundToPrecision(goldQuantity, 4), // For backward compatibility
      futureGoldPrice: roundToPrecision(futureGoldPrice, 2),
      futureValue: roundToPrecision(maturityAmount, 2),
      maturityAmount: roundToPrecision(maturityAmount, 2),
      totalReturns: roundToPrecision(totalGains, 2),
      totalGains: roundToPrecision(totalGains, 2),
      annualizedReturn: roundToPrecision(annualizedReturn, 2),
      yearlyBreakdown
    };
  }, {
    investmentAmount: 0,
    goldQuantity: 0,
    gramsOfGold: 0,
    futureGoldPrice: 0,
    futureValue: 0,
    maturityAmount: 0,
    totalReturns: 0,
    totalGains: 0,
    annualizedReturn: 0,
    yearlyBreakdown: []
  });
}
