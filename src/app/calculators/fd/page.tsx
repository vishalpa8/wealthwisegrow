"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateFD, FDInputs } from '@/lib/calculations/savings';
import { fdSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 100000,
  annualRate: 6.5,
  years: 2,
  compoundingFrequency: 'quarterly'
};

export default function FDCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Investment Amount',
      name: 'principal',
      type: 'number',
      placeholder: '1,00,000',
      min: 1000,
      max: 50000000,
      required: true,
      tooltip: 'Amount you want to invest in Fixed Deposit'
    },
    {
      label: 'Annual Interest Rate',
      name: 'annualRate',
      type: 'percentage',
      placeholder: '6.5',
      min: 1,
      max: 20,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate offered by the bank'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '2',
      min: 0.25,
      max: 20,
      step: 0.25,
      unit: 'years',
      required: true,
      tooltip: 'Duration for which you want to keep the FD'
    },
    {
      label: 'Compounding Frequency',
      name: 'compoundingFrequency',
      type: 'select',
      required: true,
      options: [
        { value: 'yearly', label: 'Yearly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'monthly', label: 'Monthly' }
      ],
      tooltip: 'How often the interest is compounded'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      const validation = fdSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || 'Invalid input');
        return [];
      }

      const calculation = calculateFD(validation.data as FDInputs);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Maturity Amount',
          value: calculation.maturityAmount,
          type: 'currency',
          highlight: true,
          tooltip: 'Amount you will receive at maturity'
        },
        {
          label: 'Principal Amount',
          value: calculation.principal,
          type: 'currency',
          tooltip: 'Your initial investment'
        },
        {
          label: 'Interest Earned',
          value: calculation.totalInterest,
          type: 'currency',
          tooltip: 'Interest earned on your investment'
        },
        {
          label: 'Effective Yield',
          value: calculation.effectiveYield,
          type: 'percentage',
          tooltip: 'Effective annual yield considering compounding'
        }
      ];

      return calculatorResults;
    } catch {
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    const parsedValue = (name === 'principal' || name === 'annualRate' || name === 'years') ? parseFloat(value) : value;
    setValues(prev => ({ ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Fixed Deposit Calculator"
        description="Calculate the maturity amount and interest earned on your Fixed Deposit investments."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={results}
        loading={loading}
        error={error}
        showComparison={true}
      />
    </div>
  );
}
