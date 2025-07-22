"use client";
import React, { useState, useMemo, useCallback } from "react";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from "@/components/ui/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { GoalProgressChart } from "@/components/ui/goal-progress-chart";

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
  retirementGoal: 0, // Will be dynamically set or user-defined
};

function calculateRetirement(inputs: RetirementInputs) {
  const { currentAge, retirementAge, currentSavings, monthlyContribution, annualReturnRate } = inputs;

  if (currentAge <= 0 || retirementAge <= currentAge || currentSavings < 0 || monthlyContribution < 0 || annualReturnRate < 0) {
    throw new Error("Invalid input values.");
  }

  const yearsToRetirement = retirementAge - currentAge;
  const n = yearsToRetirement * 12; // Total months
  const r = annualReturnRate / 100 / 12; // Monthly rate

  // Future value of current savings
  const fvCurrentSavings = currentSavings * Math.pow(1 + r, n);

  // Future value of monthly contributions (annuity)
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

export default function RetirementCalculatorPage() {
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

  // Set initial goal to calculated projected savings if not set by user
  // This useEffect is intentionally kept here as it modifies state based on calculation results
  // and is specific to the retirement calculator's goal setting.
  React.useEffect(() => {
    if (retirementResults && values.retirementGoal === 0) {
      setValues(prev => ({ ...prev, retirementGoal: retirementResults.projectedSavings }));
    }
  }, [retirementResults, values.retirementGoal]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: "Current Age",
      name: "currentAge",
      type: "number",
      placeholder: "30",
      min: 18,
      max: 90,
      required: true,
      tooltip: "Your current age."
    },
    {
      label: "Retirement Age",
      name: "retirementAge",
      type: "number",
      placeholder: "65",
      min: values.currentAge + 1,
      max: 100,
      required: true,
      tooltip: "The age at which you plan to retire."
    },
    {
      label: "Current Savings",
      name: "currentSavings",
      type: "number",
      placeholder: "20,000",
      unit: currency.symbol,
      min: 0,
      required: true,
      tooltip: "Your total current retirement savings."
    },
    {
      label: "Monthly Contribution",
      name: "monthlyContribution",
      type: "number",
      placeholder: "500",
      unit: currency.symbol,
      min: 0,
      required: true,
      tooltip: "Amount you plan to save monthly towards retirement."
    },
    {
      label: "Annual Return Rate",
      name: "annualReturnRate",
      type: "percentage",
      placeholder: "7",
      min: 0,
      max: 20,
      step: 0.1,
      required: true,
      tooltip: "Expected annual return on your retirement investments."
    },
    {
      label: "Retirement Goal",
      name: "retirementGoal",
      type: "number",
      placeholder: "1,000,000",
      unit: currency.symbol,
      min: 0,
      tooltip: "Your target savings amount for retirement."
    },
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!retirementResults) return [];

    return [
      {
        label: "Projected Savings at Retirement",
        value: retirementResults.projectedSavings,
        type: "currency",
        highlight: true,
        tooltip: "Estimated total savings you will have by your retirement age.",
      },
      {
        label: "Years to Retirement",
        value: retirementResults.yearsToRetirement,
        type: "number",
        tooltip: "Number of years remaining until your planned retirement age.",
      },
    ];
  }, [retirementResults, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 600);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Retirement Planning Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Start saving early to maximize compound growth.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Regularly review and adjust your retirement plan.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider inflation and healthcare costs in retirement.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Retirement Calculator"
      description="Plan for your future with our retirement calculator. Estimate your savings, contributions, and see if you're on track to meet your retirement goals."
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
        showComparison={false}
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
      )
      }
    </CalculatorLayout>
  );
}