import { parseRobustNumber } from '../utils/number';

// Income Tax Calculator (India)
export interface IncomeTaxInputs {
  annualIncome: number;
  age: number;
  deductions: number;
  regime: 'old' | 'new';
}

export interface IncomeTaxResults {
  grossIncome: number;
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  totalTax: number;
  netIncome: number;
  taxBrackets: TaxBracket[];
  error?: string;
}

export interface TaxBracket {
  range: string;
  rate: number;
  taxableAmount: number;
  tax: number;
}


function createErrorResult(error: string): IncomeTaxResults {
  return {
    grossIncome: 0,
    taxableIncome: 0,
    incomeTax: 0,
    cess: 0,
    totalTax: 0,
    netIncome: 0,
    taxBrackets: [],
    error,
  };
}

export function calculateIncomeTax(inputs: IncomeTaxInputs): IncomeTaxResults {
  if (!inputs) {
    return createErrorResult("Inputs are required.");
  }
  
  const annualIncome = parseRobustNumber(inputs.annualIncome);
  const age = parseRobustNumber(inputs.age);
  const deductions = parseRobustNumber(inputs.deductions);

  if (annualIncome < 0) {
    return createErrorResult("Annual income cannot be negative.");
  }
  if (age < 18 || age > 120) {
    return createErrorResult("Please enter a valid age.");
  }
  if (deductions < 0) {
    return createErrorResult("Deductions cannot be negative.");
  }

  const regime = inputs.regime || 'new';
  
  const standardDeduction = regime === 'old' ? 50000 : 75000;
  
  let taxSlabs: { min: number; max: number; rate: number }[];
  let taxableIncome: number;
  
  if (regime === 'new') {
    taxableIncome = Math.max(0, annualIncome - deductions - standardDeduction);
    taxSlabs = [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 5 },
      { min: 700000, max: 1000000, rate: 10 },
      { min: 1000000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: Infinity, rate: 30 }
    ];
  } else {
    taxableIncome = Math.max(0, annualIncome - deductions - standardDeduction);
    
    const basicExemption = age >= 60 ? (age >= 80 ? 500000 : 300000) : 250000;
    taxSlabs = [
      { min: 0, max: basicExemption, rate: 0 },
      { min: basicExemption, max: basicExemption + 250000, rate: 5 },
      { min: basicExemption + 250000, max: basicExemption + 500000, rate: 20 },
      { min: basicExemption + 500000, max: Infinity, rate: 30 }
    ];
  }
  
  let incomeTax = 0;
  const taxBrackets: TaxBracket[] = [];
  
  for (const slab of taxSlabs) {
    if (taxableIncome > slab.min) {
      const taxableAmountInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
      const taxInSlab = taxableAmountInSlab * slab.rate / 100;
      incomeTax += taxInSlab;
      
      taxBrackets.push({
        range: slab.max === Infinity ? `₹${slab.min.toLocaleString()}+` : `₹${slab.min.toLocaleString()} - ₹${slab.max.toLocaleString()}`,
        rate: slab.rate,
        taxableAmount: taxableAmountInSlab,
        tax: taxInSlab
      });
    }
  }
  
  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;
  const netIncome = annualIncome - totalTax;
  
  return {
    grossIncome: annualIncome,
    taxableIncome,
    incomeTax,
    cess,
    totalTax,
    netIncome,
    taxBrackets
  };
}

// GST Calculator
export interface GSTInputs {
  amount: number;
  gstRate: number;
  type: 'exclusive' | 'inclusive';
}

