"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateLoan } from '@/lib/calculations/loan';
import { loanSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 500000,
  rate: 12,
  years: 5,
  extraPayment: 0
};

interface PersonalLoanInputs {
  principal: number;
  rate: number;
  years: number;
  extraPayment: number;
}

export default function PersonalLoanCalculatorPage() {
  const [values, setValues] = useState<PersonalLoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const personalLoanResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Custom validation for personal loans
      if (values.principal < 10000) {
        throw new Error('Personal loan amount should be at least ' + currency.symbol + '10,000');
      }

      if (values.principal > 50000000) {
        throw new Error('Personal loan amount cannot exceed ' + currency.symbol + '5 crores');
      }

      if (values.rate < 8 || values.rate > 30) {
        throw new Error('Interest rate should be between 8% and 30% for personal loans');
      }

      if (values.years < 1 || values.years > 10) {
        throw new Error('Personal loan tenure should be between 1 and 10 years');
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

      const monthlyIncome = values.principal / (values.years * 12) * 3; // Assume 3x EMI as minimum income

      return {
        ...calculation,
        monthlyIncome,
      };
    } catch (err: any) {
      console.error('Personal loan calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please verify your inputs.');
      return null;
    }
  }, [values, currency.symbol]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '5,00,000',
      unit: currency.symbol,
      min: 10000,
      max: 50000000,
      required: true,
      tooltip: 'Amount you need for personal expenses'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '12',
      min: 8,
      max: 30,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate (typically 10-24% for personal loans)'
    },
    {
      label: 'Loan Tenure',
      name: 'years',
      type: 'number',
      placeholder: '5',
      min: 1,
      max: 10,
      unit: 'years',
      required: true,
      tooltip: 'Duration to repay the loan (usually 1-7 years)'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      min: 0,
      max: 100000,
      tooltip: 'Additional payment to reduce loan tenure and interest'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!personalLoanResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Monthly EMI',
        value: personalLoanResults.monthlyPayment,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly installment amount'
      },
      {
        label: 'Total Payment',
        value: personalLoanResults.totalPayment,
        type: 'currency',
        tooltip: 'Total amount to be paid over loan tenure'
      },
      {
        label: 'Total Interest',
        value: personalLoanResults.totalInterest,
        type: 'currency',
        tooltip: 'Total interest payable'
      },
      {
        label: 'Interest Rate (Effective)',
        value: (personalLoanResults.totalInterest / values.principal) * 100,
        type: 'percentage',
        tooltip: 'Effective interest rate over loan tenure'
      },
      {
        label: 'Suggested Min. Income',
        value: personalLoanResults.monthlyIncome,
        type: 'currency',
        tooltip: 'Minimum monthly income recommended (3x EMI)'
      }
    ];

    // Add prepayment benefits if applicable
    if (values.extraPayment && values.extraPayment > 0) {
      const payoffTimeMonths = personalLoanResults.payoffTime;
      const monthsReduced = Math.max(0, (values.years * 12) - payoffTimeMonths);
      
      calculatorResults.push(
        {
          label: 'Interest Saved',
          value: personalLoanResults.interestSaved,
          type: 'currency',
          tooltip: 'Interest saved with prepayments'
        },
        {
          label: 'Time Saved',
          value: Math.round(monthsReduced),
          type: 'number',
          tooltip: 'Months reduced from tenure'
        }
      );
    }

    return calculatorResults;
  }, [personalLoanResults, values.principal, values.years, values.extraPayment, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 600);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Personal Loan Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare interest rates from different banks.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Check for processing fees and other hidden charges.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Ensure your EMI is affordable within your budget.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Personal Loan EMI Calculator"
      description="Calculate EMI for personal loans with detailed breakdown and prepayment options."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Personal Loan Details"
        description="Enter your personal loan details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={personalLoanResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}