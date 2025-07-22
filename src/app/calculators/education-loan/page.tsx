"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateLoan } from '@/lib/calculations/loan';
import { loanSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 1500000,
  rate: 8.5,
  years: 10,
  extraPayment: 0
};

interface EducationLoanInputs {
  principal: number;
  rate: number;
  years: number;
  extraPayment: number;
}

export default function EducationLoanCalculatorPage() {
  const [values, setValues] = useState<EducationLoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const educationLoanResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Custom validation for education loans
      if (values.principal < 50000) {
        throw new Error('Education loan amount should be at least ' + currency.symbol + '50,000');
      }

      if (values.principal > 100000000) {
        throw new Error('Education loan amount is too high (max ' + currency.symbol + '10 crores)');
      }

      if (values.rate < 6 || values.rate > 16) {
        throw new Error('Education loan interest rate should be between 6% and 16%');
      }

      if (values.years < 5 || values.years > 20) {
        throw new Error('Education loan tenure should be between 5 and 20 years');
      }

      const validation = loanSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        throw new Error(errorMessage);
      }

      const calculation = calculateLoan(values);

      // Validate calculation results
      if (!calculation || isNaN(calculation.monthlyPayment) || calculation.monthlyPayment <= 0) {
        throw new Error('Unable to calculate EMI. Please check your inputs.');
      }

      // Education loan specific calculations
      const totalInterest = calculation.totalInterest;
      const principal = values.principal;
      
      // Tax benefits on education loan interest (Section 80E in India)
      const annualInterest = totalInterest / values.years;
      const taxBracket = 0.30; // Assume 30% tax bracket
      const annualTaxSaving = Math.min(annualInterest, 50000) * taxBracket; // Assuming some limit
      const totalTaxSaving = annualTaxSaving * values.years;
      
      // Career impact calculations
      const educationROI = principal * 0.15; // Assume education increases earning by 15% of loan amount annually
      const totalCareerBenefit = educationROI * 20; // Over 20 year career
      
      return {
        ...calculation,
        totalTaxSaving,
        totalCareerBenefit,
      };
    } catch (err: any) {
      console.error('Education loan calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please verify your inputs.');
      return null;
    }
  }, [values, currency.symbol]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Education Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '15,00,000',
      unit: currency.symbol,
      min: 50000,
      max: 100000000,
      required: true,
      tooltip: 'Total loan amount for educational expenses'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '8.5',
      min: 6,
      max: 16,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate (typically 7-12% for education loans in India)'
    },
    {
      label: 'Repayment Period',
      name: 'years',
      type: 'number',
      placeholder: '10',
      min: 5,
      max: 20,
      unit: 'years',
      required: true,
      tooltip: 'Duration to repay the education loan (typically 5-15 years)'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      min: 0,
      max: 50000,
      tooltip: 'Additional payment to reduce loan burden faster'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!educationLoanResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Monthly EMI',
        value: educationLoanResults.monthlyPayment,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly installment for your education loan'
      },
      {
        label: 'Total Payment',
        value: educationLoanResults.totalPayment,
        type: 'currency',
        tooltip: 'Total amount to be paid over loan tenure'
      },
      {
        label: 'Total Interest',
        value: educationLoanResults.totalInterest,
        type: 'currency',
        tooltip: 'Total interest paid on the education loan'
      },
      {
        label: 'Interest as % of Loan',
        value: (educationLoanResults.totalInterest / values.principal) * 100,
        type: 'percentage',
        tooltip: 'Interest as percentage of loan amount'
      },
      {
        label: 'Estimated Tax Savings',
        value: educationLoanResults.totalTaxSaving,
        type: 'currency',
        tooltip: 'Tax benefits on education loan interest (Section 80E)'
      },
      {
        label: 'Net Cost After Tax Benefits',
        value: educationLoanResults.totalPayment - educationLoanResults.totalTaxSaving,
        type: 'currency',
        tooltip: 'Effective cost after considering tax benefits'
      },
      {
        label: 'Estimated Career ROI',
        value: educationLoanResults.totalCareerBenefit,
        type: 'currency',
        tooltip: 'Estimated additional earnings over 20 years due to education'
      }
    ];

    // Add prepayment benefits if applicable
    if (values.extraPayment && values.extraPayment > 0) {
      const payoffTimeMonths = educationLoanResults.payoffTime;
      const monthsReduced = Math.max(0, (values.years * 12) - payoffTimeMonths);
      
      calculatorResults.push(
        {
          label: 'Interest Saved with Prepayment',
          value: educationLoanResults.interestSaved,
          type: 'currency',
          tooltip: 'Interest saved with extra payments'
        },
        {
          label: 'Time Saved',
          value: Math.round(monthsReduced / 12),
          type: 'number',
          tooltip: 'Years reduced from loan tenure'
        }
      );
    }

    return calculatorResults;
  }, [educationLoanResults, values.principal, values.years, values.extraPayment, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 700);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Education Loan Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare interest rates from different lenders.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Understand the moratorium period and repayment terms.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Explore tax benefits under Section 80E.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Education Loan Calculator"
      description="Calculate education loan EMI with tax benefits and career ROI analysis. Plan your educational investment wisely."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Education Loan Details"
        description="Enter your education loan details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={educationLoanResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}