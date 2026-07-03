"use client";
import React, { useState, useMemo, useCallback } from "react";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from "@/components/ui/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { GoalProgressChart } from "@/components/ui/goal-progress-chart";
import { CalculatorExplanatoryContent } from "@/components/calculators/calculator-explanatory-content";

interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturnRate: number;
  retirementGoal: number;
}

const initialValues: RetirementInputs = {
  currentAge: 30,
  retirementAge: 65,
  currentSavings: 20000,
  monthlyContribution: 500,
  annualReturnRate: 7,
  retirementGoal: 0,
};

function calculateRetirement(inputs: RetirementInputs) {
  const currentAge = Math.max(Math.abs(inputs.currentAge || 25), 1);
  const retirementAge = Math.max(Math.abs(inputs.retirementAge || 65), currentAge + 1);
  const currentSavings = Math.abs(inputs.currentSavings || 0);
  const monthlyContribution = Math.abs(inputs.monthlyContribution || 0);
  const annualReturnRate = Math.abs(inputs.annualReturnRate || 0);

  const yearsToRetirement = retirementAge - currentAge;
  const n = yearsToRetirement * 12;
  const r = annualReturnRate / 100 / 12;

  const fvCurrentSavings = currentSavings * Math.pow(1 + r, n);

  let fvMonthlyContributions = 0;
  if (r === 0) {
    fvMonthlyContributions = monthlyContribution * n;
  } else {
    fvMonthlyContributions = (monthlyContribution * (Math.pow(1 + r, n) - 1)) / r;
  }

  const projectedSavings = fvCurrentSavings + fvMonthlyContributions;

  return {
    projectedSavings,
    yearsToRetirement,
  };
}

export function RetirementCalculator() {
  const [values, setValues] = useState<RetirementInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const retirementResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      return calculateRetirement(values);
    } catch (err: any) {
      console.error("Retirement calculation error:", err);
      setCalculationError(err.message || "An error occurred during calculation.");
      return null;
    }
  }, [values]);

  React.useEffect(() => {
    if (retirementResults && values.retirementGoal === 0) {
      setValues(prev => ({ ...prev, retirementGoal: retirementResults.projectedSavings }));
    }
  }, [retirementResults, values.retirementGoal]);

  const fields: EnhancedCalculatorField[] = [
    { label: "Current Age", name: "currentAge", type: "number", placeholder: "30" },
    { label: "Retirement Age", name: "retirementAge", type: "number", placeholder: "65" },
    { label: "Current Savings", name: "currentSavings", type: "number", placeholder: "20,000", unit: currency.symbol },
    { label: "Monthly Contribution", name: "monthlyContribution", type: "number", placeholder: "500", unit: currency.symbol },
    { label: "Annual Return Rate", name: "annualReturnRate", type: "percentage", placeholder: "7", step: 0.1 },
    { label: "Retirement Goal", name: "retirementGoal", type: "number", placeholder: "1,000,000", unit: currency.symbol },
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!retirementResults) return [];
    return [
      { label: "Projected Savings at Retirement", value: retirementResults.projectedSavings, type: "currency", highlight: true },
      { label: "Years to Retirement", value: retirementResults.yearsToRetirement, type: "number" },
    ];
  }, [retirementResults]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Retirement Planning Tips</h3>
        <div className="space-y-2 text-sm text-neutral-600">
          <p>✓ Start saving early to maximize compound growth.</p>
          <p>✓ Regularly review and adjust your retirement plan.</p>
          <p>✓ Consider inflation and healthcare costs.</p>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Retirement Calculator"
      description="Plan for your future with our retirement calculator. Estimate your savings and contributions."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Retirement Details"
        description="Enter your retirement planning details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={retirementResults ? results : []}
        loading={loading}
        error={calculationError}
      />
      {retirementResults && values.retirementGoal > 0 && (
        <div className="mt-6 card p-6">
          <GoalProgressChart 
            currentValue={retirementResults.projectedSavings} 
            goalValue={values.retirementGoal} 
            label="Retirement Savings Progress" 
            unit={currency.symbol} 
          />
        </div>
      )}

      <CalculatorExplanatoryContent
        title="Retirement Planning"
        description={
          <>
            Retirement planning is the process of determining your financial goals for life after you stop working and creating a plan to meet those goals. In India, where traditional social security is limited, <strong>early and systematic planning</strong> is essential to ensure a comfortable and independent lifestyle in your golden years.
          </>
        }
        sections={[
          {
            title: "Why Start Planning Now?",
            content: "The power of compounding is your greatest ally. Starting even 5 years early can result in a significantly larger corpus with the same monthly contribution. It also allows you to take more calculated risks with equity investments for higher long-term growth."
          },
          {
            title: "The Impact of Inflation",
            content: "At an average inflation rate of 6%, the cost of living doubles every 12 years. This means ₹1 lakh today will feel like ₹25,000 in 24 years. Our calculator helps you visualize if your projected savings will be enough to beat inflation."
          },
          {
            title: "Diversification Strategy",
            content: "A robust retirement portfolio in India typically includes a mix of EPF/PPF for safety, Mutual Funds (SIP) for growth, and potentially NPS for tax-efficient retirement income."
          },
          {
            title: "How to Use This Tool",
            content: "Input your current age, planned retirement age, and current savings. Adjust the monthly contribution and expected return rate to see how your future corpus changes. Use the 'Retirement Goal' field to track your progress."
          }
        ]}
        faqs={[
          {
            question: "Is the EPF enough for my retirement?",
            answer: "For most salaried professionals, EPF is a great foundation but often not enough to maintain their current lifestyle post-retirement due to inflation and rising healthcare costs. Supplemental investments in equity mutual funds or NPS are usually necessary."
          },
          {
            question: "What return rate should I assume?",
            answer: "A conservative estimate for a balanced retirement portfolio in India is between 8% to 12% annually, depending on your asset allocation between equity and debt."
          },
          {
            question: "Can I use this for the FIRE movement?",
            answer: "Yes! Simply adjust your retirement age to your target FIRE age (e.g., 40 or 45) and see if your projected savings can support your withdrawal needs."
          }
        ]}
        relatedTools={[
          { name: "Investment Calculator", href: "/calculators/investment" },
          { name: "SIP Calculator", href: "/calculators/sip" },
          { name: "EPF Calculator", href: "/calculators/epf" }
        ]}
      />
    </CalculatorLayout>
  );
}

