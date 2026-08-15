"use client";

import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { GoalProgressChart } from "@/components/molecules/goal-progress-chart";
import {
  parseRobustNumber,
  safeDivide,
  safeMultiply,
  safePower,
  isEffectivelyZero
} from "@/lib/utils/number";

const initialValues = {
  savingsGoal: 1000000,
  currentSavings: 50000,
  monthlyContribution: 10000,
  interestRate: 8,
  timeHorizon: 10,
  savingsType: 'goal-based',
  inflationRate: 6,
  taxRate: 10
};

interface SavingsInputs {
  savingsGoal: number;
  currentSavings: number;
  monthlyContribution: number;
  interestRate: number;
  timeHorizon: number;
  savingsType: string;
  inflationRate: number;
  taxRate: number;
}

export default function SavingsCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Savings Type', name: 'savingsType', type: 'select', options: [{ value: 'goal-based', label: 'Goal-Based Savings' }, { value: 'growth', label: 'Wealth Accumulation' }, { value: 'emergency', label: 'Emergency Fund' }] },
    { label: 'Savings Goal', name: 'savingsGoal', type: 'number', placeholder: '1,00,000', unit: currency.symbol },
    { label: 'Current Savings', name: 'currentSavings', type: 'number', placeholder: '50,000', unit: currency.symbol },
    { label: 'Monthly Contribution', name: 'monthlyContribution', type: 'number', placeholder: '10,000', unit: currency.symbol },
    { label: 'Expected Annual Return', name: 'interestRate', type: 'percentage', placeholder: '8', step: 0.1 },
    { label: 'Time Horizon', name: 'timeHorizon', type: 'number', placeholder: '10', unit: 'years' },
    { label: 'Expected Inflation Rate', name: 'inflationRate', type: 'percentage', placeholder: '6', step: 0.1 },
    { label: 'Tax Rate on Returns', name: 'taxRate', type: 'percentage', placeholder: '10', step: 0.1 }
  ];

  const calculate = (inputs: SavingsInputs) => {
    const savingsGoal = parseRobustNumber(inputs.savingsGoal);
    const currentSavings = parseRobustNumber(inputs.currentSavings);
    const monthlyContribution = parseRobustNumber(inputs.monthlyContribution);
    const interestRate = parseRobustNumber(inputs.interestRate);
    const timeHorizon = parseRobustNumber(inputs.timeHorizon);
    const savingsType = inputs.savingsType || 'goal-based';
    const inflationRate = parseRobustNumber(inputs.inflationRate);
    const taxRate = parseRobustNumber(inputs.taxRate);

    const monthlyRate = safeDivide(safeDivide(interestRate, 12), 100);
    const months = safeMultiply(Math.max(1, timeHorizon), 12);
    
    const futureValueOfCurrentSavings = safeMultiply(currentSavings, safePower(1 + monthlyRate, months));
    
    let futureValueOfContributions = 0;
    if (!isEffectivelyZero(monthlyRate)) {
      futureValueOfContributions = safeMultiply(monthlyContribution, safeDivide(safePower(1 + monthlyRate, months) - 1, monthlyRate));
    } else {
      futureValueOfContributions = safeMultiply(monthlyContribution, months);
    }
    
    const totalFutureValue = futureValueOfCurrentSavings + futureValueOfContributions;
    const totalContributions = currentSavings + safeMultiply(monthlyContribution, months);
    const totalInterestEarned = Math.max(0, totalFutureValue - totalContributions);
    
    const taxOnInterest = safeMultiply(totalInterestEarned, safeDivide(taxRate, 100));
    const afterTaxValue = Math.max(0, totalFutureValue - taxOnInterest);
    
    const inflationFactor = safePower(1 + safeDivide(inflationRate, 100), Math.max(1, timeHorizon));
    const inflationAdjustedValue = safeDivide(totalFutureValue, Math.max(1, inflationFactor));
    
    const nominalFactor = 1 + safeDivide(interestRate, 100);
    const inflationYearlyFactor = 1 + safeDivide(inflationRate, 100);
    const realReturnRate = safeMultiply(safeDivide(nominalFactor, Math.max(0.01, inflationYearlyFactor)) - 1, 100);
    
    let monthlyRequiredForGoal = 0;
    let shortfall = 0;
    let surplus = 0;
    let goalAchievementTime = 0;
    
    if (savingsType === 'goal-based') {
      shortfall = Math.max(0, savingsGoal - totalFutureValue);
      surplus = Math.max(0, totalFutureValue - savingsGoal);
      
      const goalMinusCurrentFV = Math.max(0, savingsGoal - futureValueOfCurrentSavings);
      if (goalMinusCurrentFV > 0 && !isEffectivelyZero(monthlyRate)) {
        const annuityFactor = safeDivide(safePower(1 + monthlyRate, months) - 1, monthlyRate);
        monthlyRequiredForGoal = safeDivide(goalMinusCurrentFV, Math.max(0.001, annuityFactor));
      } else if (goalMinusCurrentFV > 0) {
        monthlyRequiredForGoal = safeDivide(goalMinusCurrentFV, Math.max(1, months));
      }
      
      if (monthlyContribution > 0) {
        let tempMonths = 0;
        let tempValue = currentSavings;
        while (tempValue < savingsGoal && tempMonths < 600) {
          tempValue = tempValue * (1 + monthlyRate) + monthlyContribution;
          tempMonths++;
        }
        goalAchievementTime = tempMonths / 12;
      }
    }
    
    const effectiveAnnualReturn = safeMultiply(
      Math.max(-100, Math.pow(safeDivide(totalFutureValue, Math.max(1, totalContributions)), 
      safeDivide(1, Math.max(1, timeHorizon))) - 1), 100);

    const results: CalculatorResult[] = [
      { label: 'Future Value', value: totalFutureValue, type: 'currency', highlight: true },
      { label: 'Total Contributions', value: totalContributions, type: 'currency' },
      { label: 'Interest Earned', value: totalInterestEarned, type: 'currency' },
      { label: 'After-Tax Value', value: afterTaxValue, type: 'currency' },
      { label: 'Inflation-Adjusted Value', value: inflationAdjustedValue, type: 'currency' },
      { label: 'Real Return Rate', value: realReturnRate, type: 'percentage' }
    ];

    if (savingsType === 'goal-based') {
      if (surplus > 0) {
        results.push({ label: 'Goal Surplus', value: surplus, type: 'currency' });
      } else if (shortfall > 0) {
        results.push({ label: 'Goal Shortfall', value: shortfall, type: 'currency' });
        results.push({ label: 'Required Monthly Contribution', value: monthlyRequiredForGoal, type: 'currency' });
      }

      if (goalAchievementTime > 0 && goalAchievementTime < 50) {
        results.push({ label: 'Goal Achievement Time', value: goalAchievementTime, type: 'number' });
      }
    }

    results.push({ label: 'Effective Annual Return', value: effectiveAnnualReturn, type: 'percentage' });

    const chartData = savingsType === 'goal-based' ? {
      totalFutureValue,
      savingsGoal
    } : null;

    return { results, chartData };
  };

  const charts = [
    {
      id: "savings-goal",
      render: (results: any, chartData: any) => {
        if (!chartData) return null;
        return (
          <div className="card mt-6">
            <GoalProgressChart
              currentValue={chartData.totalFutureValue}
              goalValue={chartData.savingsGoal}
              label="Progress to Goal"
              unit={currency.symbol}
            />
          </div>
        );
      }
    }
  ];

  return (
    <BaseCalculatorTemplate<SavingsInputs>
      title="Savings Calculator"
      description="Plan your savings strategy with goal-based calculations. See how your money will grow over time and plan for inflation and taxes."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      charts={charts}
    />
  );
}
