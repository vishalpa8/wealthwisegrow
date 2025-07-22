"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateEPF, EPFInputs } from '@/lib/calculations/savings';
import { epfSchema } from '@/lib/validations/calculator';

const initialValues = {
  basicSalary: 50000,
  employeeContribution: 12,
  employerContribution: 12,
  years: 30
};

export default function EPFCalculatorPage() {
  const [values, setValues] = useState<EPFInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const epfResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      const validation = epfSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        throw new Error(errorMessage);
      }

      const calculation = calculateEPF(values);

      return calculation;
    } catch (err: any) {
      console.error('EPF calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Basic Salary (Monthly)',
      name: 'basicSalary',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
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

  const results: CalculatorResult[] = useMemo(() => {
    if (!epfResults) return [];

    return [
      {
        label: 'Maturity Amount',
        value: epfResults.maturityAmount,
        type: 'currency',
        highlight: true,
        tooltip: 'Total EPF corpus at retirement'
      },
      {
        label: 'Employee Contribution',
        value: epfResults.totalEmployeeContribution,
        type: 'currency',
        tooltip: 'Total amount contributed by employee'
      },
      {
        label: 'Employer Contribution',
        value: epfResults.totalEmployerContribution,
        type: 'currency',
        tooltip: 'Total amount contributed by employer'
      },
      {
        label: 'Interest Earned',
        value: epfResults.totalInterest,
        type: 'currency',
        tooltip: 'Interest earned on EPF corpus'
      }
    ];
  }, [epfResults, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">EPF Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">EPF is a mandatory savings scheme for salaried employees.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">It provides tax benefits under Section 80C.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Interest earned on EPF is tax-exempt on maturity.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="EPF Calculator"
      description="Calculate your Employee Provident Fund corpus and plan your retirement savings."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="EPF Details"
        description="Enter your EPF details to estimate your maturity amount."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={epfResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}