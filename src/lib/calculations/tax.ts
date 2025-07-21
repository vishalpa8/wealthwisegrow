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
}

export interface TaxBracket {
  range: string;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export function calculateIncomeTax(inputs: IncomeTaxInputs): IncomeTaxResults {
  const { annualIncome, age, deductions, regime } = inputs;
  
  // Standard deduction
  const standardDeduction = regime === 'old' ? 50000 : 75000;
  const taxableIncome = Math.max(0, annualIncome - deductions - standardDeduction);
  
  // Tax slabs for FY 2024-25
  let taxSlabs: { min: number; max: number; rate: number }[];
  
  if (regime === 'new') {
    taxSlabs = [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 5 },
      { min: 700000, max: 1000000, rate: 10 },
      { min: 1000000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: Infinity, rate: 30 }
    ];
  } else {
    // Senior citizen exemption
    const basicExemption = age >= 60 ? (age >= 80 ? 500000 : 300000) : 250000;
    
    taxSlabs = [
      { min: 0, max: basicExemption, rate: 0 },
      { min: basicExemption, max: 500000, rate: 5 },
      { min: 500000, max: 1000000, rate: 20 },
      { min: 1000000, max: Infinity, rate: 30 }
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
  
  // Health and Education Cess (4%)
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
  const { amount, gstRate, type } = inputs;
  
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
  const { ctc, basicPercent, hraPercent, pfContribution, professionalTax, otherAllowances } = inputs;
  
  const basicSalary = (ctc * basicPercent) / 100;
  const hra = (basicSalary * hraPercent) / 100;
  const grossSalary = basicSalary + hra + otherAllowances;
  
  const pfDeduction = (basicSalary * pfContribution) / 100;
  
  // Simplified income tax calculation
  const taxableIncome = Math.max(0, grossSalary - 50000 - pfDeduction * 12); // Standard deduction
  const incomeTax = calculateSimplifiedTax(taxableIncome);
  
  const totalDeductions = pfDeduction + professionalTax / 12 + incomeTax / 12;
  const netSalary = grossSalary - totalDeductions;
  const monthlySalary = netSalary;
  
  return {
    ctc,
    basicSalary,
    hra,
    otherAllowances,
    grossSalary,
    pfDeduction,
    professionalTax: professionalTax / 12,
    incomeTax: incomeTax / 12,
    totalDeductions,
    netSalary,
    monthlySalary
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
  const { basicSalary, hraReceived, rentPaid, cityType } = inputs;
  
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
  holdingPeriod: number;
  gainType: 'short-term' | 'long-term';
  taxRate: number;
  taxAmount: number;
  netGains: number;
}

export function calculateCapitalGains(inputs: CapitalGainsInputs): CapitalGainsResults {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { purchasePrice, salePrice, purchaseDate, saleDate, assetType, indexationBenefit = false } = inputs;
  
  const capitalGains = salePrice - purchasePrice;
  const holdingPeriodMs = saleDate.getTime() - purchaseDate.getTime();
  const holdingPeriod = holdingPeriodMs / (1000 * 60 * 60 * 24 * 365.25); // in years
  
  let isLongTerm = false;
  let taxRate = 0;
  
  switch (assetType) {
    case 'equity':
      isLongTerm = holdingPeriod >= 1;
      taxRate = isLongTerm ? 10 : 15; // LTCG 10% above 1L, STCG 15%
      break;
    case 'debt':
      isLongTerm = holdingPeriod >= 3;
      taxRate = isLongTerm ? 20 : 30; // With indexation benefit for LTCG
      break;
    case 'property':
      isLongTerm = holdingPeriod >= 2;
      taxRate = isLongTerm ? 20 : 30;
      break;
    case 'gold':
      isLongTerm = holdingPeriod >= 3;
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
