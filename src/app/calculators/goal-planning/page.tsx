"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { useMemo, useCallback } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";

interface GoalInputs {
  targetAmount: number;
  timeHorizon: number;
  priority: string;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  inflationRate: number;
}

const initialValues: GoalInputs = {
  targetAmount: 600000,
  timeHorizon: 2,
  priority: 'high',
  currentSavings: 50000,
  monthlyContribution: 15000,
  expectedReturn: 6,
  inflationRate: 6
};

export default function GoalPlanningCalculatorPage() {
  const { currency } = useCurrency();

  const fields = useMemo<EnhancedCalculatorField[]>(() => [
    { label: 'Target Amount', name: 'targetAmount', type: 'number', placeholder: '6,00,000', unit: currency.symbol, tooltip: 'Amount you want to achieve' },
    { label: 'Time Horizon', name: 'timeHorizon', type: 'number', placeholder: '2', step: 0.5, unit: 'years', tooltip: 'Time available to achieve this goal' },
    { label: 'Priority', name: 'priority', type: 'select', options: [{ value: 'high', label: 'High Priority' }, { value: 'medium', label: 'Medium Priority' }, { value: 'low', label: 'Low Priority' }], tooltip: 'Priority level of this goal' },
    { label: 'Current Savings', name: 'currentSavings', type: 'number', placeholder: '50,000', unit: currency.symbol, tooltip: 'Amount already saved' },
    { label: 'Monthly Contribution', name: 'monthlyContribution', type: 'number', placeholder: '15,000', unit: currency.symbol, tooltip: 'Amount you can invest monthly' },
    { label: 'Expected Annual Return', name: 'expectedReturn', type: 'percentage', placeholder: '6', step: 0.5, tooltip: 'Expected annual return' },
    { label: 'Inflation Rate', name: 'inflationRate', type: 'percentage', placeholder: '6', step: 0.5, tooltip: 'Expected inflation rate' }
  ], [currency.symbol]);

  const calculate = (inputs: GoalInputs) => {
    const targetAmount = Math.abs(parseRobustNumber(inputs.targetAmount)) || 100000;
    const timeHorizon = Math.max(0.5, Math.abs(parseRobustNumber(inputs.timeHorizon)) || 1);
    const currentSavings = Math.abs(parseRobustNumber(inputs.currentSavings)) || 0;
    const monthlyContribution = Math.abs(parseRobustNumber(inputs.monthlyContribution)) || 0;
    const expectedReturn = Math.abs(parseRobustNumber(inputs.expectedReturn)) || 6;
    const adjustedInflationRate = Math.max(0, Math.abs(parseRobustNumber(inputs.inflationRate)) || 6);

    const months = timeHorizon * 12;
    const monthlyReturn = expectedReturn / 12 / 100;
    const inflationAdjustedTarget = targetAmount * Math.pow(1 + adjustedInflationRate / 100, timeHorizon);

    const futureValueOfSavings = currentSavings * Math.pow(1 + monthlyReturn, months);
    const futureValueOfContributions = monthlyReturn > 0
      ? monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn)
      : monthlyContribution * months;

    const projectedAmount = futureValueOfSavings + futureValueOfContributions;
    
    // Formula for required PMT
    const shortfall = Math.max(0, inflationAdjustedTarget - futureValueOfSavings);
    const requiredMonthlyInvestment = monthlyReturn > 0
      ? (shortfall * monthlyReturn) / ((Math.pow(1 + monthlyReturn, months) - 1) * (1 + monthlyReturn))
      : shortfall / months;

    const actualShortfall = Math.max(0, inflationAdjustedTarget - projectedAmount);

    const results: CalculatorResult[] = [
      { label: 'Projected Amount', value: projectedAmount, type: 'currency', highlight: true },
      { label: 'Inflation Adj. Target', value: inflationAdjustedTarget, type: 'currency' },
      { label: 'Required Monthly SIP', value: requiredMonthlyInvestment, type: 'currency' },
      { label: 'Target Shortfall', value: actualShortfall, type: 'currency' }
    ];

    return { results };
  };

  const seoContent = (
    <SEOContent 
      title="Goal Planning Tips"
      description="Plan and track your financial goals with inflation adjustment and feasibility scores."
      sections={[
        { title: "SMART Goals", content: "Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)." },
        { title: "Prioritize", content: "Prioritize goals based on urgency and importance." },
        { title: "Inflation Impact", content: "Always account for inflation when setting target amounts." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<GoalInputs>
      title="Goal Planning Calculator"
      description="Plan and track your financial goals with inflation adjustment."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      seoContent={seoContent}
    />
  );
}
