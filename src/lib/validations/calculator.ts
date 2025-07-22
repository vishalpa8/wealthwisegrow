import { z } from "zod";
import { 
  parseRobustNumber, 
  validateSafeNumber, 
  MAX_SAFE_CALCULATION_VALUE,
  parseAndValidate,
  formatLargeNumber
} from "../utils/number";

// Global currency and number validation with robust error handling
export const safeNumber = z
  .any()
  .transform((val) => {
    const validation = validateSafeNumber(val);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid number");
    }
    return validation.number;
  })
  .refine((val) => isFinite(val), "Must be a finite number");

// Base validators with robust parsing
export const positiveNumber = z
  .any()
  .transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      allowZero: true, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Must be a positive number");
    }
    return validation.value;
  });

export const nonNegativeNumber = z
  .any()
  .transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      allowZero: true, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Must be zero or positive");
    }
    return validation.value;
  });

export const percentage = z
  .any()
  .transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      max: 100, 
      allowZero: true, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Percentage must be between 0 and 100");
    }
    return validation.value;
  });

export const interestRate = z
  .any()
  .transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      max: 50, 
      allowZero: true, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Interest rate must be between 0 and 50%");
    }
    return validation.value;
  });

// Mortgage Calculator Schema
export const mortgageSchema = z.object({
  principal: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Loan amount must be at least 1");
    }
    return validation.value;
  }),
  rate: interestRate,
  years: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 1 || rounded > 50) {
      throw new Error("Loan term must be between 1 and 50 years");
    }
    return rounded;
  }),
  downPayment: nonNegativeNumber.optional().default(0),
  propertyTax: nonNegativeNumber.optional().default(0),
  insurance: nonNegativeNumber.optional().default(0),
  pmi: nonNegativeNumber.optional().default(0),
});

// Loan Calculator Schema
export const loanSchema = z.object({
  principal: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Loan amount must be at least 1");
    }
    return validation.value;
  }),
  rate: interestRate,
  years: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 1 || rounded > 50) {
      throw new Error("Loan term must be between 1 and 50 years");
    }
    return rounded;
  }),
  extraPayment: nonNegativeNumber.optional().default(0),
});

// Investment Calculator Schema
export const investmentSchema = z.object({
  initialAmount: nonNegativeNumber,
  monthlyContribution: nonNegativeNumber,
  annualReturn: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: -50, 
      max: 50, 
      allowZero: true, 
      allowNegative: true
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Return must be between -50% and 50%");
    }
    return validation.value;
  }),
  years: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 1 || rounded > 100) {
      throw new Error("Investment period must be between 1 and 100 years");
    }
    return rounded;
  }),
  compoundingFrequency: z.enum(["annually", "semiannually", "quarterly", "monthly", "daily"]).default("monthly"),
});

// Retirement Calculator Schema
export const retirementSchema = z.object({
  currentAge: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 18 || rounded > 100) {
      throw new Error("Age must be between 18 and 100 years");
    }
    return rounded;
  }),
  retirementAge: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 50 || rounded > 100) {
      throw new Error("Retirement age must be between 50 and 100 years");
    }
    return rounded;
  }),
  currentSavings: nonNegativeNumber.default(0),
  monthlyContribution: nonNegativeNumber.default(0),
  expectedReturn: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      max: 20, 
      allowZero: true, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Expected return must be between 0% and 20%");
    }
    return validation.value;
  }),
  inflationRate: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      max: 10, 
      allowZero: true, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Inflation rate must be between 0% and 10%");
    }
    return validation.value;
  }),
  retirementIncome: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1000, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Retirement income must be at least ₹1,000");
    }
    return validation.value;
  }),
}).refine((data) => data.retirementAge > data.currentAge, {
  message: "Retirement age must be greater than current age",
  path: ["retirementAge"],
});

