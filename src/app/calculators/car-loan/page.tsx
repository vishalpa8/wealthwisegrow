"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateLoan } from '@/lib/calculations/loan';
import { loanSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 800000,
  rate: 9.5,
  years: 7,
  extraPayment: 0
};

interface CarLoanInputs {
  principal: number;
  rate: number;
  years: number;
  extraPayment: number;
}

export default function CarLoanCalculatorPage() {
  const [values, setValues] = useState<CarLoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const carLoanResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Custom validation for car loans
      if (values.principal < 50000) {
        throw new Error('Car loan amount should be at least ' + currency.symbol + '50,000');
      }

      if (values.principal > 50000000) {
        throw new Error('Car loan amount seems too high (max ' + currency.symbol + '5 crores)');
      }

      if (values.rate < 5 || values.rate > 25) {
        throw new Error('Car loan interest rate should be between 5% and 25%');
      }

      if (values.years < 1 || values.years > 10) {
        throw new Error('Car loan tenure should be between 1 and 10 years');
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

      // Car-specific calculations
      const carValue = values.principal; // Assuming loan amount is car value
      const depreciationRate = 0.15; // Assume 15% annual depreciation
      const currentCarValue = carValue * Math.pow(1 - depreciationRate, values.years);
      const totalDepreciation = carValue - currentCarValue;
      
      return {
        ...calculation,
        currentCarValue,
        totalDepreciation,
      };
    } catch (err: any) {
      console.error('Car loan calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please verify your inputs.');
      return null;
    }
  }, [values, currency.symbol]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Car Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '8,00,000',
      unit: currency.symbol,
      min: 50000,
      max: 50000000,
      required: true,
      tooltip: 'Total loan amount for the car purchase'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '9.5',
      min: 5,
      max: 25,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate offered by the bank (typically 7-15% for car loans)'
    },
    {
      label: 'Loan Tenure',
      name: 'years',
      type: 'number',
      placeholder: '7',
      min: 1,
      max: 10,
      unit: 'years',
      required: true,
      tooltip: 'Duration to repay the car loan (typically 1-7 years)'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      min: 0,
      max: 100000,
      tooltip: 'Additional payment to reduce loan tenure and save interest'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!carLoanResults) return [];

    return [
      {
        label: 'Monthly EMI',
        value: carLoanResults.monthlyPayment,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly installment for your car loan'
      },
      {
        label: 'Total Payment',
        value: carLoanResults.totalPayment,
        type: 'currency',
        tooltip: 'Total amount to be paid over loan tenure'
      },
      {
        label: 'Total Interest',
        value: carLoanResults.totalInterest,
        type: 'currency',
        tooltip: 'Total interest paid on the car loan'
      },
      {
        label: 'Interest as % of Loan',
        value: (carLoanResults.totalInterest / values.principal) * 100,
        type: 'percentage',
        tooltip: 'Interest as percentage of loan amount'
      },
      {
        label: 'Car Value After ' + values.years + ' Years',
        value: carLoanResults.currentCarValue,
        type: 'currency',
        tooltip: 'Estimated car value considering depreciation (15% p.a.)'
      },
      {
        label: 'Total Cost of Ownership',
        value: carLoanResults.totalInterest + carLoanResults.totalDepreciation,
        type: 'currency',
        tooltip: 'Interest paid + Depreciation = Total cost beyond car price'
      }
    ];
  }, [carLoanResults, values.principal, values.years, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Car Loan Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider down payment to reduce EMI.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare interest rates from multiple banks.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Factor in insurance and maintenance costs.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Car Loan EMI Calculator"
      description="Calculate car loan EMI, total interest, and understand the true cost of car ownership including depreciation."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Car Loan Details"
        description="Enter your car loan details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={carLoanResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}