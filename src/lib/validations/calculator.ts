import { z } from "zod";

// Common validation schemas
export const positiveNumber = z
  .number()
  .positive("Must be a positive number")
  .finite("Must be a finite number");

export const nonNegativeNumber = z
  .number()
  .min(0, "Must be zero or positive")
  .finite("Must be a finite number");

export const percentage = z
  .number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100%")
  .finite("Must be a finite number");

export const interestRate = z
  .number()
  .min(0, "Interest rate cannot be negative")
  .max(50, "Interest rate seems unreasonably high")
  .finite("Must be a finite number");

// Mortgage Calculator Schema
export const mortgageSchema = z.object({
  principal: positiveNumber.min(1000, "Loan amount must be at least $1,000"),
  rate: interestRate,
  years: z.number().int().min(1, "Loan term must be at least 1 year").max(50, "Loan term cannot exceed 50 years"),
  downPayment: nonNegativeNumber.optional(),
  propertyTax: nonNegativeNumber.optional(),
  insurance: nonNegativeNumber.optional(),
  pmi: nonNegativeNumber.optional(),
});

// Loan Calculator Schema
export const loanSchema = z.object({
  principal: positiveNumber.min(100, "Loan amount must be at least $100"),
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
  retirementIncome: positiveNumber.min(1000, "Retirement income must be at least $1,000"),
}).refine((data) => data.retirementAge > data.currentAge, {
  message: "Retirement age must be greater than current age",
  path: ["retirementAge"],
});

// Budget Calculator Schema
export const budgetSchema = z.object({
  monthlyIncome: positiveNumber.min(100, "Monthly income must be at least $100"),
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

export type MortgageInputs = z.infer<typeof mortgageSchema>;
export type LoanInputs = z.infer<typeof loanSchema>;
export type InvestmentInputs = z.infer<typeof investmentSchema>;
export type RetirementInputs = z.infer<typeof retirementSchema>;
export type BudgetInputs = z.infer<typeof budgetSchema>;