// Budget Calculator Schema
export const budgetSchema = z.object({
  monthlyIncome: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Monthly income must be at least 1");
    }
    return validation.value;
  }),
  housing: nonNegativeNumber.default(0),
  transportation: nonNegativeNumber.default(0),
  food: nonNegativeNumber.default(0),
  utilities: nonNegativeNumber.default(0),
  insurance: nonNegativeNumber.default(0),
  healthcare: nonNegativeNumber.default(0),
  savings: nonNegativeNumber.default(0),
  entertainment: nonNegativeNumber.default(0),
  other: nonNegativeNumber.default(0),
});

// SIP Calculator Schema
export const sipSchema = z.object({
  monthlyInvestment: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Monthly investment must be at least 1");
    }
    return validation.value;
  }),
  annualReturn: interestRate,
  years: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 1 || rounded > 50) {
      throw new Error("Investment period must be between 1 and 50 years");
    }
    return rounded;
  }),
});

// Lumpsum Investment Schema
export const lumpsumSchema = z.object({
  principal: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Investment amount must be at least 1");
    }
    return validation.value;
  }),
  annualReturn: interestRate,
  years: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 1 || rounded > 50) {
      throw new Error("Investment period must be between 1 and 50 years");
    }
    return rounded;
  }),
});

// PPF Calculator Schema
export const ppfSchema = z.object({
  yearlyInvestment: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      max: 150000, 
      allowZero: false, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "PPF investment must be between 1 and ₹1,50,000 per year");
    }
    return validation.value;
  }),
  years: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 15 || rounded > 50) {
      throw new Error("PPF period must be between 15 and 50 years");
    }
    return rounded;
  }),
});

// FD Calculator Schema
export const fdSchema = z.object({
  principal: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Minimum FD amount is 1");
    }
    return validation.value;
  }),
  annualRate: interestRate,
  years: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0.25, 
      max: 20, 
      allowZero: false, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "FD tenure must be between 3 months (0.25 years) and 20 years");
    }
    return validation.value;
  }),
  compoundingFrequency: z.enum(['monthly', 'quarterly', 'yearly']).default('quarterly'),
});

// RD Calculator Schema
export const rdSchema = z.object({
  monthlyDeposit: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Minimum monthly deposit is 1");
    }
    return validation.value;
  }),
  annualRate: interestRate,
  years: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      max: 10, 
      allowZero: false, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "RD tenure must be between 1 and 10 years");
    }
    return validation.value;
  }),
});

// EPF Calculator Schema
export const epfSchema = z.object({
  basicSalary: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Basic salary must be at least 1");
    }
    return validation.value;
  }),
  employeeContribution: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 8, 
      max: 12, 
      allowZero: false, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Employee contribution must be between 8% and 12%");
    }
    return validation.value;
  }),
  employerContribution: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 8, 
      max: 12, 
      allowZero: false, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Employer contribution must be between 8% and 12%");
    }
    return validation.value;
  }),
  years: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 1 || rounded > 40) {
      throw new Error("Service period must be between 1 and 40 years");
    }
    return rounded;
  }),
});

// Dividend Yield Calculator Schema
export const dividendYieldSchema = z.object({
  stockPrice: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Stock price must be at least ₹1");
    }
    return validation.value;
  }),
  annualDividend: nonNegativeNumber,
  numberOfShares: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 1) {
      throw new Error("Number of shares must be at least 1");
    }
    return rounded;
  }),
});

// Gold Investment Calculator Schema
export const goldSchema = z.object({
  investmentAmount: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Investment amount must be at least 1");
    }
    return validation.value;
  }),
  goldPricePerGram: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Gold price must be at least 1 per gram");
    }
    return validation.value;
  }),
  years: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      max: 30, 
      allowZero: false, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Investment period must be between 1 and 30 years");
    }
    return validation.value;
  }),
  expectedAnnualReturn: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: -20, 
      max: 30, 
      allowZero: true, 
      allowNegative: true
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Expected return must be between -20% and 30%");
    }
    return validation.value;
  }),
});

// Income Tax Calculator Schema
export const incomeTaxSchema = z.object({
  annualIncome: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Annual income must be at least 1");
    }
    return validation.value;
  }),
  age: z.any().transform((val) => {
    const parsed = parseRobustNumber(val);
    const rounded = Math.round(parsed);
    if (rounded < 18 || rounded > 100) {
      throw new Error("Age must be between 18 and 100 years");
    }
    return rounded;
  }),
  deductions: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      max: 1500000, 
      allowZero: true, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Deductions cannot exceed ₹15,00,000");
    }
    return validation.value;
  }),
  regime: z.enum(['old', 'new']).default('new'),
});

