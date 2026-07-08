"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { EnhancedCalculatorField, EnhancedCalculatorForm, CalculatorResult } from "@/components/ui/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { CalculatorExplanatoryContent } from "@/components/calculators/calculator-explanatory-content";

interface LoanInputs {
  loanType: string;
  amount: number;
  rate: number;
  years: number;
}

const initialValues: LoanInputs = {
  loanType: 'personal',
  amount: 500000,
  rate: 12,
  years: 5,
};

const loanTypeConfig = {
  personal: { min: 10000, max: 5000000, rateRange: "8-30%", termRange: "1-7 years", icon: "👤", color: "from-blue-500 to-blue-600" },
  home: { min: 100000, max: 100000000, rateRange: "6-15%", termRange: "5-30 years", icon: "🏠", color: "from-green-500 to-green-600" },
  car: { min: 50000, max: 10000000, rateRange: "7-20%", termRange: "1-8 years", icon: "🚗", color: "from-purple-500 to-purple-600" },
  business: { min: 100000, max: 50000000, rateRange: "10-35%", termRange: "1-15 years", icon: "🏢", color: "from-orange-500 to-orange-600" },
  education: { min: 50000, max: 20000000, rateRange: "7-15%", termRange: "1-15 years", icon: "🎓", color: "from-indigo-500 to-indigo-600" },
};

function calculateLoan(values: LoanInputs) {
  const principal = Math.abs(values.amount || 0);
  const annualRate = Math.abs(values.rate || 0);
  const years = Math.abs(values.years || 1);

  if (principal === 0) {
    return {
      monthly: 0, totalPayment: 0, totalInterest: 0, interestPercentage: 0, effectiveRate: annualRate, monthlyPrincipal: 0, monthlyInterest: 0
    };
  }

  const rate = annualRate / 100 / 12;
  const months = years * 12;

  let monthly = 0;
  if (rate === 0) {
    monthly = principal / months;
  } else {
    monthly = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  }

  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;
  const interestPercentage = principal > 0 ? (totalInterest / principal) * 100 : 0;
  const effectiveRate = rate > 0 ? ((Math.pow(1 + rate, 12) - 1) * 100) : 0;
  const monthlyPrincipal = principal / months;
  const monthlyInterest = monthly - monthlyPrincipal;

  return {
    monthly: isFinite(monthly) ? monthly : 0,
    totalPayment: isFinite(totalPayment) ? totalPayment : 0,
    totalInterest: isFinite(totalInterest) ? totalInterest : 0,
    interestPercentage: isFinite(interestPercentage) ? interestPercentage : 0,
    effectiveRate: isFinite(effectiveRate) ? effectiveRate : 0,
    monthlyPrincipal: isFinite(monthlyPrincipal) ? monthlyPrincipal : 0,
    monthlyInterest: isFinite(monthlyInterest) ? monthlyInterest : 0
  };
}

