"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { useMemo, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { calculateEMI } from "@/lib/calculations/financial-math";
import { breadcrumbStructuredData, faqStructuredData, calculatorStructuredData } from "@/lib/seo/structured-data";

type LoanInputs = {
  loanType: string;
  amount: number;
  rate: number;
  years: number;
}

const initialValues: LoanInputs = {
  loanType: "Personal",
  amount: 500000,
  rate: 10.5,
  years: 5
};

export default function LoanCalculatorPage() {
  const { currency } = useCurrency();
  const { addHistory } = useIndexedDBHistory();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fields = useMemo<EnhancedCalculatorField[]>(() => [
    {
      label: 'Loan Type',
      name: 'loanType',
      type: 'select',
      options: [
        { label: 'Personal Loan', value: 'Personal' },
        { label: 'Home Loan', value: 'Home' },
        { label: 'Car Loan', value: 'Car' },
        { label: 'Business Loan', value: 'Business' }
      ],
      required: true
    },
    { label: 'Loan Amount', name: 'amount', type: 'number', placeholder: '5,00,000', unit: currency.symbol },
    { label: 'Interest Rate', name: 'rate', type: 'percentage', placeholder: '10.5', step: 0.1 },
    { label: 'Loan Term', name: 'years', type: 'number', placeholder: '5', unit: 'years' },
  ], [currency.symbol]);

  const calculate = (values: LoanInputs) => {
    const principal = Math.abs(values.amount || 0);
    const annualRate = Math.abs(values.rate || 0);
    const years = Math.max(1, Math.abs(values.years || 1));

    if (principal === 0) {
      return { results: [] };
    }

    const months = years * 12;
    const monthly = calculateEMI(principal, annualRate, months);
    const totalPayment = monthly * months;
    const totalInterest = totalPayment - principal;
    const interestPercentage = principal > 0 ? (totalInterest / principal) * 100 : 0;

    const results: CalculatorResult[] = [
      { label: "Monthly EMI", value: isFinite(monthly) ? monthly : 0, type: "currency", highlight: true },
      { label: "Total Payment", value: isFinite(totalPayment) ? totalPayment : 0, type: "currency" },
      { label: "Total Interest", value: isFinite(totalInterest) ? totalInterest : 0, type: "currency" },
      { label: "Interest Burden", value: isFinite(interestPercentage) ? interestPercentage : 0, type: "percentage" },
    ];

    return { results };
  };

  const handleCalculate = useCallback((values: LoanInputs, results: CalculatorResult[]) => {
    if (results.length === 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      addHistory({
        id: uuidv4(),
        type: "loan",
        inputs: values,
        results: results.reduce((acc, curr) => ({ ...acc, [curr.label]: curr.value }), {}),
        timestamp: new Date(),
        title: `${values.loanType} Loan Calculator`,
        notes: "",
      });
    }, 300);
  }, [addHistory]);

  const seoContent = (
    <SEOContent 
      title="Loan & EMI Planning"
      description={<>A loan can be a powerful financial tool for achieving major life goals. Understanding the <strong>true cost of borrowing</strong> is crucial for maintaining long-term financial health.</>}
      sections={[
        { title: "Understanding Reducing Balance", content: "Most modern loans use the reducing balance method. This means interest is calculated on the remaining principal each month." },
        { title: "Short vs. Long Tenure", content: "While a 20-year tenure makes your EMI smaller and easier to manage, you could end up paying more in interest than the actual loan amount." },
        { title: "The Power of Prepayments", content: "Even a small extra payment each year can drastically reduce your loan tenure and total interest." },
        { title: "Credit Score Matters", content: "In India, having a CIBIL score above 750 can help you negotiate lower interest rates." }
      ]}
      faqs={[
        { question: "What is a processing fee?", answer: "A processing fee is a one-time charge by the lender to cover the administrative costs." },
        { question: "Can I transfer my loan to another bank?", answer: "Yes, this is known as a Balance Transfer." },
        { question: "What happens if I miss an EMI?", answer: "Missing an EMI can lead to late payment penalties and a drop in your credit score." }
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", href: "/calculators/mortgage" },
        { name: "Personal Loan Calculator", href: "/calculators/personal-loan" }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<LoanInputs>
      title="Simple EMI & Loan Repayment Calculator"
      description="Calculate EMI, total interest, and payment schedule for personal, home, car, and business loans."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      onCalculate={handleCalculate}
      seoContent={seoContent}
    />
  );
}
