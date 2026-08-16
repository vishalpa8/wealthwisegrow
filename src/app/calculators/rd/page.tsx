"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculateRD, RDInputs } from '@/lib/calculations/savings';
import { parseRobustNumber } from "@/lib/utils/number";

const initialValues = {
  monthlyDeposit: 5000,
  annualRate: 6.5,
  years: 5
};

export default function RDCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Monthly Deposit',
      name: 'monthlyDeposit',
      type: 'number',
      placeholder: '5,000',
      unit: currency.symbol,
    },
    {
      label: 'Annual Interest Rate',
      name: 'annualRate',
      type: 'percentage',
      placeholder: '6.5',
      step: 0.1,
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '5',
      unit: 'years',
    }
  ], [currency.symbol]);

  const calculate = (values: typeof initialValues) => {
    const validatedValues: RDInputs = {
      monthlyDeposit: Math.abs(parseRobustNumber(values.monthlyDeposit)) || 0,
      annualRate: Math.abs(parseRobustNumber(values.annualRate)) || 0,
      years: Math.max(parseRobustNumber(values.years) || 1, 1)
    };

    const calculation = calculateRD(validatedValues);

    const results: CalculatorResult[] = [
      {
        label: 'Maturity Amount',
        value: calculation.maturityAmount,
        type: 'currency',
        highlight: true,
      },
      {
        label: 'Total Deposits',
        value: calculation.totalDeposits,
        type: 'currency',
      },
      {
        label: 'Interest Earned',
        value: calculation.totalInterest,
        type: 'currency',
      },
      {
        label: 'Effective Annual Return',
        value: calculation.totalDeposits > 0 ? ((calculation.maturityAmount / calculation.totalDeposits) ** (1 / validatedValues.years) - 1) * 100 : 0,
        type: 'percentage',
      }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<typeof initialValues>
      title="Recurring Deposit (RD) Maturity Calculator"
      description="Calculate the maturity amount and interest earned on your Recurring Deposit investments."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