export function LoanCalculator() {
  const [values, setValues] = useState<LoanInputs>(initialValues);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { addHistory } = useIndexedDBHistory();
  const { currency } = useCurrency();

  // Debounce ref — prevents writing to IndexedDB on every keystroke
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const currentConfig = useMemo(
    () => loanTypeConfig[values.loanType as keyof typeof loanTypeConfig],
    [values.loanType]
  );

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: "Loan Type",
      name: "loanType",
      type: "select",
      options: Object.entries(loanTypeConfig).map(([type, config]) => ({
        value: type,
        label: `${config.icon} ${type.charAt(0).toUpperCase() + type.slice(1)} Loan`,
      })),
      required: true
    },
    { label: 'Loan Amount', name: 'amount', type: 'number', placeholder: '5,00,000', unit: currency.symbol },
    { label: 'Interest Rate', name: 'rate', type: 'percentage', placeholder: '10', step: 0.1 },
    { label: 'Loan Term', name: 'years', type: 'number', placeholder: '20', unit: 'years' },
  ], [currency.symbol]);

  const loanResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      return calculateLoan(values);
    } catch (err) {
      setCalculationError(err instanceof Error ? err.message : "An error occurred during calculation.");
      return null;
    }
  }, [values]);

  const results: CalculatorResult[] = useMemo(() => {
    if (!loanResults || loanResults.monthly <= 0) return [];
    return [
      { label: "Monthly EMI", value: loanResults.monthly, type: "currency", highlight: true },
      { label: "Total Payment", value: loanResults.totalPayment, type: "currency" },
      { label: "Total Interest", value: loanResults.totalInterest, type: "currency" },
      { label: "Interest Burden", value: loanResults.interestPercentage, type: "percentage" },
    ];
  }, [loanResults]);

  // Save to history on explicit "Calculate" click, debounced to prevent rapid writes
  const handleCalculate = useCallback(() => {
    if (!loanResults || loanResults.monthly <= 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      addHistory({
        id: uuidv4(),
        type: "loan",
        inputs: values,
        results: results.map(r => ({ label: r.label, value: r.value, type: r.type })),
        timestamp: new Date(),
        title: `${values.loanType} Loan Calculator`,
        notes: "",
      });
    }, 300);
  }, [loanResults, values, results, addHistory]);

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Loan Information</h3>
        {currentConfig && (
          <div className="space-y-3 text-sm text-neutral-700">
            <p><strong>Type:</strong> {values.loanType} Loan</p>
            <p><strong>Rate:</strong> {currentConfig.rateRange}</p>
            <p><strong>Term:</strong> {currentConfig.termRange}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Loan Calculator"
      description="Calculate EMI and total interest for different types of loans."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Loan Details"
        description="Enter the details of your loan."
        fields={fields}
        values={values}
        onChange={handleInputChange}
        onCalculate={handleCalculate}
        results={results}
        error={calculationError}
      />

      <CalculatorExplanatoryContent
        title="Loan & EMI Planning"
        description={
          <>
            A loan can be a powerful financial tool for achieving major life goals like buying a home, pursuing education, or expanding a business. However, understanding the <strong>true cost of borrowing</strong>—including interest rates, processing fees, and the impact of tenure—is crucial for maintaining long-term financial health.
          </>
        }
        sections={[
          {
            title: "Understanding Reducing Balance",
            content: "Most modern loans use the reducing balance method. This means interest is calculated on the remaining principal each month. As you pay off your principal, the interest component of your EMI decreases, and the principal component increases."
          },
          {
            title: "Short vs. Long Tenure",
            content: "While a 20-year tenure makes your EMI smaller and easier to manage, you could end up paying more in interest than the actual loan amount. Always aim for the shortest tenure you can comfortably afford to minimize interest outgo."
          },
          {
            title: "The Power of Prepayments",
            content: "Even a small extra payment each year can drastically reduce your loan tenure and total interest. Check if your lender allows penalty-free prepayments, especially for home and personal loans."
          },
          {
            title: "Credit Score Matters",
            content: "In India, having a CIBIL score above 750 can help you negotiate lower interest rates, saving you lakhs over a long-term loan like a home mortgage."
          }
        ]}
        faqs={[
          {
            question: "What is a processing fee?",
            answer: "A processing fee is a one-time charge by the lender to cover the administrative costs of processing your loan application. It usually ranges from 0.5% to 2% of the loan amount."
          },
          {
            question: "Can I transfer my loan to another bank?",
            answer: "Yes, this is known as a Balance Transfer. If another lender offers a significantly lower interest rate, you can move your outstanding principal to them, though you should account for new processing fees."
          },
          {
            question: "What happens if I miss an EMI?",
            answer: "Missing an EMI can lead to late payment penalties, increased interest burden, and a significant drop in your credit score, making it harder to get loans in the future."
          }
        ]}
        relatedTools={[
          { name: "Mortgage Calculator", href: "/calculators/mortgage" },
          { name: "Home Loan Calculator", href: "/calculators/home-loan" },
          { name: "Personal Loan Calculator", href: "/calculators/personal-loan" }
        ]}
      />
    </CalculatorLayout>
  );
}
