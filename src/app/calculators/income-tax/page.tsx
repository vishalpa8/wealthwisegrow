"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateIncomeTax, IncomeTaxInputs } from '@/lib/calculations/tax';
import { parseRobustNumber } from '@/lib/utils/number';

const initialValues = {
  annualIncome: 1000000,
  age: 30,
  deductions: 150000,
  regime: 'new'
};

export default function IncomeTaxCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Annual Income',
      name: 'annualIncome',
      type: 'number',
      placeholder: '10,00,000',
      unit: currency.symbol,
      tooltip: 'Your total annual income from all sources'
    },
    {
      label: 'Age',
      name: 'age',
      type: 'number',
      placeholder: '30',
      tooltip: 'Your age (affects tax exemption limits)'
    },
    {
      label: 'Tax Regime',
      name: 'regime',
      type: 'select',
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
      unit: currency.symbol,
      tooltip: 'Total deductions under 80C, 80D, etc. (only for old regime)'
    }
  ];

  const results = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Use flexible validation with graceful handling
      const validatedValues: IncomeTaxInputs = {
        annualIncome: Math.abs(parseRobustNumber(values.annualIncome)) || 0,
        age: Math.max(18, Math.abs(parseRobustNumber(values.age)) || 25),
        deductions: Math.abs(parseRobustNumber(values.deductions)) || 0,
        regime: (values.regime as 'old' | 'new') || 'new'
      };

      const calculation = calculateIncomeTax(validatedValues);

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
    } catch (err: any) {
      console.error('Income tax calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Tax Planning Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare old vs new tax regime to save more.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Maximize deductions under Section 80C, 80D.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Plan investments for tax efficiency.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Income Tax Calculator"
      description="Calculate your income tax liability under both old and new tax regimes in India."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Income Tax Details"
        description="Enter your income and deduction details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={results}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}