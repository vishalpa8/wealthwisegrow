"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculatePPF, PPFInputs } from '@/lib/calculations/savings';
import { parseRobustNumber } from "@/lib/utils/number";

const initialValues = {
  yearlyInvestment: 150000,
  years: 15
};

export default function PPFCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Yearly Investment',
      name: 'yearlyInvestment',
      type: 'number',
      placeholder: '1,50,000',
      unit: currency.symbol,
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '15',
      unit: 'years',
    }
  ], [currency.symbol]);

  const calculate = (values: typeof initialValues) => {
    const validatedValues: PPFInputs = {
      yearlyInvestment: Math.abs(parseRobustNumber(values.yearlyInvestment)) || 0,
      years: Math.max(parseRobustNumber(values.years) || 15, 15)
    };

    const calculation = calculatePPF(validatedValues);

    const results: CalculatorResult[] = [
      {
        label: 'Maturity Amount',
        value: calculation.maturityAmount,
        type: 'currency',
        highlight: true,
      },
      {
        label: 'Total Investment',
        value: calculation.totalInvestment,
        type: 'currency',
      },
      {
        label: 'Total Returns',
        value: calculation.totalGains,
        type: 'currency',
      },
      {
        label: 'Effective Annual Return',
        value: calculation.totalInvestment > 0 ? ((calculation.maturityAmount / calculation.totalInvestment) ** (1 / validatedValues.years) - 1) * 100 : 0,
        type: 'percentage',
      }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<typeof initialValues>
      title="PPF Account Maturity & Interest Calculator"
      description="Calculate the maturity amount and returns on your Public Provident Fund (PPF) investment with tax benefits."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
