"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
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
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Annual Income',
      name: 'annualIncome',
      type: 'number',
      placeholder: '10,00,000',
      unit: currency.symbol,
    },
    {
      label: 'Age',
      name: 'age',
      type: 'number',
      placeholder: '30',
    },
    {
      label: 'Tax Regime',
      name: 'regime',
      type: 'select',
      options: [
        { value: 'new', label: 'New Tax Regime' },
        { value: 'old', label: 'Old Tax Regime' }
      ],
    },
    {
      label: 'Deductions',
      name: 'deductions',
      type: 'number',
      placeholder: '1,50,000',
      unit: currency.symbol,
    }
  ], [currency.symbol]);

  const calculate = (values: typeof initialValues) => {
    const validatedValues: IncomeTaxInputs = {
      annualIncome: Math.abs(parseRobustNumber(values.annualIncome)) || 0,
      age: Math.max(18, Math.abs(parseRobustNumber(values.age)) || 25),
      deductions: Math.abs(parseRobustNumber(values.deductions)) || 0,
      regime: (values.regime as 'old' | 'new') || 'new'
    };

    const calculation = calculateIncomeTax(validatedValues);

    const results: CalculatorResult[] = [
      {
        label: 'Total Tax Payable',
        value: calculation.totalTax,
        type: 'currency',
        highlight: true,
      },
      {
        label: 'Gross Income',
        value: calculation.grossIncome,
        type: 'currency',
      },
      {
        label: 'Taxable Income',
        value: calculation.taxableIncome,
        type: 'currency',
      },
      {
        label: 'Income Tax',
        value: calculation.incomeTax,
        type: 'currency',
      },
      {
        label: 'Health & Education Cess',
        value: calculation.cess,
        type: 'currency',
      },
      {
        label: 'Net Income',
        value: calculation.netIncome,
        type: 'currency',
      }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<typeof initialValues>
      title="Income Tax Calculator"
      description="Calculate your income tax liability under both old and new tax regimes in India."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
