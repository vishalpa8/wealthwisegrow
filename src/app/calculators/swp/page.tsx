"use client";

import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";

const initialValues = {
  totalCorpus: 1000000,
  monthlyWithdrawal: 10000,
  expectedReturn: 8,
  withdrawalIncrease: 5
};

interface SWPInputs {
  totalCorpus: number;
  monthlyWithdrawal: number;
  expectedReturn: number;
  withdrawalIncrease: number;
}

export default function SWPCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Total Investment Corpus', name: 'totalCorpus', type: 'number', placeholder: '10,00,000', unit: currency.symbol },
    { label: 'Monthly Withdrawal Amount', name: 'monthlyWithdrawal', type: 'number', placeholder: '10,000', unit: currency.symbol },
    { label: 'Expected Return Rate', name: 'expectedReturn', type: 'percentage', placeholder: '8', step: 0.1 },
    { label: 'Annual Withdrawal Increase', name: 'withdrawalIncrease', type: 'percentage', placeholder: '5', step: 0.1 }
  ];

  const calculate = (inputs: SWPInputs) => {
    const totalCorpus = Math.abs(parseRobustNumber(inputs.totalCorpus)) || 0;
    const monthlyWithdrawal = Math.abs(parseRobustNumber(inputs.monthlyWithdrawal)) || 0;
    const expectedReturn = Math.abs(parseRobustNumber(inputs.expectedReturn)) || 0;
    const withdrawalIncrease = Math.abs(parseRobustNumber(inputs.withdrawalIncrease)) || 0;

    const monthlyRate = expectedReturn / 12 / 100;
    const monthlyWithdrawalIncrease = withdrawalIncrease / 12 / 100;

    let remainingCorpus = totalCorpus;
    let currentWithdrawal = monthlyWithdrawal;
    let totalWithdrawn = 0;
    let months = 0;

    while (remainingCorpus > 0 && months < 600) {
      remainingCorpus *= (1 + monthlyRate);
      remainingCorpus -= currentWithdrawal;
      totalWithdrawn += currentWithdrawal;
      currentWithdrawal *= (1 + monthlyWithdrawalIncrease);
      months++;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    const results: CalculatorResult[] = [
      { label: 'Corpus Will Last For', value: `${years} years${remainingMonths ? ` and ${remainingMonths} months` : ''}`, type: 'number', highlight: true },
      { label: 'Initial Withdrawal Rate', value: (monthlyWithdrawal * 12 / totalCorpus) * 100, type: 'percentage' },
      { label: 'Total Amount Withdrawn', value: totalWithdrawn, type: 'currency' },
      { label: 'First Year Withdrawal', value: monthlyWithdrawal * 12, type: 'currency' },
      { label: 'Last Year Withdrawal', value: currentWithdrawal * 12, type: 'currency' }
    ];

    if (remainingCorpus > 0) {
      results.push({ label: 'Remaining Corpus', value: Math.max(0, remainingCorpus), type: 'currency' });
    }

    return { results };
  };

  return (
    <BaseCalculatorTemplate<SWPInputs>
      title="Mutual Fund SWP (Systematic Withdrawal Plan) Calculator"
      description="Calculate how long your investments will last with regular withdrawals. Plan your post-retirement withdrawals effectively."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
