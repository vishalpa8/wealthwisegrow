import { parseRobustNumber } from '../utils/number';
import { calculateIndiaIncomeTax } from './india-tax';

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
  
  const calculation = calculateIndiaIncomeTax({
    grossIncome: annualIncome,
    age,
    deductions,
    regime,
    salaried: true,
    resident: true,
  });
  
  return {
    grossIncome: annualIncome,
    taxableIncome: calculation.taxableIncome,
    incomeTax: calculation.incomeTax,
    cess: calculation.cess,
    totalTax: calculation.totalTax,
    netIncome: calculation.netIncome,
    taxBrackets: calculation.taxBrackets
  };
}

// GST Calculator
export interface GSTInputs {
  amount: number;
  gstRate: number;
  type: 'exclusive' | 'inclusive';
  supplyType?: 'intra-state' | 'inter-state';
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
  inputs = inputs || ({} as any);
  const amount = parseRobustNumber(inputs.amount);
  const gstRate = parseRobustNumber(inputs.gstRate);
  const { type, supplyType = 'intra-state' } = inputs;
  
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
  const isInterState = supplyType === 'inter-state';
  const cgst = isInterState ? 0 : gstAmount / 2;
  const sgst = isInterState ? 0 : gstAmount / 2;
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
  inputs = inputs || ({} as any);
  const ctc = parseRobustNumber(inputs.ctc);
  const basicPercent = parseRobustNumber(inputs.basicPercent);
  const hraPercent = parseRobustNumber(inputs.hraPercent);
  const pfContribution = parseRobustNumber(inputs.pfContribution);
  const annualProfessionalTax = parseRobustNumber(inputs.professionalTax);
  void inputs.otherAllowances;

  const basicSalary = (ctc * basicPercent) / 100;
  const hra = (basicSalary * hraPercent) / 100;
  const otherAllowances = Math.max(0, ctc - basicSalary - hra);
  const grossSalary = ctc;
  const annualPfDeduction = (basicSalary * pfContribution) / 100;
  const tax = calculateIndiaIncomeTax({
    grossIncome: grossSalary,
    age: 30,
    regime: 'new',
    salaried: true,
    resident: true,
  });
  const annualIncomeTax = tax.totalTax;
  const totalDeductions =
    annualPfDeduction + annualProfessionalTax + annualIncomeTax;
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
  inputs = inputs || ({} as any);
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
  // Check if inputs is truthy
  if (!inputs) return {
    capitalGains: 0,
    holdingPeriod: 0,
    gainType: 'short-term',
    taxRate: 0,
    taxAmount: 0,
    netGains: 0
  };
  
  const purchasePrice = parseRobustNumber(inputs.purchasePrice);
  const salePrice = parseRobustNumber(inputs.salePrice);
  const { purchaseDate, saleDate, assetType } = inputs;
  const pDate = purchaseDate || new Date();
  const sDate = saleDate || new Date();
  
  const capitalGains = salePrice - purchasePrice;
  const holdingPeriodMonths = (sDate.getFullYear() - pDate.getFullYear()) * 12 + (sDate.getMonth() - pDate.getMonth());
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
