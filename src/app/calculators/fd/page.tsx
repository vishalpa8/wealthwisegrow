"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculateFD, FDInputs } from '@/lib/calculations/savings';

const initialValues: FDInputs = {
  principal: 100000,
  annualRate: 6.5,
  years: 2,
  compoundingFrequency: 'quarterly',
};

export default function FDCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Investment Amount', name: 'principal', type: 'number', placeholder: '1,00,000', unit: currency.symbol, tooltip: 'Amount you want to invest in Fixed Deposit' },
    { label: 'Annual Interest Rate', name: 'annualRate', type: 'percentage', placeholder: '6.5', step: 0.1, tooltip: 'Annual interest rate offered by the bank' },
    { label: 'Investment Period', name: 'years', type: 'number', placeholder: '2', step: 0.25, unit: 'years', tooltip: 'Duration for which you want to keep the FD' },
    { label: 'Compounding Frequency', name: 'compoundingFrequency', type: 'select', options: [
      { value: 'yearly', label: 'Yearly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'monthly', label: 'Monthly' }
    ], tooltip: 'How often the interest is compounded' }
  ];

  const calculate = (values: FDInputs) => {
    const calculation = calculateFD(values);
    
    const results: CalculatorResult[] = [
      { label: 'Maturity Amount', value: calculation.maturityAmount, type: 'currency', highlight: true, tooltip: 'Amount you will receive at maturity' },
      { label: 'Principal Amount', value: calculation.principal, type: 'currency', tooltip: 'Your initial investment' },
      { label: 'Interest Earned', value: calculation.totalInterest, type: 'currency', tooltip: 'Interest earned on your investment' },
      { label: 'Effective Yield', value: calculation.effectiveYield, type: 'percentage', tooltip: 'Effective annual yield considering compounding' }
    ];

    return { results };
  };

  const seoContent = (
      <SEOContent title="Fixed Deposit Tips"
      description="Calculate the maturity amount and interest earned on your Fixed Deposit investments."
      sections={[
        { title: "Guaranteed Returns", content: "FDs offer guaranteed returns and capital safety." },
        { title: "Compounding", content: "Choose compounding frequency based on your needs." },
        { title: "Tax Implications", content: "Consider tax implications on FD interest." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<FDInputs>
      title="Bank Fixed Deposit (FD) Maturity Calculator"
      description="Calculate the maturity amount and interest earned on your Fixed Deposit investments."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      seoContent={seoContent}
    />
  );
}
