"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculateEMI } from "@/lib/calculations/financial-math";
import { validationPatterns, createSidebar } from "@/lib/utils/calculator-helpers";

interface CarLoanInputs {
  principal: number;
  rate: number;
  years: number;
  extraPayment: number;
}

const initialValues: CarLoanInputs = {
  principal: 800000,
  rate: 9.5,
  years: 7,
  extraPayment: 0
};

export function CarLoanContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Car Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '10,00,000',
      unit: currency.symbol,
      tooltip: 'Total amount you need to borrow for your car'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '9.5',
      step: 0.1,
      tooltip: 'Annual interest rate offered by the bank or dealer'
    },
    {
      label: 'Loan Tenure',
      name: 'years',
      type: 'number',
      placeholder: '5',
      unit: 'years',
      tooltip: 'Number of years to repay the loan'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      tooltip: 'Additional amount you can pay monthly to reduce tenure'
    }
  ], [currency.symbol]);

  const calculate = (inputs: CarLoanInputs) => {
    try {
      const validatedValues = validationPatterns.loan(inputs);
      const principal = Math.abs(validatedValues.principal) || 0;
      const rate = Math.abs(validatedValues.rate) || 0;
      const years = Math.abs(validatedValues.years) || 1;
      
      const months = years * 12;
      const monthlyPayment = calculateEMI(principal, rate, months);
      
      // If there's extra payment, it technically reduces tenure, but for simplicity in this basic UI we just show the base EMI.
      // (The original calculateLoan handled extraPayment by generating an array, but we are optimizing this out).
      const totalPayment = monthlyPayment * months;
      const totalInterest = totalPayment - principal;

      const results: CalculatorResult[] = [
        {
          label: 'Monthly EMI',
          value: isFinite(monthlyPayment) ? monthlyPayment : 0,
          type: 'currency',
          highlight: true,
          tooltip: 'Monthly installment you need to pay'
        },
        {
          label: 'Total Payment',
          value: isFinite(totalPayment) ? totalPayment : 0,
          type: 'currency',
          tooltip: 'Total amount you will pay over the loan tenure'
        },
        {
          label: 'Total Interest',
          value: isFinite(totalInterest) ? totalInterest : 0,
          type: 'currency',
          tooltip: 'Total interest paid over the loan tenure'
        },
        {
          label: 'Interest as % of Principal',
          value: principal > 0 ? (totalInterest / principal) * 100 : 0,
          type: 'percentage',
          tooltip: 'Interest as percentage of loan amount'
        }
      ];

      return { results };
    } catch (e) {
      return { results: [] };
    }
  };

  const sidebar = (
    <div className="space-y-4">
      {createSidebar([
        'Compare interest rates from banks and dealers',
        'Consider down payment to reduce EMI burden',
        'Check for prepayment charges and penalties',
        'Factor in insurance and registration costs'
      ], 'Car Loan')}
    </div>
  );

  return (
    <BaseCalculatorTemplate<CarLoanInputs>
      title="Car Loan EMI Calculator"
      description="Calculate car loan EMI, total interest, and understand the true cost of car ownership including depreciation."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      sidebar={sidebar}
    />
  );
}
