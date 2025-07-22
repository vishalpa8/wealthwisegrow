"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import {
  parseRobustNumber,
  safeDivide,
  safeMultiply,
  safePower,
  isEffectivelyZero
} from '@/lib/utils/number';

const initialValues = {
  loanType: 'term-loan',
  loanAmount: 2000000,
  interestRate: 12,
  loanTerm: 5,
  processingFee: 1,
  collateralValue: 2500000,
  businessRevenue: 5000000,
  existingDebt: 500000,
  creditScore: 750,
  businessAge: 3
};

interface BusinessLoanInputs {
  loanType: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  processingFee: number;
  collateralValue: number;
  businessRevenue: number;
  existingDebt: number;
  creditScore: number;
  businessAge: number;
}

function calculateBusinessLoan(inputs: BusinessLoanInputs) {
  // Use parseRobustNumber to handle all edge cases including null, undefined, empty strings, etc.
  const loanType = inputs.loanType || 'term-loan';
  const loanAmount = parseRobustNumber(inputs.loanAmount);
  const interestRate = parseRobustNumber(inputs.interestRate);
  const loanTerm = parseRobustNumber(inputs.loanTerm);
  const processingFee = parseRobustNumber(inputs.processingFee);
  const collateralValue = parseRobustNumber(inputs.collateralValue);
  const businessRevenue = parseRobustNumber(inputs.businessRevenue);
  const existingDebt = parseRobustNumber(inputs.existingDebt);
  const creditScore = parseRobustNumber(inputs.creditScore);
  const businessAge = parseRobustNumber(inputs.businessAge);

  // Safe division for monthly rate calculation
  const monthlyRate = safeDivide(safeDivide(interestRate, 12), 100);
  const totalMonths = Math.max(1, safeMultiply(loanTerm, 12)); // Ensure minimum 1 month
  
  // Calculate EMI based on loan type
  let monthlyPayment = 0;
  let totalPayment = 0;
  let totalInterest = 0;
  
  if (loanType === 'term-loan' || loanType === 'equipment-loan') {
    // Standard EMI calculation
    if (!isEffectivelyZero(monthlyRate)) {
      const onePlusRate = 1 + monthlyRate;
      const powerTerm = safePower(onePlusRate, totalMonths);
      const numerator = safeMultiply(safeMultiply(loanAmount, monthlyRate), powerTerm);
      const denominator = powerTerm - 1;
      monthlyPayment = safeDivide(numerator, denominator);
    } else {
      monthlyPayment = safeDivide(loanAmount, totalMonths);
    }
    totalPayment = safeMultiply(monthlyPayment, totalMonths);
    totalInterest = Math.max(0, totalPayment - loanAmount);
    
  } else if (loanType === 'working-capital') {
    // Working capital - interest only payments with principal at end
    monthlyPayment = safeMultiply(loanAmount, monthlyRate);
    totalPayment = safeMultiply(monthlyPayment, totalMonths) + loanAmount;
    totalInterest = safeMultiply(monthlyPayment, totalMonths);
    
  } else if (loanType === 'line-of-credit') {
    // Line of credit - assume 50% utilization
    const avgUtilization = safeMultiply(loanAmount, 0.5);
    monthlyPayment = safeMultiply(avgUtilization, monthlyRate);
    totalPayment = safeMultiply(monthlyPayment, totalMonths);
    totalInterest = totalPayment;
  }
  
  // Calculate fees
  const processingFeeAmount = safeDivide(safeMultiply(loanAmount, processingFee), 100);
  const totalCost = totalPayment + processingFeeAmount;
  
  // Business metrics
  const debtToIncomeRatio = safeMultiply(safeDivide(existingDebt + loanAmount, businessRevenue), 100);
  const loanToValueRatio = safeMultiply(safeDivide(loanAmount, Math.max(1, collateralValue)), 100);
  const dscr = safeDivide(safeMultiply(businessRevenue, 0.3), safeMultiply(monthlyPayment, 12)); // Assuming 30% net margin
  
  // Risk assessment
  let riskLevel = 'Low';
  let eligibilityScore = 100;
  
  if (creditScore < 650) {
    eligibilityScore -= 30;
    riskLevel = 'High';
  } else if (creditScore < 750) {
    eligibilityScore -= 15;
    riskLevel = 'Medium';
  }
  
  if (businessAge < 2) {
    eligibilityScore -= 20;
    riskLevel = 'High';
  } else if (businessAge < 5) {
    eligibilityScore -= 10;
  }
  
  if (debtToIncomeRatio > 40) {
    eligibilityScore -= 25;
    riskLevel = 'High';
  } else if (debtToIncomeRatio > 25) {
    eligibilityScore -= 10;
    riskLevel = 'Medium';
  }
  
  if (dscr < 1.25) {
    eligibilityScore -= 20;
    riskLevel = 'High';
  }
  
  // Calculate tax benefits (interest is tax deductible)
  const taxRate = 0.30; // Assume 30% corporate tax rate
  const annualTaxSaving = safeMultiply(safeDivide(totalInterest, Math.max(1, loanTerm)), taxRate);
  const totalTaxSaving = safeMultiply(annualTaxSaving, loanTerm);
  const netCost = Math.max(0, totalCost - totalTaxSaving);
  
  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    processingFeeAmount,
    totalCost,
    netCost,
    debtToIncomeRatio,
    loanToValueRatio,
    dscr,
    riskLevel,
    eligibilityScore: Math.max(0, eligibilityScore),
    annualTaxSaving,
    totalTaxSaving,
    effectiveRate: safeMultiply(Math.max(0, Math.pow(safeDivide(totalCost, Math.max(1, loanAmount)), safeDivide(1, Math.max(1, loanTerm))) - 1), 100),
    paymentAsPercentOfRevenue: safeMultiply(safeDivide(safeMultiply(monthlyPayment, 12), Math.max(1, businessRevenue)), 100)
  };
}

