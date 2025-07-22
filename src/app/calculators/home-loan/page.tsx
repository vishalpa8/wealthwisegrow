"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateLoan } from '@/lib/calculations/loan';
import { loanSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 3000000,
  rate: 8.5,
  years: 20,
  extraPayment: 0
};

interface HomeLoanInputs {
  principal: number;
  rate: number;
  years: number;
  extraPayment: number;
}

export default function HomeLoanCalculatorPage() {
  const [values, setValues] = useState<HomeLoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const homeLoanResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Custom validation for home loans
      if (values.principal < 100000) {
        throw new Error('Home loan amount should be at least ' + currency.symbol + '1,00,000');
      }

      if (values.principal > 500000000) {
        throw new Error('Home loan amount seems too high (max ' + currency.symbol + '50 crores)');
      }

      if (values.rate <= 0 || values.rate > 20) {
        throw new Error('Interest rate should be between 1% and 20%');
      }

      if (values.years <= 0 || values.years > 30) {
        throw new Error('Loan tenure should be between 1 and 30 years');
      }

      const validation = loanSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        throw new Error(errorMessage);
      }

      const calculation = calculateLoan(values);

      // Check for calculation errors
      if (!calculation || isNaN(calculation.monthlyPayment) || calculation.monthlyPayment <= 0) {
        throw new Error('Unable to calculate EMI. Please check your inputs.');
      }

      return calculation;
    } catch (err: any) {
      console.error('Home loan calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please verify your inputs and try again.');
      return null;
    }
  }, [values, currency.symbol]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Home Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '30,00,000',
      unit: currency.symbol,
      min: 100000,
      max: 500000000,
      required: true,
      tooltip: 'Total amount you need to borrow for your home'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '8.5',
      min: 1,
      max: 20,
      step: 0.01,
      required: true,
      tooltip: 'Annual interest rate offered by the bank'
    },
    {
      label: 'Loan Tenure',
      name: 'years',
      type: 'number',
      placeholder: '20',
      min: 1,
      max: 30,
      unit: 'years',
      required: true,
      tooltip: 'Number of years to repay the loan'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      min: 0,
      max: 1000000,
      step: 0.01,
      tooltip: 'Additional amount you can pay monthly to reduce tenure'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!homeLoanResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Monthly EMI',
        value: homeLoanResults.monthlyPayment,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly installment you need to pay'
      },
      {
        label: 'Total Payment',
        value: homeLoanResults.totalPayment,
        type: 'currency',
        tooltip: 'Total amount you will pay over the loan tenure'
      },
      {
        label: 'Total Interest',
        value: homeLoanResults.totalInterest,
        type: 'currency',
        tooltip: 'Total interest paid over the loan tenure'
      },
      {
        label: 'Interest as % of Principal',
        value: (homeLoanResults.totalInterest / values.principal) * 100,
        type: 'percentage',
        tooltip: 'Interest as percentage of loan amount'
      }
    ];

    // Add extra payment benefits if applicable
    if (values.extraPayment && values.extraPayment > 0) {
      const payoffTimeMonths = homeLoanResults.payoffTime;
      const yearsReduced = Math.max(0, (values.years * 12) - payoffTimeMonths);
      
      calculatorResults.push(
        {
          label: 'Interest Saved',
          value: homeLoanResults.interestSaved,
          type: 'currency',
          tooltip: 'Interest saved with extra payments'
        },
        {
          label: 'Time Reduced',
          value: Math.round(yearsReduced / 12),
          type: 'number',
          tooltip: 'Years reduced from original tenure'
        }
      );
    }

    return calculatorResults;
  }, [homeLoanResults, values.principal, values.years, values.extraPayment, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 500);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Home Loan Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider a higher down payment to reduce EMI.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Explore tax benefits on principal and interest payments.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare fixed vs. floating interest rates.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Home Loan EMI Calculator"
      description="Calculate your home loan EMI, total payment, and interest. Plan your home purchase with confidence."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Home Loan Details"
        description="Enter your home loan details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={homeLoanResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}
