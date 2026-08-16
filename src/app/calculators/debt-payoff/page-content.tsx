"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";

interface DebtPayoffInputs {
  totalDebt: number;
  interestRate: number;
  minimumPayment: number;
  extraPayment: number;
  paymentStrategy: string;
}

const initialValues: DebtPayoffInputs = {
  totalDebt: 100000,
  interestRate: 18,
  minimumPayment: 3000,
  extraPayment: 0,
  paymentStrategy: 'avalanche'
};

export function DebtPayoffContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Total Debt Amount',
      name: 'totalDebt',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      tooltip: 'Total outstanding debt amount'
    },
    {
      label: 'Annual Interest Rate',
      name: 'interestRate',
      type: 'percentage',
      placeholder: '18',
      step: 0.1,
      tooltip: 'Annual interest rate on your debt'
    },
    {
      label: 'Minimum Monthly Payment',
      name: 'minimumPayment',
      type: 'number',
      placeholder: '3,000',
      unit: currency.symbol,
      tooltip: 'Minimum payment required each month'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      tooltip: 'Additional amount you can pay monthly'
    },
    {
      label: 'Payment Strategy',
      name: 'paymentStrategy',
      type: 'select',
      options: [
        { value: 'avalanche', label: 'Debt Avalanche (Highest Interest First)' },
        { value: 'snowball', label: 'Debt Snowball (Smallest Balance First)' },
        { value: 'minimum', label: 'Minimum Payments Only' }
      ],
      tooltip: 'Strategy for paying off multiple debts'
    }
  ], [currency.symbol]);

  const calculate = (inputs: DebtPayoffInputs) => {
    const totalDebt = Math.abs(parseRobustNumber(inputs.totalDebt)) || 100000;
    const interestRate = Math.abs(parseRobustNumber(inputs.interestRate)) || 18;
    const minimumPayment = Math.abs(parseRobustNumber(inputs.minimumPayment)) || 1000;
    const extraPayment = Math.abs(parseRobustNumber(inputs.extraPayment)) || 0;
    
    const monthlyRate = interestRate / 12 / 100;
    const totalMonthlyPayment = minimumPayment + extraPayment;
    
    const monthlyInterest = totalDebt * monthlyRate;
    const effectiveMinPayment = Math.max(minimumPayment, monthlyInterest + 1);
    const effectiveTotalPayment = Math.max(totalMonthlyPayment, monthlyInterest + 1);
    
    let remainingBalance = totalDebt;
    let totalInterestPaid = 0;
    let months = 0;
    
    let minPaymentBalance = totalDebt;
    let minPaymentInterest = 0;
    let minPaymentMonths = 0;
    
    while (minPaymentBalance > 0.01 && minPaymentMonths < 600) {
      const interestPayment = minPaymentBalance * monthlyRate;
      const principalPayment = Math.min(effectiveMinPayment - interestPayment, minPaymentBalance);
      if (principalPayment <= 0) { minPaymentMonths = 600; break; }
      minPaymentBalance -= principalPayment;
      minPaymentInterest += interestPayment;
      minPaymentMonths++;
    }
    
    while (remainingBalance > 0.01 && months < 600) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(effectiveTotalPayment - interestPayment, remainingBalance);
      if (principalPayment <= 0) { months = 600; break; }
      remainingBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      months++;
    }
    
    if (months >= 600) {
      // Very long payoff time, perhaps show a warning via results or just return it
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const interestSaved = Math.max(0, minPaymentInterest - totalInterestPaid);
    const timeSaved = Math.max(0, minPaymentMonths - months);
    
    const results: CalculatorResult[] = [
      {
        label: 'Payoff Time',
        value: `${years} years${remainingMonths ? ` and ${remainingMonths} months` : ''}`,
        type: 'number',
        highlight: true,
        tooltip: 'Time needed to completely pay off the debt'
      },
      {
        label: 'Total Interest Paid',
        value: totalInterestPaid,
        type: 'currency',
        tooltip: 'Total interest you will pay over the life of the debt'
      },
      {
        label: 'Total Amount Paid',
        value: totalDebt + totalInterestPaid,
        type: 'currency',
        tooltip: 'Total amount including principal and interest'
      },
      {
        label: 'Monthly Payment',
        value: totalMonthlyPayment,
        type: 'currency',
        tooltip: 'Your total monthly payment amount'
      }
    ];

    if (extraPayment > 0) {
      results.push(
        {
          label: 'Interest Saved',
          value: interestSaved,
          type: 'currency',
          tooltip: 'Interest saved by paying extra amount'
        },
        {
          label: 'Time Saved',
          value: Math.round(timeSaved / 12),
          type: 'number',
          tooltip: 'Years saved by paying extra amount'
        }
      );
    }

    return { results };
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Debt Payoff Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Prioritize high-interest debts first (Avalanche method).</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Even small extra payments can save significant interest.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider debt consolidation for lower rates.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseCalculatorTemplate<DebtPayoffInputs>
      title="Debt Snowball & Payoff Strategy Calculator"
      description="Calculate how long it will take to pay off your debt and how much interest you'll pay. See the impact of extra payments on your debt freedom journey."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      sidebar={sidebar}
    />
  );
}
