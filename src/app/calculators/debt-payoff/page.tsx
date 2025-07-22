"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";

const initialValues = {
  totalDebt: 100000,
  interestRate: 18,
  minimumPayment: 3000,
  extraPayment: 0,
  paymentStrategy: 'avalanche'
};

interface DebtPayoffInputs {
  totalDebt: number;
  interestRate: number;
  minimumPayment: number;
  extraPayment: number;
  paymentStrategy: string;
}

function calculateDebtPayoff(inputs: DebtPayoffInputs) {
  const { totalDebt, interestRate, minimumPayment, extraPayment } = inputs;
  
  const monthlyRate = interestRate / 12 / 100;
  const totalMonthlyPayment = minimumPayment + extraPayment;
  
  let remainingBalance = totalDebt;
  let totalInterestPaid = 0;
  let months = 0;
  
  // Calculate with minimum payment only
  let minPaymentBalance = totalDebt;
  let minPaymentInterest = 0;
  let minPaymentMonths = 0;
  
  while (minPaymentBalance > 0 && minPaymentMonths < 600) {
    const interestPayment = minPaymentBalance * monthlyRate;
    const principalPayment = Math.min(minimumPayment - interestPayment, minPaymentBalance);
    
    if (principalPayment <= 0) {
      minPaymentMonths = 600; // Never pays off
      break;
    }
    
    minPaymentBalance -= principalPayment;
    minPaymentInterest += interestPayment;
    minPaymentMonths++;
  }
  
  // Calculate with extra payment
  while (remainingBalance > 0 && months < 600) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = Math.min(totalMonthlyPayment - interestPayment, remainingBalance);
    
    if (principalPayment <= 0) {
      months = 600; // Never pays off
      break;
    }
    
    remainingBalance -= principalPayment;
    totalInterestPaid += interestPayment;
    months++;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  const minPaymentYears = Math.floor(minPaymentMonths / 12);
  const minPaymentRemainingMonths = minPaymentMonths % 12;
  
  const interestSaved = minPaymentInterest - totalInterestPaid;
  const timeSaved = minPaymentMonths - months;
  
  return {
    months,
    years,
    remainingMonths,
    totalInterestPaid,
    totalPayment: totalDebt + totalInterestPaid,
    minPaymentMonths,
    minPaymentYears,
    minPaymentRemainingMonths,
    minPaymentInterest,
    interestSaved,
    timeSaved: Math.max(0, timeSaved),
    payoffDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
  };
}

export default function DebtPayoffCalculatorPage() {
  const [values, setValues] = useState<DebtPayoffInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const debtPayoffResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Validate inputs
      if (values.totalDebt <= 0) {
        throw new Error('Debt amount must be greater than zero');
      }

      if (values.interestRate <= 0) {
        throw new Error('Interest rate must be greater than zero');
      }

      if (values.minimumPayment <= 0) {
        throw new Error('Minimum payment must be greater than zero');
      }

      // Check if minimum payment can cover interest
      const monthlyInterest = (values.totalDebt * values.interestRate / 12 / 100);
      if (values.minimumPayment <= monthlyInterest) {
        throw new Error('Minimum payment must be higher than monthly interest to pay off debt');
      }

      const calculation = calculateDebtPayoff(values);

      if (calculation.months >= 600) {
        throw new Error('Debt cannot be paid off with current payment amount');
      }

      return calculation;
    } catch (err: any) {
      console.error('Debt payoff calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Total Debt Amount',
      name: 'totalDebt',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      min: 1000,
      max: 10000000,
      required: true,
      tooltip: 'Total outstanding debt amount'
    },
    {
      label: 'Annual Interest Rate',
      name: 'interestRate',
      type: 'percentage',
      placeholder: '18',
      min: 1,
      max: 50,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate on your debt'
    },
    {
      label: 'Minimum Monthly Payment',
      name: 'minimumPayment',
      type: 'number',
      placeholder: '3,000',
      unit: currency.symbol,
      min: 100,
      max: 100000,
      required: true,
      tooltip: 'Minimum payment required each month'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      min: 0,
      max: 100000,
      tooltip: 'Additional amount you can pay monthly'
    },
    {
      label: 'Payment Strategy',
      name: 'paymentStrategy',
      type: 'select',
      options: [
        { value: 'avalanche', label: 'Debt Avalanche (Highest Interest First)' },
        { value: 'snowball', label: 'Debt Snowball (Smallest Balance First)' },
        { value: 'minimum', label: 'Minimum Payments Only' }
      ],
      required: true,
      tooltip: 'Strategy for paying off multiple debts'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!debtPayoffResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Payoff Time',
        value: `${debtPayoffResults.years} years${debtPayoffResults.remainingMonths ? ` and ${debtPayoffResults.remainingMonths} months` : ''}`,
        type: 'number',
        highlight: true,
        tooltip: 'Time needed to completely pay off the debt'
      },
      {
        label: 'Total Interest Paid',
        value: debtPayoffResults.totalInterestPaid,
        type: 'currency',
        tooltip: 'Total interest you will pay over the life of the debt'
      },
      {
        label: 'Total Amount Paid',
        value: debtPayoffResults.totalPayment,
        type: 'currency',
        tooltip: 'Total amount including principal and interest'
      },
      {
        label: 'Monthly Payment',
        value: values.minimumPayment + values.extraPayment,
        type: 'currency',
        tooltip: 'Your total monthly payment amount'
      }
    ];

    // Add comparison with minimum payment only
    if (values.extraPayment > 0) {
      calculatorResults.push(
        {
          label: 'Interest Saved',
          value: debtPayoffResults.interestSaved,
          type: 'currency',
          tooltip: 'Interest saved by paying extra amount'
        },
        {
          label: 'Time Saved',
          value: Math.round(debtPayoffResults.timeSaved / 12),
          type: 'number',
          tooltip: 'Years saved by paying extra amount'
        }
      );
    }

    return calculatorResults;
  }, [debtPayoffResults, values.extraPayment, values.minimumPayment, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Debt Payoff Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Prioritize high-interest debts first (Avalanche method).</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Even small extra payments can save significant interest.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider debt consolidation for lower rates.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Debt Payoff Calculator"
      description="Calculate how long it will take to pay off your debt and how much interest you'll pay. See the impact of extra payments on your debt freedom journey."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Debt Details"
        description="Enter your debt details to plan your payoff strategy."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={debtPayoffResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}
