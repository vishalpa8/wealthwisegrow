"use client";

import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import {
  parseRobustNumber,
  safeDivide,
  safeMultiply,
  safeAdd,
  roundToPrecision
} from "@/lib/utils/number";

const initialValues = {
  principal: 100000,
  rate: 8,
  time: 3
};

interface SimpleInterestInputs {
  principal: number;
  rate: number;
  time: number;
}

export default function SimpleInterestCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Principal Amount', name: 'principal', type: 'number', placeholder: '1,00,000', unit: currency.symbol },
    { label: 'Annual Interest Rate', name: 'rate', type: 'percentage', placeholder: '8', step: 0.1 },
    { label: 'Time Period', name: 'time', type: 'number', placeholder: '3', step: 0.1, unit: 'years' }
  ];

  const calculate = (inputs: SimpleInterestInputs) => {
    const principal = parseRobustNumber(inputs.principal);
    const rate = parseRobustNumber(inputs.rate);
    const time = parseRobustNumber(inputs.time);

    const simpleInterest = safeDivide(safeMultiply(safeMultiply(principal, rate), time), 100);
    const totalAmount = safeAdd(principal, simpleInterest);
    const effectiveRate = safeDivide(safeMultiply(simpleInterest, 100), principal);
    const monthlyInterest = safeDivide(simpleInterest, 12);

    const results: CalculatorResult[] = [
      { label: 'Total Amount', value: roundToPrecision(totalAmount), type: 'currency', highlight: true },
      { label: 'Principal Amount', value: roundToPrecision(principal), type: 'currency' },
      { label: 'Simple Interest', value: roundToPrecision(simpleInterest), type: 'currency' },
      { label: 'Effective Return Rate', value: roundToPrecision(effectiveRate), type: 'percentage' },
      { label: 'Monthly Interest', value: roundToPrecision(monthlyInterest), type: 'currency' }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<SimpleInterestInputs>
      title="Simple Interest Calculator"
      description="Calculate simple interest earned on investments or loans using the formula: SI = P x R x T / 100"
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
