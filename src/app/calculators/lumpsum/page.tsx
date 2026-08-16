"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculateLumpsum, LumpsumInputs } from '@/lib/calculations/savings';
import { parseRobustNumber } from "@/lib/utils/number";

const initialValues = {
  principal: 100000,
  annualReturn: 12,
  years: 10
};

export default function LumpsumCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Investment Amount',
      name: 'principal',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
    },
    {
      label: 'Expected Annual Return',
      name: 'annualReturn',
      type: 'percentage',
      placeholder: '12',
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '10',
      unit: 'years',
    }
  ], [currency.symbol]);

  const calculate = (values: typeof initialValues) => {
    const validatedValues: LumpsumInputs = {
      principal: Math.abs(parseRobustNumber(values.principal)) || 0,
      annualReturn: Math.abs(parseRobustNumber(values.annualReturn)) || 0,
      years: Math.abs(parseRobustNumber(values.years)) || 0
    };

    const calculation = calculateLumpsum(validatedValues);

    const results: CalculatorResult[] = [
      {
        label: 'Maturity Amount',
        value: calculation.maturityAmount,
        type: 'currency',
        highlight: true,
      },
      {
        label: 'Investment Amount',
        value: calculation.principal,
        type: 'currency',
      },
      {
        label: 'Total Returns',
        value: calculation.totalGains,
        type: 'currency',
      },
      {
        label: 'Return Multiple',
        value: calculation.principal > 0 ? calculation.maturityAmount / calculation.principal : 0,
        type: 'number',
      }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<typeof initialValues>
      title="Mutual Fund Lumpsum Investment Return Calculator"
      description="Calculate the future value of your one-time investment with compound interest."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
