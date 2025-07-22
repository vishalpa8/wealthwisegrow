"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import {
  parseRobustNumber,
  safeDivide,
  safeMultiply,
  safePower,
  isEffectivelyZero
} from '@/lib/utils/number';

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

function calculateSavings(inputs: SavingsInputs) {
  // Parse all inputs robustly to handle all edge cases
  const savingsGoal = parseRobustNumber(inputs.savingsGoal);
  const currentSavings = parseRobustNumber(inputs.currentSavings);
  const monthlyContribution = parseRobustNumber(inputs.monthlyContribution);
  const interestRate = parseRobustNumber(inputs.interestRate);
  const timeHorizon = parseRobustNumber(inputs.timeHorizon);
  const savingsType = inputs.savingsType || 'goal-based';
  const inflationRate = parseRobustNumber(inputs.inflationRate);
  const taxRate = parseRobustNumber(inputs.taxRate);

  // Use safe operations for calculations
  const monthlyRate = safeDivide(safeDivide(interestRate, 12), 100);
  const months = safeMultiply(Math.max(1, timeHorizon), 12); // Ensure at least 1 month
  
  // Future value of current savings with safe operations
  const futureValueOfCurrentSavings = safeMultiply(currentSavings, safePower(1 + monthlyRate, months));
  
  // Future value of monthly contributions (annuity) with safe operations
  let futureValueOfContributions = 0;
  if (!isEffectivelyZero(monthlyRate)) {
    // Standard compound interest formula
    futureValueOfContributions = safeMultiply(monthlyContribution, 
      safeDivide(safePower(1 + monthlyRate, months) - 1, monthlyRate));
  } else {
    // For zero interest rate, just multiply the monthly contribution by months
    futureValueOfContributions = safeMultiply(monthlyContribution, months);
  }
  
  const totalFutureValue = futureValueOfCurrentSavings + futureValueOfContributions;
  const totalContributions = currentSavings + safeMultiply(monthlyContribution, months);
  const totalInterestEarned = Math.max(0, totalFutureValue - totalContributions); // Ensure non-negative interest
  
  // Tax calculations with safe operations
  const taxOnInterest = safeMultiply(totalInterestEarned, safeDivide(taxRate, 100));
  const afterTaxValue = Math.max(0, totalFutureValue - taxOnInterest);
  
  // Inflation-adjusted values with safe operations
  const inflationFactor = safePower(1 + safeDivide(inflationRate, 100), Math.max(1, timeHorizon));
  const inflationAdjustedValue = safeDivide(totalFutureValue, Math.max(1, inflationFactor));
  
  // Real return rate calculation with safe operations
  const nominalFactor = 1 + safeDivide(interestRate, 100);
  const inflationYearlyFactor = 1 + safeDivide(inflationRate, 100);
  const realReturnRate = safeMultiply(safeDivide(nominalFactor, Math.max(0.01, inflationYearlyFactor)) - 1, 100);
  
  // Goal-based calculations
  let monthlyRequiredForGoal = 0;
  let shortfall = 0;
  let surplus = 0;
  let goalAchievementTime = 0;
  
  if (savingsType === 'goal-based') {
    shortfall = Math.max(0, savingsGoal - totalFutureValue);
    surplus = Math.max(0, totalFutureValue - savingsGoal);
    
    // Calculate required monthly contribution to reach goal with safe operations
    const goalMinusCurrentFV = Math.max(0, savingsGoal - futureValueOfCurrentSavings);
    if (goalMinusCurrentFV > 0 && !isEffectivelyZero(monthlyRate)) {
      const annuityFactor = safeDivide(safePower(1 + monthlyRate, months) - 1, monthlyRate);
      monthlyRequiredForGoal = safeDivide(goalMinusCurrentFV, Math.max(0.001, annuityFactor));
    } else if (goalMinusCurrentFV > 0) {
      // For zero interest rate, simple division by months
      monthlyRequiredForGoal = safeDivide(goalMinusCurrentFV, Math.max(1, months));
    }
    
    // Calculate time to reach goal with current contributions
    if (monthlyContribution > 0) {
      let tempMonths = 0;
      let tempValue = currentSavings;
      
      while (tempValue < savingsGoal && tempMonths < 600) { // Max 50 years
        tempValue = tempValue * (1 + monthlyRate) + monthlyContribution;
        tempMonths++;
      }
      goalAchievementTime = tempMonths / 12;
    }
  }
  
  // Savings rate calculation with safe operations
  const annualContribution = safeMultiply(monthlyContribution, 12);
  const annualIncome = safeDivide(annualContribution, 0.2); // Assuming 20% savings rate
  const savingsRate = safeMultiply(safeDivide(annualContribution, Math.max(1, annualIncome)), 100);
  
  return {
    totalFutureValue,
    totalContributions,
    totalInterestEarned,
    afterTaxValue,
    taxOnInterest,
    inflationAdjustedValue,
    realReturnRate,
    monthlyRequiredForGoal,
    shortfall,
    surplus,
    goalAchievementTime,
    savingsRate,
    effectiveAnnualReturn: safeMultiply(
      Math.max(-100, Math.pow(safeDivide(totalFutureValue, Math.max(1, totalContributions)), 
      safeDivide(1, Math.max(1, timeHorizon))) - 1), 100)
  };
}

