"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculatePPF, PPFInputs } from '@/lib/calculations/savings';
import { ppfSchema } from '@/lib/validations/calculator';

const initialValues = {
  yearlyInvestment: 150000,
  years: 15
};

export default function PPFCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Yearly Investment',
      name: 'yearlyInvestment',
      type: 'number',
      placeholder: '1,50,000',
      min: 500,
      max: 150000,
      required: true,
      tooltip: 'Amount you plan to invest annually in PPF (Min: ₹500, Max: ₹1,50,000)'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '15',
      min: 15,
      max: 50,
      unit: 'years',
      required: true,
      tooltip: 'Duration for PPF investment (Minimum 15 years lock-in period)'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      const validation = ppfSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || 'Invalid input');
        return [];
      }

      const calculation = calculatePPF(validation.data as PPFInputs);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Maturity Amount',
          value: calculation.maturityAmount,
          type: 'currency',
          highlight: true,
          tooltip: 'Total amount you will receive at maturity'
        },
        {
          label: 'Total Investment',
          value: calculation.totalInvestment,
          type: 'currency',
          tooltip: 'Total amount you will invest over the period'
        },
        {
          label: 'Total Returns',
          value: calculation.totalGains,
          type: 'currency',
          tooltip: 'Interest earned on your PPF investment'
        },
        {
          label: 'Effective Annual Return',
          value: ((calculation.maturityAmount / calculation.totalInvestment) ** (1 / values.years) - 1) * 100,
          type: 'percentage',
          tooltip: 'Annualized return rate considering compounding'
        }
      ];

      return calculatorResults;
    } catch {
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    const parsedValue = parseFloat(value);
    setValues(prev => ({ ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="PPF Calculator"
        description="Calculate the maturity amount and returns on your Public Provident Fund (PPF) investment with tax benefits."
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