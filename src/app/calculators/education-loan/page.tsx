"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculateEMI } from "@/lib/calculations/financial-math";
import { parseRobustNumber } from "@/lib/utils/number";

interface EducationLoanInputs {
  principal: number;
  rate: number;
  years: number;
  extraPayment: number;
}

const initialValues: EducationLoanInputs = {
  principal: 1500000,
  rate: 8.5,
  years: 10,
  extraPayment: 0,
};

export default function EducationLoanCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: "Education Loan Amount", name: "principal", type: "number", placeholder: "15,00,000", unit: currency.symbol, tooltip: "Total loan amount for educational expenses" },
    { label: "Interest Rate", name: "rate", type: "percentage", placeholder: "8.5", step: 0.1, tooltip: "Annual interest rate (typically 7-12% for education loans in India)" },
    { label: "Repayment Period", name: "years", type: "number", placeholder: "10", unit: "years", tooltip: "Duration to repay the education loan (typically 5-15 years)" },
    { label: "Extra Monthly Payment", name: "extraPayment", type: "number", placeholder: "0", unit: currency.symbol, tooltip: "Additional payment to reduce loan burden faster" },
  ];

  const calculate = (values: EducationLoanInputs) => {
    const principal = Math.abs(parseRobustNumber(values.principal)) || 50000;
    const rate = Math.abs(parseRobustNumber(values.rate)) || 8.5;
    const years = Math.max(1, Math.abs(parseRobustNumber(values.years)) || 10);
    const extraPayment = Math.abs(parseRobustNumber(values.extraPayment)) || 0;

    const months = years * 12;
    const monthlyPayment = calculateEMI(principal, rate, months);
    
    // Simplification for performance: calculating total base interest without complex amortization array
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    const annualInterest = totalInterest / years;
    const taxBracket = 0.30;
    const annualTaxSaving = Math.min(annualInterest, 50000) * taxBracket;
    const totalTaxSaving = annualTaxSaving * years;

    const educationROI = principal * 0.15;
    const totalCareerBenefit = educationROI * 20;

    const results: CalculatorResult[] = [
      { label: "Monthly EMI", value: isFinite(monthlyPayment) ? monthlyPayment : 0, type: "currency", highlight: true, tooltip: "Monthly installment for your education loan" },
      { label: "Total Payment", value: isFinite(totalPayment) ? totalPayment : 0, type: "currency", tooltip: "Total amount to be paid over loan tenure" },
      { label: "Total Interest", value: isFinite(totalInterest) ? totalInterest : 0, type: "currency", tooltip: "Total interest paid on the education loan" },
      { label: "Interest as % of Loan", value: principal > 0 ? (totalInterest / principal) * 100 : 0, type: "percentage", tooltip: "Interest as percentage of loan amount" },
      { label: "Estimated Tax Savings", value: totalTaxSaving, type: "currency", tooltip: "Tax benefits on education loan interest (Section 80E)" },
      { label: "Net Cost After Tax Benefits", value: totalPayment - totalTaxSaving, type: "currency", tooltip: "Effective cost after considering tax benefits" },
      { label: "Estimated Career ROI", value: totalCareerBenefit, type: "currency", tooltip: "Estimated additional earnings over 20 years due to education" },
    ];

    return { results };
  };

  const seoContent = (
      <SEOContent title="Education Loan Tips"
      description="Calculate education loan EMI with tax benefits and career ROI analysis. Plan your educational investment wisely."
      sections={[
        { title: "Compare Rates", content: "Compare interest rates from different lenders." },
        { title: "Understand Terms", content: "Understand the moratorium period and repayment terms." },
        { title: "Tax Benefits", content: "Explore tax benefits under Section 80E." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<EducationLoanInputs>
      title="Student Education Loan EMI Calculator"
      description="Calculate education loan EMI with tax benefits and career ROI analysis. Plan your educational investment wisely."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      seoContent={seoContent}
    />
  );
}
