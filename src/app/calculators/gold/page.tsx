"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { BaseCalculatorTemplate } from '@/components/templates/base-calculator';
import { EnhancedCalculatorField, CalculatorResult } from '@/components/organisms/enhanced-calculator-form';
import { useCurrency } from "@/contexts/currency-context";
import { calculateGoldInvestment, GoldInputs } from '@/lib/calculations/savings';
import { parseRobustNumber } from '@/lib/utils/number';

const initialValues: GoldInputs = {
  investmentAmount: 100000,
  goldPricePerGram: 6000,
  years: 10,
  expectedAnnualReturn: 8
};

export default function GoldCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Investment Amount', name: 'investmentAmount', type: 'number', placeholder: '1,00,000', unit: currency.symbol, tooltip: 'Amount you want to invest in gold' },
    { label: 'Current Gold Price per Gram', name: 'goldPricePerGram', type: 'number', placeholder: '6,000', unit: currency.symbol, tooltip: 'Current price of gold per gram' },
    { label: 'Expected Annual Return', name: 'expectedAnnualReturn', type: 'percentage', placeholder: '8', tooltip: 'Expected annual appreciation in gold prices' },
    { label: 'Investment Period', name: 'years', type: 'number', placeholder: '10', unit: 'years', tooltip: 'Number of years you plan to hold the gold' }
  ];

  const calculate = (inputs: GoldInputs) => {
    const validatedValues: GoldInputs = {
      investmentAmount: Math.abs(parseRobustNumber(inputs.investmentAmount)) || 1000,
      goldPricePerGram: Math.abs(parseRobustNumber(inputs.goldPricePerGram)) || 6000,
      years: Math.max(1, Math.abs(parseRobustNumber(inputs.years)) || 1),
      expectedAnnualReturn: parseRobustNumber(inputs.expectedAnnualReturn) || 8
    };

    const calculation = calculateGoldInvestment(validatedValues);

    const results: CalculatorResult[] = [
      { label: 'Future Value', value: calculation.futureValue, type: 'currency', highlight: true, tooltip: 'Expected value of your gold investment at maturity' },
      { label: 'Gold Quantity (grams)', value: calculation.gramsOfGold, type: 'number', tooltip: 'Grams of gold you can buy' },
      { label: 'Future Gold Price', value: calculation.futureGoldPrice, type: 'currency', tooltip: 'Expected gold price per gram at maturity' },
      { label: 'Total Returns', value: calculation.totalReturns, type: 'currency', tooltip: 'Profit from your gold investment' },
      { label: 'Annualized Return', value: calculation.annualizedReturn, type: 'percentage', tooltip: 'Effective annual return rate' }
    ];

    return { results };
  };

  const seoContent = (
      <SEOContent title="Gold Investment Tips"
      description="Calculate the future value and returns from your gold investments."
      sections={[
        { title: "Safe-Haven Asset", content: "Gold is often considered a safe-haven asset." },
        { title: "Diversification", content: "Diversify your portfolio with a small allocation to gold." },
        { title: "Digital Gold", content: "Consider digital gold or gold ETFs for convenience." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<GoldInputs>
      title="Gold Investment Return & Future Value Calculator"
      description="Calculate the future value and returns from your gold investments."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      seoContent={seoContent}
    />
  );
}
