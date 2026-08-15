"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { GoalProgressChart } from "@/components/molecules/goal-progress-chart";
import { parseRobustNumber } from "@/lib/utils/number";
import { calculateFutureValue, calculateSIPFutureValue } from "@/lib/calculations/financial-math";

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
  retirementGoal: 1000000,
};

export function RetirementCalculatorContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    { label: "Current Age", name: "currentAge", type: "number", placeholder: "30" },
    { label: "Retirement Age", name: "retirementAge", type: "number", placeholder: "65" },
    { label: "Current Savings", name: "currentSavings", type: "number", placeholder: "20,000", unit: currency.symbol },
    { label: "Monthly Contribution", name: "monthlyContribution", type: "number", placeholder: "500", unit: currency.symbol },
    { label: "Annual Return Rate", name: "annualReturnRate", type: "percentage", placeholder: "7", step: 0.1 },
    { label: "Retirement Goal", name: "retirementGoal", type: "number", placeholder: "1,000,000", unit: currency.symbol },
  ], [currency.symbol]);

  const calculate = (inputs: RetirementInputs) => {
    const currentAge = Math.max(Math.abs(parseRobustNumber(inputs.currentAge) || 25), 1);
    const retirementAge = Math.max(Math.abs(parseRobustNumber(inputs.retirementAge) || 65), currentAge + 1);
    const currentSavings = Math.abs(parseRobustNumber(inputs.currentSavings) || 0);
    const monthlyContribution = Math.abs(parseRobustNumber(inputs.monthlyContribution) || 0);
    const annualReturnRate = Math.abs(parseRobustNumber(inputs.annualReturnRate) || 0);
    const retirementGoal = Math.abs(parseRobustNumber(inputs.retirementGoal) || 0);

    const yearsToRetirement = retirementAge - currentAge;
    const n = yearsToRetirement * 12;

    const fvCurrentSavings = calculateFutureValue(currentSavings, annualReturnRate, n, 12);
    const fvMonthlyContributions = calculateSIPFutureValue(monthlyContribution, annualReturnRate, n);

    const projectedSavings = fvCurrentSavings + fvMonthlyContributions;

    const results: CalculatorResult[] = [
      { label: "Projected Savings at Retirement", value: projectedSavings, type: "currency", highlight: true },
      { label: "Years to Retirement", value: yearsToRetirement, type: "number" },
    ];

    const chartData = {
      projectedSavings,
      retirementGoal
    };

    return { results, chartData };
  };

  const charts = [
    {
      id: "goal-progress",
      render: (results: any, chartData: any) => {
        if (!chartData || chartData.retirementGoal <= 0) return null;
        return (
          <div className="mt-6 card p-6">
            <GoalProgressChart
              currentValue={chartData.projectedSavings}
              goalValue={chartData.retirementGoal}
              label="Retirement Savings Progress"
              unit={currency.symbol}
            />
          </div>
        );
      }
    }
  ];

  return (
    <BaseCalculatorTemplate<RetirementInputs>
      title="Retirement Calculator"
      description="Plan for your future with our retirement calculator. Estimate your savings and contributions."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      charts={charts}
    />
  );
}
