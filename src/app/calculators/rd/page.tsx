"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateRD, RDInputs } from '@/lib/calculations/savings';
import { rdSchema } from '@/lib/validations/calculator';

const initialValues = {
  monthlyDeposit: 5000,
  annualRate: 6.5,
  years: 5
};

export default function RDCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Monthly Deposit',
      name: 'monthlyDeposit',
      type: 'number',
      placeholder: '5,000',
      min: 100,
      max: 1000000,
      required: true,
      tooltip: 'Amount you plan to deposit every month'
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
      placeholder: '5',
      min: 1,
      max: 10,
      unit: 'years',
      required: true,
      tooltip: 'Number of years you want to continue the RD'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      const validation = rdSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || 'Invalid input');
        return [];
      }

      // Ensure the data is correctly typed
      const rdInputs: RDInputs = {
        monthlyDeposit: Number(validation.data.monthlyDeposit),
        annualRate: Number(validation.data.annualRate),
        years: Number(validation.data.years)
      };
      
      const calculation = calculateRD(rdInputs);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Maturity Amount',
          value: calculation.maturityAmount,
          type: 'currency',
          highlight: true,
          tooltip: 'Total amount you will receive at maturity'
        },
        {
          label: 'Total Deposits',
          value: calculation.totalDeposits,
          type: 'currency',
          tooltip: 'Total amount you will deposit over the period'
        },
        {
          label: 'Interest Earned',
          value: calculation.totalInterest,
          type: 'currency',
          tooltip: 'Interest earned on your deposits'
        },
        {
          label: 'Effective Annual Return',
          value: ((calculation.maturityAmount / calculation.totalDeposits) ** (1 / values.years) - 1) * 100,
          type: 'percentage',
          tooltip: 'Effective annual return considering compounding'
        }
      ];

      return calculatorResults;
    } catch {
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Recurring Deposit Calculator"
        description="Calculate the maturity amount and interest earned on your Recurring Deposit investments."
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
