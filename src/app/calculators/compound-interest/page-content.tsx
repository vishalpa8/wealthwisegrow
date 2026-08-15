"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber, safeDivide, safeMultiply, safePower, safeAdd, safeSubtract, roundToPrecision } from "@/lib/utils/number";

interface CompoundInterestInputs {
  principal: number;
  rate: number;
  time: number;
  compoundingFrequency: string;
  calculationType: string;
}

const initialValues: CompoundInterestInputs = {
  principal: 100000,
  rate: 8,
  time: 5,
  compoundingFrequency: 'yearly',
  calculationType: 'compound',
};

export function CompoundInterestContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Principal Amount',
      name: 'principal',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      tooltip: 'Initial amount of money invested or borrowed'
    },
    {
      label: 'Annual Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '8',
      step: 0.1,
      tooltip: 'Annual interest rate (compound interest rate)'
    },
    {
      label: 'Time Period',
      name: 'time',
      type: 'number',
      placeholder: '5',
      step: 0.1,
      unit: 'years',
      tooltip: 'Duration for which money is invested or borrowed'
    },
    {
      label: 'Calculation Type',
      name: 'calculationType',
      type: 'select',
      options: [
        { value: 'compound', label: 'Compound Interest' },
        { value: 'simple', label: 'Simple Interest' },
      ],
      tooltip: 'Choose the type of interest calculation'
    },
    {
      label: 'Compounding Frequency',
      name: 'compoundingFrequency',
      type: 'select',
      options: [
        { value: 'yearly', label: 'Yearly (1 time/year)' },
        { value: 'half-yearly', label: 'Half-Yearly (2 times/year)' },
        { value: 'quarterly', label: 'Quarterly (4 times/year)' },
        { value: 'monthly', label: 'Monthly (12 times/year)' },
        { value: 'daily', label: 'Daily (365 times/year)' }
      ],
      tooltip: 'How often interest is compounded'
    }
  ], [currency.symbol]);

  const calculate = (inputs: CompoundInterestInputs) => {
    try {
      const principal = Math.abs(parseRobustNumber(inputs.principal) || 0);
      const rate = Math.abs(parseRobustNumber(inputs.rate) || 0);
      const time = Math.abs(parseRobustNumber(inputs.time) || 1);
      const { compoundingFrequency, calculationType } = inputs;

      if (calculationType === 'compound') {
        const frequencies: Record<string, number> = {
          'yearly': 1, 'half-yearly': 2, 'quarterly': 4, 'monthly': 12, 'daily': 365
        };
        const n = frequencies[compoundingFrequency] || 1;
        const r = safeDivide(rate, 100);
        const ratePerPeriod = safeDivide(r, n);
        const periodsTotal = safeMultiply(n, time);

        if (periodsTotal > 1000) return { results: [] };
        const compoundFactor = safePower(safeAdd(1, ratePerPeriod), periodsTotal);
        if (!isFinite(compoundFactor) || compoundFactor === 0) return { results: [] };

        const totalAmount = safeMultiply(principal, compoundFactor);
        const compoundInterest = safeSubtract(totalAmount, principal);
        const simpleInterest = safeDivide(safeMultiply(safeMultiply(principal, rate), time), 100);
        const additionalEarnings = safeSubtract(compoundInterest, simpleInterest);
        const effectiveAnnualRate = safeMultiply(safeSubtract(safePower(compoundFactor, safeDivide(1, time)), 1), 100);

        return {
          results: [
            { label: 'Final Amount', value: totalAmount, type: 'currency', highlight: true, tooltip: 'Principal + Compound Interest' },
            { label: 'Principal Amount', value: principal, type: 'currency', tooltip: 'Initial investment amount' },
            { label: 'Compound Interest', value: compoundInterest, type: 'currency', tooltip: 'Interest earned with compounding' },
            { label: 'Simple Interest (comparison)', value: simpleInterest, type: 'currency', tooltip: 'Interest without compounding for comparison' },
            { label: 'Additional Earnings (Compounding)', value: additionalEarnings, type: 'currency', tooltip: 'Extra money earned due to compounding effect' },
            { label: 'Effective Annual Rate', value: effectiveAnnualRate, type: 'percentage', tooltip: 'Effective annual return rate considering compounding' }
          ] as CalculatorResult[]
        };
      } else {
        const simpleInterest = safeDivide(safeMultiply(safeMultiply(principal, rate), time), 100);
        const totalAmount = safeAdd(principal, simpleInterest);
        const effectiveRate = safeDivide(safeMultiply(simpleInterest, 100), principal);
        const monthlyInterest = safeDivide(simpleInterest, safeMultiply(time, 12));

        return {
          results: [
            { label: 'Total Amount', value: totalAmount, type: 'currency', highlight: true, tooltip: 'Principal + Simple Interest' },
            { label: 'Principal Amount', value: principal, type: 'currency', tooltip: 'Initial investment amount' },
            { label: 'Simple Interest', value: simpleInterest, type: 'currency', tooltip: 'Interest earned using simple interest formula' },
            { label: 'Effective Return Rate', value: effectiveRate, type: 'percentage', tooltip: 'Total return as percentage of principal' },
            { label: 'Monthly Interest', value: monthlyInterest, type: 'currency', tooltip: 'Average interest earned per month' }
          ] as CalculatorResult[]
        };
      }
    } catch (e) {
      return { results: [] };
    }
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Compound Interest Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compounding works best over longer periods.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Higher compounding frequency leads to more interest.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Even small regular investments can grow significantly.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseCalculatorTemplate<CompoundInterestInputs>
      title="Compound Interest Calculator"
      description="Calculate compound interest with different compounding frequencies and compare with simple interest."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      sidebar={sidebar}
    />
  );
}
