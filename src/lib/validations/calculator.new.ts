import { z } from "zod";

// Global currency and number validation with robust error handling
export const safeNumber = z
  .union([
    z.number(),
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val.replace(/[^0-9.-]/g, ''));
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid number format",
        });
        return z.NEVER;
      }
      return parsed;
    })
  ])
  .refine((val) => isFinite(val), "Must be a finite number")
  .refine((val) => !isNaN(val), "Must be a valid number");

// Base validators
export const positiveNumber = safeNumber
  .refine((val) => val > 0, "Must be a positive number")
  .refine((val) => val <= Number.MAX_SAFE_INTEGER, "Number is too large");

export const nonNegativeNumber = safeNumber
  .refine((val) => val >= 0, "Must be zero or positive")
  .refine((val) => val <= Number.MAX_SAFE_INTEGER, "Number is too large");

export const percentage = safeNumber
  .refine((val) => val >= 0, "Percentage cannot be negative")
  .refine((val) => val <= 100, "Percentage cannot exceed 100%");

export const interestRate = safeNumber
  .refine((val) => val >= 0, "Interest rate cannot be negative")
  .refine((val) => val <= 50, "Interest rate seems unreasonably high");

// Mortgage Calculator Schema
export const mortgageSchema = z.object({
  principal: positiveNumber.refine(val => val >= 1000, "Loan amount must be at least 1,000"),
  rate: interestRate,
  years: z.number().int().min(1, "Loan term must be at least 1 year").max(50, "Loan term cannot exceed 50 years"),
  downPayment: nonNegativeNumber.optional(),
  propertyTax: nonNegativeNumber.optional(),
  insurance: nonNegativeNumber.optional(),
  pmi: nonNegativeNumber.optional(),
});

// Loan Calculator Schema
export const loanSchema = z.object({
  principal: positiveNumber.refine(val => val >= 100, "Loan amount must be at least 100"),
  rate: interestRate,
  years: z.number().int().min(1, "Loan term must be at least 1 year").max(50, "Loan term cannot exceed 50 years"),
  extraPayment: nonNegativeNumber.optional(),
});

// Investment Calculator Schema
export const investmentSchema = z.object({
  initialAmount: nonNegativeNumber,
  monthlyContribution: nonNegativeNumber,
  annualReturn: z.number().min(-50, "Return cannot be less than -50%").max(50, "Return seems unreasonably high"),
  years: z.number().int().min(1, "Investment period must be at least 1 year").max(100, "Investment period cannot exceed 100 years"),
  compoundingFrequency: z.enum(["annually", "semiannually", "quarterly", "monthly", "daily"]),
});

// Retirement Calculator Schema
export const retirementSchema = z.object({
  currentAge: z.number().int().min(18, "Age must be at least 18").max(100, "Age cannot exceed 100"),
  retirementAge: z.number().int().min(50, "Retirement age must be at least 50").max(100, "Retirement age cannot exceed 100"),
  currentSavings: nonNegativeNumber,
  monthlyContribution: nonNegativeNumber,
  expectedReturn: z.number().min(0, "Expected return cannot be negative").max(20, "Expected return seems unreasonably high"),
  inflationRate: z.number().min(0, "Inflation rate cannot be negative").max(10, "Inflation rate seems unreasonably high"),
  retirementIncome: positiveNumber.refine(val => val >= 1000, "Retirement income must be at least 1,000"),
}).refine((data) => data.retirementAge > data.currentAge, {
  message: "Retirement age must be greater than current age",
  path: ["retirementAge"],
});

// Budget Calculator Schema
export const budgetSchema = z.object({
  monthlyIncome: positiveNumber.refine(val => val >= 100, "Monthly income must be at least 100"),
  housing: nonNegativeNumber,
  transportation: nonNegativeNumber,
  food: nonNegativeNumber,
  utilities: nonNegativeNumber,
  insurance: nonNegativeNumber,
  healthcare: nonNegativeNumber,
  savings: nonNegativeNumber,
  entertainment: nonNegativeNumber,
  other: nonNegativeNumber,
});

// SIP Calculator Schema
export const sipSchema = z.object({
  monthlyInvestment: positiveNumber.refine(val => val >= 100, "Monthly investment must be at least 100"),
  annualReturn: interestRate,
  years: z.number().int().min(1, "Investment period must be at least 1 year").max(50, "Investment period cannot exceed 50 years"),
});

// Lumpsum Investment Schema
export const lumpsumSchema = z.object({
  principal: positiveNumber.refine(val => val >= 1000, "Investment amount must be at least 1,000"),
  annualReturn: interestRate,
  years: z.number().int().min(1, "Investment period must be at least 1 year").max(50, "Investment period cannot exceed 50 years"),
});

// PPF Calculator Schema
export const ppfSchema = z.object({
  yearlyInvestment: positiveNumber
    .refine(val => val >= 500, "Minimum PPF investment is 500 per year")
    .refine(val => val <= 150000, "Maximum PPF investment is 1,50,000 per year"),
  years: z.number().int().min(15, "PPF lock-in period is minimum 15 years").max(50, "Investment period cannot exceed 50 years"),
});

