"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { BaseCalculatorTemplate } from '@/components/templates/base-calculator';
import { EnhancedCalculatorField, CalculatorResult } from '@/components/organisms/enhanced-calculator-form';
import { useCurrency } from "@/contexts/currency-context";
import { calculateLoan } from '@/lib/calculations/loan';
import { parseRobustNumber } from '@/lib/utils/number';

interface HomeLoanInputs {
  principal: number;
  rate: number;
  years: number;
  extraPayment: number;
}

const initialValues: HomeLoanInputs = {
  principal: 3000000,
  rate: 8.5,
  years: 20,
  extraPayment: 0
};

export default function HomeLoanCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Home Loan Amount', name: 'principal', type: 'number', placeholder: '30,00,000', unit: currency.symbol, tooltip: 'Total amount you need to borrow for your home' },
    { label: 'Interest Rate', name: 'rate', type: 'percentage', placeholder: '8.5', step: 0.01, tooltip: 'Annual interest rate offered by the bank' },
    { label: 'Loan Tenure', name: 'years', type: 'number', placeholder: '20', unit: 'years', tooltip: 'Number of years to repay the loan' },
    { label: 'Extra Monthly Payment', name: 'extraPayment', type: 'number', placeholder: '0', unit: currency.symbol, step: 0.01, tooltip: 'Additional amount you can pay monthly to reduce tenure' }
  ];

  const calculate = (values: HomeLoanInputs) => {
    const validatedValues = {
      principal: Math.abs(parseRobustNumber(values.principal) || 0),
      rate: Math.abs(parseRobustNumber(values.rate) || 0),
      years: Math.max(parseRobustNumber(values.years) || 1, 1),
      extraPayment: Math.abs(parseRobustNumber(values.extraPayment) || 0)
    };

    const calculation = calculateLoan(validatedValues);

    const results: CalculatorResult[] = [
      { label: 'Monthly EMI', value: calculation.monthlyPayment, type: 'currency', highlight: true, tooltip: 'Monthly installment you need to pay' },
      { label: 'Total Payment', value: calculation.totalPayment, type: 'currency', tooltip: 'Total amount you will pay over the loan tenure' },
      { label: 'Total Interest', value: calculation.totalInterest, type: 'currency', tooltip: 'Total interest paid over the loan tenure' },
      { label: 'Interest as % of Principal', value: (calculation.totalInterest / validatedValues.principal) * 100, type: 'percentage', tooltip: 'Interest as percentage of loan amount' }
    ];

    if (validatedValues.extraPayment > 0) {
      const yearsReduced = Math.max(0, (validatedValues.years * 12) - calculation.payoffTime);
      results.push(
        { label: 'Interest Saved', value: calculation.interestSaved, type: 'currency', tooltip: 'Interest saved with extra payments' },
        { label: 'Time Reduced (Years)', value: Math.round(yearsReduced / 12), type: 'number', tooltip: 'Years reduced from original tenure' }
      );
    }

    return { results };
  };

  const seoContent = (
      <SEOContent title="Home Loan Tips"
      description="Calculate your home loan EMI, total payment, and interest. Plan your home purchase with confidence."
      sections={[
        { title: "Down Payment", content: "Consider a higher down payment to reduce EMI." },
        { title: "Tax Benefits", content: "Explore tax benefits on principal and interest payments." },
        { title: "Interest Types", content: "Compare fixed vs. floating interest rates." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<HomeLoanInputs>
      title="Home Loan EMI & Amortization Calculator"
      description="Calculate your home loan EMI, total payment, and interest. Plan your home purchase with confidence."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      seoContent={seoContent}
    />
  );
}