// GST Calculator Schema
export const gstSchema = z.object({
  amount: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Amount must be at least ₹1");
    }
    return validation.value;
  }),
  gstRate: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      max: 28, 
      allowZero: true, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "GST rate must be between 0% and 28%");
    }
    return validation.value;
  }),
  type: z.enum(['exclusive', 'inclusive']).default('exclusive'),
});

// Salary Calculator Schema
export const salarySchema = z.object({
  ctc: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "CTC must be at least 1");
    }
    return validation.value;
  }),
  basicPercent: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 40, 
      max: 70, 
      allowZero: false, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Basic salary should be between 40% and 70% of CTC");
    }
    return validation.value;
  }),
  hraPercent: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      max: 50, 
      allowZero: true, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "HRA cannot exceed 50% of basic salary");
    }
    return validation.value;
  }),
  pfContribution: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      max: 12, 
      allowZero: true, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "PF contribution cannot exceed 12%");
    }
    return validation.value;
  }),
  professionalTax: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 0, 
      max: 2500, 
      allowZero: true, 
      allowNegative: false
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Professional tax cannot exceed ₹2,500 per month");
    }
    return validation.value;
  }),
  otherAllowances: nonNegativeNumber.default(0),
});

// HRA Calculator Schema
export const hraSchema = z.object({
  basicSalary: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Basic salary must be at least 1");
    }
    return validation.value;
  }),
  hraReceived: nonNegativeNumber.default(0),
  rentPaid: nonNegativeNumber.default(0),
  cityType: z.enum(['metro', 'non-metro']).default('non-metro'),
});

// Capital Gains Calculator Schema
export const capitalGainsSchema = z.object({
  purchasePrice: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Purchase price must be at least 1");
    }
    return validation.value;
  }),
  salePrice: z.any().transform((val) => {
    const validation = parseAndValidate(val, { 
      min: 1, 
      allowZero: false, 
      allowNegative: false,
      max: MAX_SAFE_CALCULATION_VALUE
    });
    if (!validation.isValid) {
      throw new Error(validation.error || "Sale price must be at least 1");
    }
    return validation.value;
  }),
  purchaseDate: z.date().max(new Date(), "Purchase date cannot be in the future"),
  saleDate: z.date().max(new Date(), "Sale date cannot be in the future"),
  assetType: z.enum(['equity', 'debt', 'property', 'gold']).default('equity'),
  indexationBenefit: z.boolean().optional().default(false),
}).refine((data) => data.saleDate >= data.purchaseDate, {
  message: "Sale date must be after purchase date",
  path: ["saleDate"],
});

// Export all types
export type MortgageInputs = z.infer<typeof mortgageSchema>;
export type LoanInputs = z.infer<typeof loanSchema>;
export type InvestmentInputs = z.infer<typeof investmentSchema>;
export type RetirementInputs = z.infer<typeof retirementSchema>;
export type BudgetInputs = z.infer<typeof budgetSchema>;
export type SIPInputs = z.infer<typeof sipSchema>;
export type LumpsumInputs = z.infer<typeof lumpsumSchema>;
export type PPFInputs = z.infer<typeof ppfSchema>;
export type FDInputs = z.infer<typeof fdSchema>;
export type RDInputs = z.infer<typeof rdSchema>;
export type EPFInputs = z.infer<typeof epfSchema>;
export type DividendYieldInputs = z.infer<typeof dividendYieldSchema>;
export type GoldInputs = z.infer<typeof goldSchema>;
export type IncomeTaxInputs = z.infer<typeof incomeTaxSchema>;
export type GSTInputs = z.infer<typeof gstSchema>;
export type SalaryInputs = z.infer<typeof salarySchema>;
export type HRAInputs = z.infer<typeof hraSchema>;
export type CapitalGainsInputs = z.infer<typeof capitalGainsSchema>;
