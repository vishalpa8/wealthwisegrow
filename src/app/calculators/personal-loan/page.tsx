"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculateLoan } from '@/lib/calculations/loan';
import { parseRobustNumber } from "@/lib/utils/number";

const initialValues = {
  principal: 500000,
  rate: 12,
  years: 5,
  extraPayment: 0
};

export default function PersonalLoanCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '5,00,000',
      unit: currency.symbol,
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '12',
      step: 0.1,
    },
    {
      label: 'Loan Tenure',
      name: 'years',
      type: 'number',
      placeholder: '5',
      unit: 'years',
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
    }
  ], [currency.symbol]);

  const calculate = (values: typeof initialValues) => {
    const validatedValues = {
      principal: Math.abs(parseRobustNumber(values.principal) || 0),
      rate: Math.abs(parseRobustNumber(values.rate) || 0),
      years: Math.max(parseRobustNumber(values.years) || 1, 1),
      extraPayment: Math.abs(parseRobustNumber(values.extraPayment) || 0)
    };

    const calculation = calculateLoan(validatedValues);

    const monthlyIncome = validatedValues.principal > 0 ? 
      (validatedValues.principal / (validatedValues.years * 12) * 3) : 0;

    const results: CalculatorResult[] = [
      {
        label: 'Monthly EMI',
        value: calculation.monthlyPayment,
        type: 'currency',
        highlight: true,
      },
      {
        label: 'Total Payment',
        value: calculation.totalPayment,
        type: 'currency',
      },
      {
        label: 'Total Interest',
        value: calculation.totalInterest,
        type: 'currency',
      },
      {
        label: 'Interest Rate (Effective)',
        value: validatedValues.principal > 0 ? (calculation.totalInterest / validatedValues.principal) * 100 : 0,
        type: 'percentage',
      },
      {
        label: 'Suggested Min. Income',
        value: monthlyIncome,
        type: 'currency',
      }
    ];

    if (validatedValues.extraPayment > 0) {
      const payoffTimeMonths = calculation.payoffTime;
      const monthsReduced = Math.max(0, (validatedValues.years * 12) - payoffTimeMonths);
      
      results.push(
        {
          label: 'Interest Saved',
          value: calculation.interestSaved,
          type: 'currency',
        },
        {
          label: 'Time Saved (Months)',
          value: Math.round(monthsReduced),
          type: 'number',
        }
      );
    }

    return { results };
  };

  return (
    <BaseCalculatorTemplate<typeof initialValues>
      title="Instant Personal Loan EMI Calculator"
      description="Calculate EMI for personal loans with detailed breakdown and prepayment options."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
