"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateEPF, EPFInputs } from '@/lib/calculations/savings';
import { epfSchema } from '@/lib/validations/calculator';

const initialValues = {
  basicSalary: 50000,
  employeeContribution: 12,
  employerContribution: 12,
  years: 30
};

export default function EPFCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Basic Salary (Monthly)',
      name: 'basicSalary',
      type: 'number',
      placeholder: '50,000',
      min: 1000,
      max: 500000,
      required: true,
      tooltip: 'Your monthly basic salary'
    },
    {
      label: 'Employee Contribution',
      name: 'employeeContribution',
      type: 'percentage',
      placeholder: '12',
      min: 8,
      max: 12,
      required: true,
      tooltip: 'Percentage of basic salary contributed by employee'
    },
    {
      label: 'Employer Contribution',
      name: 'employerContribution',
      type: 'percentage',
      placeholder: '12',
      min: 8,
      max: 12,
      required: true,
      tooltip: 'Percentage of basic salary contributed by employer'
    },
    {
      label: 'Service Period',
      name: 'years',
      type: 'number',
      placeholder: '30',
      min: 1,
      max: 40,
      unit: 'years',
      required: true,
      tooltip: 'Number of years you plan to work'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      const validation = epfSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || 'Invalid input');
        return [];
      }

      const calculation = calculateEPF(validation.data as EPFInputs);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Maturity Amount',
          value: calculation.maturityAmount,
          type: 'currency',
          highlight: true,
          tooltip: 'Total EPF corpus at retirement'
        },
        {
          label: 'Employee Contribution',
          value: calculation.totalEmployeeContribution,
          type: 'currency',
          tooltip: 'Total amount contributed by employee'
        },
        {
          label: 'Employer Contribution',
          value: calculation.totalEmployerContribution,
          type: 'currency',
          tooltip: 'Total amount contributed by employer'
        },
        {
          label: 'Interest Earned',
          value: calculation.totalInterest,
          type: 'currency',
          tooltip: 'Interest earned on EPF corpus'
        }
      ];

      return calculatorResults;
    } catch {
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    const parsedValue = (name === 'basicSalary' || name === 'years') ? parseInt(value, 10) : parseFloat(value);
    setValues(prev => ({ ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="EPF Calculator"
        description="Calculate your Employee Provident Fund corpus and plan your retirement savings."
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