// FD Calculator Schema
export const fdSchema = z.object({
  principal: positiveNumber.refine(val => val >= 1000, "Minimum FD amount is 1,000"),
  annualRate: interestRate,
  years: z.number().min(0.25, "Minimum FD tenure is 3 months").max(20, "Maximum FD tenure is 20 years"),
  compoundingFrequency: z.enum(['monthly', 'quarterly', 'yearly']),
});

// RD Calculator Schema
export const rdSchema = z.object({
  monthlyDeposit: positiveNumber.refine(val => val >= 100, "Minimum monthly deposit is 100"),
  annualRate: interestRate,
  years: z.number().min(1, "Minimum RD tenure is 1 year").max(10, "Maximum RD tenure is 10 years"),
});

// EPF Calculator Schema
export const epfSchema = z.object({
  basicSalary: positiveNumber.refine(val => val >= 1000, "Basic salary must be at least 1,000"),
  employeeContribution: percentage
    .refine(val => val >= 8, "Minimum employee contribution is 8%")
    .refine(val => val <= 12, "Maximum employee contribution is 12%"),
  employerContribution: percentage
    .refine(val => val >= 8, "Minimum employer contribution is 8%")
    .refine(val => val <= 12, "Maximum employer contribution is 12%"),
  years: z.number().int().min(1, "Service period must be at least 1 year").max(40, "Service period cannot exceed 40 years"),
});

// Dividend Yield Calculator Schema
export const dividendYieldSchema = z.object({
  stockPrice: positiveNumber.refine(val => val >= 1, "Stock price must be at least 1"),
  annualDividend: nonNegativeNumber,
  numberOfShares: z.number().int().min(1, "Number of shares must be at least 1"),
});

// Gold Investment Calculator Schema
export const goldSchema = z.object({
  investmentAmount: positiveNumber.refine(val => val >= 1000, "Investment amount must be at least 1,000"),
  goldPricePerGram: positiveNumber.refine(val => val >= 1000, "Gold price must be at least 1,000 per gram"),
  years: z.number().min(1, "Investment period must be at least 1 year").max(30, "Investment period cannot exceed 30 years"),
  expectedAnnualReturn: z.number().min(-20, "Return cannot be less than -20%").max(30, "Return seems unreasonably high"),
});

// Income Tax Calculator Schema
export const incomeTaxSchema = z.object({
  annualIncome: positiveNumber.refine(val => val >= 100000, "Annual income must be at least 1,00,000"),
  age: z.number().int().min(18, "Age must be at least 18").max(100, "Age cannot exceed 100"),
  deductions: nonNegativeNumber.refine(val => val <= 1500000, "Deductions cannot exceed 15,00,000"),
  regime: z.enum(['old', 'new']),
});

// GST Calculator Schema
export const gstSchema = z.object({
  amount: positiveNumber.refine(val => val >= 1, "Amount must be at least 1"),
  gstRate: z.number().min(0, "GST rate cannot be negative").max(28, "GST rate cannot exceed 28%"),
  type: z.enum(['exclusive', 'inclusive']),
});

// Salary Calculator Schema
export const salarySchema = z.object({
  ctc: positiveNumber.refine(val => val >= 100000, "CTC must be at least 1,00,000"),
  basicPercent: percentage
    .refine(val => val >= 40, "Basic salary should be at least 40% of CTC")
    .refine(val => val <= 70, "Basic salary cannot exceed 70% of CTC"),
  hraPercent: percentage.refine(val => val <= 50, "HRA cannot exceed 50% of basic salary"),
  pfContribution: percentage.refine(val => val <= 12, "PF contribution cannot exceed 12%"),
  professionalTax: nonNegativeNumber.refine(val => val <= 2500, "Professional tax cannot exceed 2,500 per month"),
  otherAllowances: nonNegativeNumber,
});

// HRA Calculator Schema
export const hraSchema = z.object({
  basicSalary: positiveNumber.refine(val => val >= 10000, "Basic salary must be at least 10,000"),
  hraReceived: nonNegativeNumber,
  rentPaid: nonNegativeNumber,
  cityType: z.enum(['metro', 'non-metro']),
});

// Capital Gains Calculator Schema
export const capitalGainsSchema = z.object({
  purchasePrice: positiveNumber.refine(val => val >= 1000, "Purchase price must be at least 1,000"),
  salePrice: positiveNumber.refine(val => val >= 1000, "Sale price must be at least 1,000"),
  purchaseDate: z.date().max(new Date(), "Purchase date cannot be in the future"),
  saleDate: z.date().max(new Date(), "Sale date cannot be in the future"),
  assetType: z.enum(['equity', 'debt', 'property', 'gold']),
  indexationBenefit: z.boolean().optional(),
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