export interface GSTResults {
  originalAmount: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export function calculateGST(inputs: GSTInputs): GSTResults {
  const amount = parseRobustNumber(inputs.amount);
  const gstRate = parseRobustNumber(inputs.gstRate);
  const { type } = inputs;
  
  let originalAmount: number;
  let gstAmount: number;
  let totalAmount: number;
  
  if (type === 'exclusive') {
    originalAmount = amount;
    gstAmount = (amount * gstRate) / 100;
    totalAmount = amount + gstAmount;
  } else {
    totalAmount = amount;
    originalAmount = amount / (1 + gstRate / 100);
    gstAmount = totalAmount - originalAmount;
  }
  
  // For intra-state: CGST + SGST, for inter-state: IGST
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const igst = gstAmount;
  
  return {
    originalAmount,
    gstAmount,
    totalAmount,
    cgst,
    sgst,
    igst
  };
}

// Salary Calculator (CTC to In-hand)
export interface SalaryInputs {
  ctc: number;
  basicPercent: number;
  hraPercent: number;
  pfContribution: number;
  professionalTax: number;
  otherAllowances: number;
}

export interface SalaryResults {
  ctc: number;
  basicSalary: number;
  hra: number;
  otherAllowances: number;
  grossSalary: number;
  pfDeduction: number;
  professionalTax: number;
  incomeTax: number;
  totalDeductions: number;
  netSalary: number;
  monthlySalary: number;
}

export function calculateSalary(inputs: SalaryInputs): SalaryResults {
  const ctc = parseRobustNumber(inputs.ctc);
  const basicPercent = parseRobustNumber(inputs.basicPercent);
  const hraPercent = parseRobustNumber(inputs.hraPercent);
  const pfContribution = parseRobustNumber(inputs.pfContribution);
  const annualProfessionalTax = parseRobustNumber(inputs.professionalTax);
  const otherAllowances = parseRobustNumber(inputs.otherAllowances);
  
  const basicSalary = (ctc * basicPercent) / 100;
  const hra = (basicSalary * hraPercent) / 100;
  const grossSalary = basicSalary + hra + otherAllowances;
  
  const annualPfDeduction = (basicSalary * pfContribution) / 100;
  
  const taxableIncome = Math.max(0, grossSalary - 50000 - annualPfDeduction);
  const annualIncomeTax = calculateSimplifiedTax(taxableIncome);
  
  const totalDeductions = annualPfDeduction + annualProfessionalTax + annualIncomeTax;
  const netSalary = grossSalary - totalDeductions;
  
  return {
    ctc,
    basicSalary,
    hra,
    otherAllowances,
    grossSalary,
    pfDeduction: annualPfDeduction,
    professionalTax: annualProfessionalTax,
    incomeTax: annualIncomeTax,
    totalDeductions,
    netSalary,
    monthlySalary: netSalary / 12
  };
}

function calculateSimplifiedTax(taxableIncome: number): number {
  if (taxableIncome <= 300000) return 0;
  if (taxableIncome <= 700000) return (taxableIncome - 300000) * 0.05;
  if (taxableIncome <= 1000000) return 20000 + (taxableIncome - 700000) * 0.10;
  if (taxableIncome <= 1200000) return 50000 + (taxableIncome - 1000000) * 0.15;
  if (taxableIncome <= 1500000) return 80000 + (taxableIncome - 1200000) * 0.20;
  return 140000 + (taxableIncome - 1500000) * 0.30;
}

// HRA Calculator
export interface HRAInputs {
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  cityType: 'metro' | 'non-metro';
}

export interface HRAResults {
  hraReceived: number;
  hraExemption: number;
  taxableHRA: number;
  exemptionCalculations: {
    actualHRA: number;
    hraPercent: number;
    rentMinus10Percent: number;
  };
}

export function calculateHRA(inputs: HRAInputs): HRAResults {
  const basicSalary = parseRobustNumber(inputs.basicSalary);
  const hraReceived = parseRobustNumber(inputs.hraReceived);
  const rentPaid = parseRobustNumber(inputs.rentPaid);
  const { cityType } = inputs;
  
  const hraPercent = cityType === 'metro' ? 0.50 : 0.40;
  const hraAsPerRule = basicSalary * hraPercent;
  const rentMinus10Percent = Math.max(0, rentPaid - basicSalary * 0.10);
  
  const exemptionCalculations = {
    actualHRA: hraReceived,
    hraPercent: hraAsPerRule,
    rentMinus10Percent
  };
  
  const hraExemption = Math.min(
    hraReceived,
    hraAsPerRule,
    rentMinus10Percent
  );
  
  const taxableHRA = hraReceived - hraExemption;
  
  return {
    hraReceived,
    hraExemption,
    taxableHRA,
    exemptionCalculations
  };
}

// Capital Gains Tax Calculator
export interface CapitalGainsInputs {
  purchasePrice: number;
  salePrice: number;
  purchaseDate: Date;
  saleDate: Date;
  assetType: 'equity' | 'debt' | 'property' | 'gold';
  indexationBenefit?: boolean;
}

export interface CapitalGainsResults {
  capitalGains: number;
  holdingPeriod: number; // in months
  gainType: 'short-term' | 'long-term';
  taxRate: number;
  taxAmount: number;
  netGains: number;
}

export function calculateCapitalGains(inputs: CapitalGainsInputs): CapitalGainsResults {
  const purchasePrice = parseRobustNumber(inputs.purchasePrice);
  const salePrice = parseRobustNumber(inputs.salePrice);
  const { purchaseDate, saleDate, assetType } = inputs;
  
  const capitalGains = salePrice - purchasePrice;
  const holdingPeriodMonths = (saleDate.getFullYear() - purchaseDate.getFullYear()) * 12 + (saleDate.getMonth() - purchaseDate.getMonth());
  const holdingPeriod = holdingPeriodMonths / 12;
  
  let isLongTerm = false;
  let taxRate = 0;
  
  switch (assetType) {
    case 'equity':
      isLongTerm = holdingPeriodMonths >= 12;
      taxRate = isLongTerm ? 10 : 15; // LTCG 10% above 1L, STCG 15%
      break;
    case 'debt':
      isLongTerm = holdingPeriodMonths >= 36;
      taxRate = isLongTerm ? 20 : 30; // With indexation benefit for LTCG
      break;
    case 'property':
      isLongTerm = holdingPeriodMonths >= 24;
      taxRate = isLongTerm ? 20 : 30;
      break;
    case 'gold':
      isLongTerm = holdingPeriodMonths >= 36;
      taxRate = isLongTerm ? 20 : 30;
      break;
  }
  
  const gainType = isLongTerm ? 'long-term' : 'short-term';
  let taxableGains = capitalGains;
  
  // Special exemption for equity LTCG
  if (assetType === 'equity' && isLongTerm) {
    taxableGains = Math.max(0, capitalGains - 100000); // 1L exemption
  }
  
  const taxAmount = (taxableGains * taxRate) / 100;
  const netGains = capitalGains - taxAmount;
  
  return {
    capitalGains,
    holdingPeriod,
    gainType,
    taxRate,
    taxAmount,
    netGains
  };
}
