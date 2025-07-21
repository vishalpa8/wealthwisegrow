"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateIncomeTax, IncomeTaxInputs } from '@/lib/calculations/tax';
import { incomeTaxSchema } from '@/lib/validations/calculator';

const initialValues = {
  annualIncome: 1000000,
  age: 30,
  deductions: 150000,
  regime: 'new'
};

export default function IncomeTaxCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Annual Income',
      name: 'annualIncome',
      type: 'number',
      placeholder: '10,00,000',
      min: 100000,
      max: 50000000,
      required: true,
      tooltip: 'Your total annual income from all sources'
    },
    {
      label: 'Age',
      name: 'age',
      type: 'number',
      placeholder: '30',
      min: 18,
      max: 100,
      required: true,
      tooltip: 'Your age (affects tax exemption limits)'
    },
    {
      label: 'Tax Regime',
      name: 'regime',
      type: 'select',
      required: true,
      options: [
        { value: 'new', label: 'New Tax Regime' },
        { value: 'old', label: 'Old Tax Regime' }
      ],
      tooltip: 'Choose between old and new tax regimes'
    },
    {
      label: 'Deductions',
      name: 'deductions',
      type: 'number',
      placeholder: '1,50,000',
      min: 0,
      max: 1500000,
      required: true,
      tooltip: 'Total deductions under 80C, 80D, etc. (only for old regime)'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      const validation = incomeTaxSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || 'Invalid input');
        return [];
      }

      const calculation = calculateIncomeTax(validation.data as IncomeTaxInputs);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Total Tax Payable',
          value: calculation.totalTax,
          type: 'currency',
          highlight: true,
          tooltip: 'Total income tax including cess'
        },
        {
          label: 'Gross Income',
          value: calculation.grossIncome,
          type: 'currency',
          tooltip: 'Your total annual income'
        },
        {
          label: 'Taxable Income',
          value: calculation.taxableIncome,
          type: 'currency',
          tooltip: 'Income after deductions and exemptions'
        },
        {
          label: 'Income Tax',
          value: calculation.incomeTax,
          type: 'currency',
          tooltip: 'Tax before adding cess'
        },
        {
          label: 'Health & Education Cess',
          value: calculation.cess,
          type: 'currency',
          tooltip: '4% cess on income tax'
        },
        {
          label: 'Net Income',
          value: calculation.netIncome,
          type: 'currency',
          tooltip: 'Income after paying taxes'
        }
      ];

      return calculatorResults;
    } catch {
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    const parsedValue = (name === 'annualIncome' || name === 'age' || name === 'deductions') ? parseFloat(value) : value;
    setValues(prev => ({ ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Income Tax Calculator"
        description="Calculate your income tax liability under both old and new tax regimes in India."
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