export default function SavingsCalculatorPage() {
  const [values, setValues] = useState<SavingsInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const savingsResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Validate inputs
      if (values.savingsGoal <= 0) {
        throw new Error('Savings goal must be greater than zero');
      }

      if (values.monthlyContribution <= 0) {
        throw new Error('Monthly contribution must be greater than zero');
      }

      if (values.interestRate <= 0) {
        throw new Error('Interest rate must be greater than zero');
      }

      if (values.timeHorizon <= 0) {
        throw new Error('Time horizon must be greater than zero');
      }

      const calculation = calculateSavings(values);

      return calculation;
    } catch (err: any) {
      console.error('Savings calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Savings Type',
      name: 'savingsType',
      type: 'select',
      options: [
        { value: 'goal-based', label: 'Goal-Based Savings' },
        { value: 'growth', label: 'Wealth Accumulation' },
        { value: 'emergency', label: 'Emergency Fund' }
      ],
      required: true,
      tooltip: 'Type of savings plan you want to calculate'
    },
    {
      label: 'Savings Goal',
      name: 'savingsGoal',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      min: 10000,
      max: 100000000,
      required: true,
      tooltip: 'Target amount you want to save'
    },
    {
      label: 'Current Savings',
      name: 'currentSavings',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      min: 0,
      max: 50000000,
      required: true,
      tooltip: 'Amount you have already saved'
    },
    {
      label: 'Monthly Contribution',
      name: 'monthlyContribution',
      type: 'number',
      placeholder: '10,000',
      unit: currency.symbol,
      min: 500,
      max: 500000,
      required: true,
      tooltip: 'Amount you can save each month'
    },
    {
      label: 'Expected Annual Return',
      name: 'interestRate',
      type: 'percentage',
      placeholder: '8',
      min: 1,
      max: 25,
      step: 0.1,
      required: true,
      tooltip: 'Expected annual return on your savings'
    },
    {
      label: 'Time Horizon',
      name: 'timeHorizon',
      type: 'number',
      placeholder: '10',
      min: 1,
      max: 50,
      unit: 'years',
      required: true,
      tooltip: 'Number of years you plan to save'
    },
    {
      label: 'Expected Inflation Rate',
      name: 'inflationRate',
      type: 'percentage',
      placeholder: '6',
      min: 2,
      max: 15,
      step: 0.1,
      required: true,
      tooltip: 'Expected annual inflation rate'
    },
    {
      label: 'Tax Rate on Returns',
      name: 'taxRate',
      type: 'percentage',
      placeholder: '10',
      min: 0,
      max: 30,
      step: 0.1,
      required: true,
      tooltip: 'Tax rate applicable on investment returns'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!savingsResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Future Value',
        value: savingsResults.totalFutureValue,
        type: 'currency',
        highlight: true,
        tooltip: 'Total amount you will have at the end of the period'
      },
      {
        label: 'Total Contributions',
        value: savingsResults.totalContributions,
        type: 'currency',
        tooltip: 'Total amount you will contribute over the period'
      },
      {
        label: 'Interest Earned',
        value: savingsResults.totalInterestEarned,
        type: 'currency',
        tooltip: 'Total interest/returns earned on your savings'
      },
      {
        label: 'After-Tax Value',
        value: savingsResults.afterTaxValue,
        type: 'currency',
        tooltip: 'Value after paying taxes on returns'
      },
      {
        label: 'Inflation-Adjusted Value',
        value: savingsResults.inflationAdjustedValue,
        type: 'currency',
        tooltip: 'Real purchasing power of your savings'
      },
      {
        label: 'Real Return Rate',
        value: savingsResults.realReturnRate,
        type: 'percentage',
        tooltip: 'Return rate after adjusting for inflation'
      }
    ];

    if (values.savingsType === 'goal-based') {
      if (savingsResults.surplus > 0) {
        calculatorResults.push({
          label: 'Goal Surplus',
          value: savingsResults.surplus,
          type: 'currency',
          tooltip: 'Amount by which you will exceed your goal'
        });
      } else if (savingsResults.shortfall > 0) {
        calculatorResults.push(
          {
            label: 'Goal Shortfall',
            value: savingsResults.shortfall,
            type: 'currency',
            tooltip: 'Amount by which you will fall short of your goal'
          },
          {
            label: 'Required Monthly Contribution',
            value: savingsResults.monthlyRequiredForGoal,
            type: 'currency',
            tooltip: 'Monthly amount needed to reach your goal'
          }
        );
      }

      if (savingsResults.goalAchievementTime > 0 && savingsResults.goalAchievementTime < 50) {
        calculatorResults.push({
          label: 'Goal Achievement Time',
          value: savingsResults.goalAchievementTime,
          type: 'number',
          tooltip: 'Years needed to reach your goal with current contributions'
        });
      }
    }

    calculatorResults.push({
      label: 'Effective Annual Return',
      value: savingsResults.effectiveAnnualReturn,
      type: 'percentage',
      tooltip: 'Effective annual return considering all contributions'
    });

    return calculatorResults;
  }, [savingsResults, values.savingsType, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Savings Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Start saving early to maximize compound interest.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Regular contributions significantly boost your savings.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider inflation and taxes when planning long-term goals.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Savings Calculator"
      description="Plan your savings strategy with goal-based calculations. See how your money will grow over time and plan for inflation and taxes."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Savings Details"
        description="Enter your savings details to see your financial projections."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={savingsResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}
