"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { 
  parseRobustNumber, 
  safeDivide, 
  safeMultiply, 
  safePower, 
  isEffectivelyZero,
  roundToPrecision
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
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
      placeholder: '10,00,000',
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

  const results = useMemo(() => {
    try {
      setError('');
      
      // Validate inputs
      if (values.savingsGoal <= 0) {
        setError('Savings goal must be greater than zero');
        return [];
      }

      if (values.monthlyContribution <= 0) {
        setError('Monthly contribution must be greater than zero');
        return [];
      }

      if (values.interestRate <= 0) {
        setError('Interest rate must be greater than zero');
        return [];
      }

      if (values.timeHorizon <= 0) {
        setError('Time horizon must be greater than zero');
        return [];
      }

      const calculation = calculateSavings(values);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Future Value',
          value: calculation.totalFutureValue,
          type: 'currency',
          highlight: true,
          tooltip: 'Total amount you will have at the end of the period'
        },
        {
          label: 'Total Contributions',
          value: calculation.totalContributions,
          type: 'currency',
          tooltip: 'Total amount you will contribute over the period'
        },
        {
          label: 'Interest Earned',
          value: calculation.totalInterestEarned,
          type: 'currency',
          tooltip: 'Total interest/returns earned on your savings'
        },
        {
          label: 'After-Tax Value',
          value: calculation.afterTaxValue,
          type: 'currency',
          tooltip: 'Value after paying taxes on returns'
        },
        {
          label: 'Inflation-Adjusted Value',
          value: calculation.inflationAdjustedValue,
          type: 'currency',
          tooltip: 'Real purchasing power of your savings'
        },
        {
          label: 'Real Return Rate',
          value: calculation.realReturnRate,
          type: 'percentage',
          tooltip: 'Return rate after adjusting for inflation'
        }
      ];

      if (values.savingsType === 'goal-based') {
        if (calculation.surplus > 0) {
          calculatorResults.push({
            label: 'Goal Surplus',
            value: calculation.surplus,
            type: 'currency',
            tooltip: 'Amount by which you will exceed your goal'
          });
        } else if (calculation.shortfall > 0) {
          calculatorResults.push(
            {
              label: 'Goal Shortfall',
              value: calculation.shortfall,
              type: 'currency',
              tooltip: 'Amount by which you will fall short of your goal'
            },
            {
              label: 'Required Monthly Contribution',
              value: calculation.monthlyRequiredForGoal,
              type: 'currency',
              tooltip: 'Monthly amount needed to reach your goal'
            }
          );
        }

        if (calculation.goalAchievementTime > 0 && calculation.goalAchievementTime < 50) {
          calculatorResults.push({
            label: 'Goal Achievement Time',
            value: calculation.goalAchievementTime,
            type: 'number',
            tooltip: 'Years needed to reach your goal with current contributions'
          });
        }
      }

      calculatorResults.push({
        label: 'Effective Annual Return',
        value: calculation.effectiveAnnualReturn,
        type: 'percentage',
        tooltip: 'Effective annual return considering all contributions'
      });

      return calculatorResults;
    } catch (err) {
      console.error('Savings calculation error:', err);
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      // For select fields, we don't need to parse the value
      if (name === 'savingsType') {
        setValues(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
        return;
      }
      
      // Use parseRobustNumber for numeric fields
      const numValue = parseRobustNumber(value);
      
      // Specific validation for required numeric fields
      if ((name === 'savingsGoal' || name === 'monthlyContribution') && numValue <= 0) {
        setError(`${name} must be greater than zero`);
        return;
      }
      
      if ((name === 'interestRate' || name === 'timeHorizon') && numValue < 0) {
        setError(`${name} cannot be negative`);
        return;
      }
      
      if (name === 'timeHorizon' && numValue > 100) {
        setError('Time horizon cannot exceed 100 years');
        return;
      }

      if (name === 'taxRate' && (numValue < 0 || numValue > 100)) {
        setError('Tax rate must be between 0 and 100');
        return;
      }

      setValues(prev => ({ ...prev, [name]: value }));
      if (error) setError('');
    } catch (err) {
      console.error('Input change error:', err);
      setError('Invalid input format');
    }
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Savings Calculator"
        description="Plan your savings strategy with goal-based calculations. See how your money will grow over time and plan for inflation and taxes."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={results}
        loading={loading}
        error={error}
        showComparison={true}
      />
    </div>
  );
}