export default function BusinessLoanCalculatorPage() {
  const [values, setValues] = useState<BusinessLoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const businessLoanResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Validate inputs
      if (values.loanAmount <= 0) {
        throw new Error('Loan amount must be greater than zero');
      }

      if (values.interestRate <= 0) {
        throw new Error('Interest rate must be greater than zero');
      }

      if (values.businessRevenue <= 0) {
        throw new Error('Business revenue must be greater than zero');
      }

      if (values.creditScore < 300 || values.creditScore > 900) {
        throw new Error('Credit score must be between 300 and 900');
      }

      const calculation = calculateBusinessLoan(values);

      if (isNaN(calculation.monthlyPayment) || calculation.monthlyPayment <= 0) {
        throw new Error('Unable to calculate payment. Please check your inputs.');
      }

      return calculation;
    } catch (err: any) {
      console.error('Business loan calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Loan Type',
      name: 'loanType',
      type: 'select',
      options: [
        { value: 'term-loan', label: 'Term Loan' },
        { value: 'working-capital', label: 'Working Capital Loan' },
        { value: 'equipment-loan', label: 'Equipment Financing' },
        { value: 'line-of-credit', label: 'Line of Credit' }
      ],
      required: true,
      tooltip: 'Type of business loan you need'
    },
    {
      label: 'Loan Amount',
      name: 'loanAmount',
      type: 'number',
      placeholder: '20,00,000',
      unit: currency.symbol,
      min: 100000,
      max: 500000000,
      required: true,
      tooltip: 'Amount you want to borrow for your business'
    },
    {
      label: 'Interest Rate',
      name: 'interestRate',
      type: 'percentage',
      placeholder: '12',
      min: 8,
      max: 30,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate offered by the lender'
    },
    {
      label: 'Loan Term',
      name: 'loanTerm',
      type: 'number',
      placeholder: '5',
      min: 1,
      max: 20,
      unit: 'years',
      required: true,
      tooltip: 'Duration to repay the business loan'
    },
    {
      label: 'Processing Fee',
      name: 'processingFee',
      type: 'percentage',
      placeholder: '1',
      min: 0,
      max: 5,
      step: 0.1,
      tooltip: 'Processing fee as percentage of loan amount'
    },
    {
      label: 'Collateral Value',
      name: 'collateralValue',
      type: 'number',
      placeholder: '25,00,000',
      unit: currency.symbol,
      min: 0,
      max: 1000000000,
      tooltip: 'Value of assets offered as collateral'
    },
    {
      label: 'Annual Business Revenue',
      name: 'businessRevenue',
      type: 'number',
      placeholder: '50,00,000',
      unit: currency.symbol,
      min: 500000,
      max: 10000000000,
      required: true,
      tooltip: 'Your business annual revenue/turnover'
    },
    {
      label: 'Existing Business Debt',
      name: 'existingDebt',
      type: 'number',
      placeholder: '5,00,000',
      unit: currency.symbol,
      min: 0,
      max: 100000000,
      tooltip: 'Current outstanding business loans'
    },
    {
      label: 'Credit Score',
      name: 'creditScore',
      type: 'number',
      placeholder: '750',
      min: 300,
      max: 900,
      required: true,
      tooltip: 'Business or personal credit score'
    },
    {
      label: 'Business Age',
      name: 'businessAge',
      type: 'number',
      placeholder: '3',
      min: 0,
      max: 50,
      unit: 'years',
      required: true,
      tooltip: 'Number of years your business has been operating'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!businessLoanResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Monthly Payment',
        value: businessLoanResults.monthlyPayment,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly payment amount for the business loan'
      },
      {
        label: 'Total Payment',
        value: businessLoanResults.totalPayment,
        type: 'currency',
        tooltip: 'Total amount to be paid over loan term'
      },
      {
        label: 'Total Interest',
        value: businessLoanResults.totalInterest,
        type: 'currency',
        tooltip: 'Total interest paid over the loan term'
      },
      {
        label: 'Processing Fee',
        value: businessLoanResults.processingFeeAmount,
        type: 'currency',
        tooltip: 'One-time processing fee charged by lender'
      },
      {
        label: 'Total Cost',
        value: businessLoanResults.totalCost,
        type: 'currency',
        tooltip: 'Total cost including interest and fees'
      },
      {
        label: 'Net Cost (After Tax)',
        value: businessLoanResults.netCost,
        type: 'currency',
        tooltip: 'Total cost after considering tax benefits'
      },
      {
        label: 'Annual Tax Saving',
        value: businessLoanResults.annualTaxSaving,
        type: 'currency',
        tooltip: 'Annual tax savings from interest deduction'
      },
      {
        label: 'Debt-to-Income Ratio',
        value: businessLoanResults.debtToIncomeRatio,
        type: 'percentage',
        tooltip: 'Total debt as percentage of business revenue'
      },
      {
        label: 'Loan-to-Value Ratio',
        value: businessLoanResults.loanToValueRatio,
        type: 'percentage',
        tooltip: 'Loan amount as percentage of collateral value'
      },
      {
        label: 'Debt Service Coverage Ratio',
        value: businessLoanResults.dscr,
        type: 'number',
        tooltip: 'Ability to service debt payments (should be > 1.25)'
      },
      {
        label: 'Eligibility Score',
        value: businessLoanResults.eligibilityScore,
        type: 'number',
        tooltip: 'Loan eligibility score based on your profile (out of 100)'
      },
      {
        label: 'Risk Level',
        value: businessLoanResults.riskLevel,
        type: 'number',
        tooltip: 'Risk assessment based on your business profile'
      }
    ];

    return calculatorResults;
  }, [businessLoanResults, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 800);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Business Loan Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Maintain a strong credit score for better rates.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Understand the different types of business loans.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Prepare a solid business plan before applying.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Business Loan Calculator"
      description="Calculate EMI, eligibility, and total cost for various business loan types. Includes risk assessment and tax benefit analysis."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Business Loan Details"
        description="Enter your business loan details to get a comprehensive analysis."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={businessLoanResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}
