import { z } from "zod";
import { parseRobustNumber } from "../utils/number";

// Ultra-flexible number validation that accepts any input and transforms it gracefully
const flexibleNumber = z
  .any()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) {
      return 0;
    }
    const parsed = parseRobustNumber(val);
    if (isNaN(parsed)) {
      return 0;
    }
    // Allow negative numbers but convert them to positive for most calculations
    return Math.abs(parsed);
  });

// Ultra-flexible percentage that accepts any input
const flexiblePercentage = z
  .any()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) {
      return 0;
    }
    const parsed = parseRobustNumber(val);
    if (isNaN(parsed) || !isFinite(parsed)) {
      return 0;
    }
    // Allow any percentage value - no upper limit for maximum flexibility
    // Accept negative percentages for scenarios like deflation, losses, etc.
    return Math.abs(parsed);
  });

// Ultra-flexible year validation
const flexibleYear = z
  .any()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) {
      return 1;
    }
    const parsed = parseRobustNumber(val);
    if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
      return 1;
    }
    // Allow any positive value - no upper limit for maximum flexibility
    // Round to nearest integer for year calculations
    return Math.max(Math.round(Math.abs(parsed)), 1);
  });

// Ultra-flexible age validation
const flexibleAge = z
  .any()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) {
      return 25;
    }
    const parsed = parseRobustNumber(val);
    if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
      return 25;
    }
    // Allow any positive age value for maximum flexibility
    // Round to nearest integer for age calculations
    return Math.max(Math.round(Math.abs(parsed)), 1);
  });

// Ultra-flexible number that allows negative values (for things like extra payments, adjustments)
const flexibleSignedNumber = z
  .any()
  .transform((val) => {
    if (val === "" || val === null || val === undefined) {
      return 0;
    }
    const parsed = parseRobustNumber(val);
    if (isNaN(parsed) || !isFinite(parsed)) {
      return 0;
    }
    // Allow both positive and negative values for maximum flexibility
    return parsed;
  });

// Mortgage Calculator Schema
export const mortgageSchema = z.object({
  principal: flexibleNumber,
  rate: flexiblePercentage,
  years: flexibleYear,
  downPayment: flexibleSignedNumber.optional().default(0),
  propertyTax: flexibleSignedNumber.optional().default(0),
  insurance: flexibleSignedNumber.optional().default(0),
  pmi: flexibleSignedNumber.optional().default(0),
});

// Loan Calculator Schema
export const loanSchema = z.object({
  principal: flexibleNumber,
  rate: flexiblePercentage,
  years: flexibleYear,
  extraPayment: flexibleSignedNumber.optional().default(0),
});

// Investment Calculator Schema
export const investmentSchema = z.object({
  initialAmount: flexibleSignedNumber,
  monthlyContribution: flexibleSignedNumber,
  annualReturn: flexiblePercentage,
  years: flexibleYear,
  compoundingFrequency: z.enum(["annually", "semiannually", "quarterly", "monthly", "daily"]).default("monthly"),
});

// Retirement Calculator Schema
export const retirementSchema = z.object({
  currentAge: flexibleAge,
  retirementAge: flexibleAge,
  currentSavings: flexibleSignedNumber.default(0),
  monthlyContribution: flexibleSignedNumber.default(0),
  expectedReturn: flexiblePercentage,
  inflationRate: flexiblePercentage,
  retirementIncome: flexibleNumber,
});

// Budget Calculator Schema
export const budgetSchema = z.object({
  monthlyIncome: flexibleNumber,
  housing: flexibleSignedNumber.default(0),
  transportation: flexibleSignedNumber.default(0),
  food: flexibleSignedNumber.default(0),
  utilities: flexibleSignedNumber.default(0),
  insurance: flexibleSignedNumber.default(0),
  healthcare: flexibleSignedNumber.default(0),
  savings: flexibleSignedNumber.default(0),
  entertainment: flexibleSignedNumber.default(0),
  other: flexibleSignedNumber.default(0),
});

// SIP Calculator Schema
export const sipSchema = z.object({
  monthlyInvestment: flexibleSignedNumber,
  annualReturn: flexiblePercentage,
  years: flexibleYear,
});

// Lumpsum Investment Schema
export const lumpsumSchema = z.object({
  principal: flexibleSignedNumber,
  annualReturn: flexiblePercentage,
  years: flexibleYear,
});

// PPF Calculator Schema
export const ppfSchema = z.object({
  yearlyInvestment: flexibleSignedNumber,
  years: flexibleYear,
});

// FD Calculator Schema
export const fdSchema = z.object({
  principal: flexibleSignedNumber,
  annualRate: flexiblePercentage,
  years: flexibleYear,
  compoundingFrequency: z.enum(['monthly', 'quarterly', 'yearly']).default('quarterly'),
});

// RD Calculator Schema
export const rdSchema = z.object({
  monthlyDeposit: flexibleSignedNumber,
  annualRate: flexiblePercentage,
  years: flexibleYear,
});

// EPF Calculator Schema
export const epfSchema = z.object({
  basicSalary: flexibleNumber,
  employeeContribution: flexiblePercentage,
  employerContribution: flexiblePercentage,
  years: flexibleYear,
});

// Dividend Yield Calculator Schema
export const dividendYieldSchema = z.object({
  stockPrice: flexibleNumber,
  annualDividend: flexibleSignedNumber,
  numberOfShares: flexibleNumber,
});

// Gold Investment Calculator Schema
export const goldSchema = z.object({
  investmentAmount: flexibleSignedNumber,
  goldPricePerGram: flexibleNumber,
  years: flexibleYear,
  expectedAnnualReturn: flexiblePercentage,
});

// Income Tax Calculator Schema
export const incomeTaxSchema = z.object({
  annualIncome: flexibleNumber,
  age: flexibleAge,
  deductions: flexibleSignedNumber,
  regime: z.enum(['old', 'new']).default('new'),
});

// GST Calculator Schema
export const gstSchema = z.object({
  amount: flexibleSignedNumber,
  gstRate: flexiblePercentage,
  type: z.enum(['exclusive', 'inclusive']).default('exclusive'),
});

// Salary Calculator Schema
export const salarySchema = z.object({
  ctc: flexibleNumber,
  basicPercent: flexiblePercentage,
  hraPercent: flexiblePercentage,
  pfContribution: flexiblePercentage,
  professionalTax: flexibleSignedNumber,
  otherAllowances: flexibleSignedNumber.default(0),
});

// HRA Calculator Schema
export const hraSchema = z.object({
  basicSalary: flexibleNumber,
  hraReceived: flexibleSignedNumber.default(0),
  rentPaid: flexibleSignedNumber.default(0),
  cityType: z.enum(['metro', 'non-metro']).default('non-metro'),
});

// Capital Gains Calculator Schema
export const capitalGainsSchema = z.object({
  purchasePrice: flexibleNumber,
  salePrice: flexibleNumber,
  purchaseDate: z.date().optional().default(new Date()),
  saleDate: z.date().optional().default(new Date()),
  assetType: z.enum(['equity', 'debt', 'property', 'gold']).default('equity'),
  indexationBenefit: z.boolean().optional().default(false),
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

// Export flexible validation functions for reuse
export { flexibleNumber, flexiblePercentage, flexibleYear, flexibleAge, flexibleSignedNumber };