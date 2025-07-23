"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { SimpleBarChart, GoalProgressChart } from '@/components/ui/enhanced-charts';
import { Tabs } from '@/components/ui/tabs';
import { parseRobustNumber } from '@/lib/utils/number';

interface EmergencyFundInputs {
  monthlyExpenses: number;
  currentSavings: number;
  targetMonths: number;
  monthlySavings: number;
  emergencyType: string;
  dependents: number;
  jobStability: string;
}

const initialValues: EmergencyFundInputs = {
  monthlyExpenses: 50000,
  currentSavings: 100000,
  targetMonths: 6,
  monthlySavings: 10000,
  emergencyType: 'general',
  dependents: 2,
  jobStability: 'stable'
};

function calculateEmergencyFund(inputs: EmergencyFundInputs) {
  // Use parseRobustNumber for flexible input handling
  const monthlyExpenses = Math.abs(parseRobustNumber(inputs.monthlyExpenses)) || 50000;
  const currentSavings = Math.abs(parseRobustNumber(inputs.currentSavings)) || 0;
  const targetMonths = Math.max(1, Math.abs(parseRobustNumber(inputs.targetMonths)) || 6);
  const monthlySavings = Math.abs(parseRobustNumber(inputs.monthlySavings)) || 0;
  const emergencyType = inputs.emergencyType || 'general';
  const dependents = Math.abs(parseRobustNumber(inputs.dependents)) || 0;
  const jobStability = inputs.jobStability || 'stable';

  // Calculate recommended emergency fund based on various factors
  let recommendedMonths = targetMonths;
  
  // Adjust based on job stability
  if (jobStability === 'unstable') {
    recommendedMonths += 2;
  } else if (jobStability === 'freelance') {
    recommendedMonths += 3;
  }
  
  // Adjust based on dependents
  if (dependents > 2) {
    recommendedMonths += 1;
  }
  
  // Adjust based on emergency type
  if (emergencyType === 'medical') {
    recommendedMonths += 1;
  } else if (emergencyType === 'business') {
    recommendedMonths += 2;
  }

  const targetAmount = monthlyExpenses * recommendedMonths;
  const shortfall = Math.max(0, targetAmount - currentSavings);
  const monthsToTarget = shortfall > 0 && monthlySavings > 0 ? Math.ceil(shortfall / monthlySavings) : 0;
  const progressPercentage = targetAmount > 0 ? (currentSavings / targetAmount) * 100 : 0;
  
  // Calculate different emergency scenarios
  const scenarios = {
    basic: monthlyExpenses * 3,
    recommended: targetAmount,
    conservative: monthlyExpenses * 12
  };

  return {
    targetAmount,
    shortfall,
    monthsToTarget,
    progressPercentage,
    recommendedMonths,
    scenarios,
    monthlyExpenses,
    currentSavings
  };
}

export default function EmergencyFundCalculatorPage() {
  const [values, setValues] = useState<EmergencyFundInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('calculator');

  const { currency } = useCurrency();

  const emergencyFundResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases gracefully
      const calculation = calculateEmergencyFund(values);
      return calculation;
    } catch (err: any) {
      console.error('Emergency fund calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Monthly Expenses',
      name: 'monthlyExpenses',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      tooltip: 'Your total monthly living expenses including rent, food, utilities, etc.'
    },
    {
      label: 'Current Emergency Savings',
      name: 'currentSavings',
      type: 'number',
      placeholder: '100,000',
      unit: currency.symbol,
      tooltip: 'Amount you currently have saved for emergencies'
    },
    {
      label: 'Target Months Coverage',
      name: 'targetMonths',
      type: 'number',
      placeholder: '6',
      unit: 'months',
      tooltip: 'Number of months of expenses you want to cover'
    },
    {
      label: 'Monthly Savings Capacity',
      name: 'monthlySavings',
      type: 'number',
      placeholder: '10,000',
      unit: currency.symbol,
      tooltip: 'Amount you can save monthly towards emergency fund'
    },
    {
      label: 'Emergency Type',
      name: 'emergencyType',
      type: 'select',
      options: [
        { value: 'general', label: 'General Emergency Fund' },
        { value: 'medical', label: 'Medical Emergency Focus' },
        { value: 'business', label: 'Business/Income Loss' },
        { value: 'family', label: 'Family Emergency' }
      ],
      tooltip: 'Type of emergency you are primarily preparing for'
    },
    {
      label: 'Number of Dependents',
      name: 'dependents',
      type: 'number',
      placeholder: '2',
      tooltip: 'Number of family members dependent on your income'
    },
    {
      label: 'Job Stability',
      name: 'jobStability',
      type: 'select',
      options: [
        { value: 'stable', label: 'Stable Employment' },
        { value: 'unstable', label: 'Unstable Employment' },
        { value: 'freelance', label: 'Freelance/Contract' },
        { value: 'business', label: 'Business Owner' }
      ],
      tooltip: 'Your employment situation affects emergency fund requirements'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!emergencyFundResults) return [];

    return [
      {
        label: 'Recommended Emergency Fund',
        value: emergencyFundResults.targetAmount,
        type: 'currency',
        highlight: true,
        tooltip: `${emergencyFundResults.recommendedMonths} months of expenses based on your situation`
      },
      {
        label: 'Current Progress',
        value: emergencyFundResults.progressPercentage,
        type: 'percentage',
        tooltip: 'Percentage of target emergency fund achieved'
      },
      {
        label: 'Amount Still Needed',
        value: emergencyFundResults.shortfall,
        type: 'currency',
        tooltip: 'Additional amount needed to reach your emergency fund goal'
      },
      {
        label: 'Months to Target',
        value: emergencyFundResults.monthsToTarget,
        type: 'number',
        tooltip: 'Time needed to reach your goal at current savings rate'
      },
      {
        label: 'Monthly Coverage (Current)',
        value: emergencyFundResults.monthlyExpenses > 0 ? emergencyFundResults.currentSavings / emergencyFundResults.monthlyExpenses : 0,
        type: 'number',
        tooltip: 'Number of months your current savings can cover'
      }
    ];
  }, [emergencyFundResults]);

  // Prepare data for scenario comparison chart
  const scenarioData = useMemo(() => {
    if (!emergencyFundResults) return [];
    
    return [
      {
        label: 'Basic (3 months)',
        value: emergencyFundResults.scenarios.basic
      },
      {
        label: 'Recommended',
        value: emergencyFundResults.scenarios.recommended
      },
      {
        label: 'Conservative (12 months)',
        value: emergencyFundResults.scenarios.conservative
      }
    ];
  }, [emergencyFundResults]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 500);
  };

  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: '🧮' },
    { id: 'scenarios', label: 'Scenarios', icon: '📊' },
    { id: 'progress', label: 'Progress Tracking', icon: '🎯' }
  ];

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Emergency Fund Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Keep emergency funds in easily accessible accounts</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Aim for 3-6 months of expenses minimum</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider high-yield savings accounts</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Review and adjust based on life changes</p>
          </div>
        </div>
      </div>

      {emergencyFundResults && (
        <div className="card">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Your Situation</h3>
          <div className="space-y-3">
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Risk Level</h4>
              <p className="text-sm text-neutral-700">
                {values.jobStability === 'stable' ? 'Low Risk' : 
                 values.jobStability === 'unstable' ? 'Medium Risk' : 'High Risk'}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Recommended Coverage</h4>
              <p className="text-sm text-neutral-700">{emergencyFundResults.recommendedMonths} months</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CalculatorLayout
      title="Emergency Fund Calculator"
      description="Calculate how much you need in your emergency fund based on your expenses, dependents, and risk factors."
      sidebar={sidebar}
    >
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {activeTab === 'calculator' && (
        <EnhancedCalculatorForm
          title="Emergency Fund Details"
          description="Enter your financial details to calculate your emergency fund needs."
          fields={fields}
          values={values}
          onChange={handleChange}
          onCalculate={handleCalculate}
          results={emergencyFundResults ? results : []}
          loading={loading}
          error={calculationError}
          showComparison={false}
        />
      )}

      {activeTab === 'scenarios' && emergencyFundResults && (
        <div className="space-y-6">
          <SimpleBarChart
            data={scenarioData}
            title="Emergency Fund Scenarios"
            height={300}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Basic Coverage</h4>
              <p className="text-2xl font-bold text-blue-700 mb-1">
                {currency.symbol}{emergencyFundResults.scenarios.basic.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">3 months of expenses</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Recommended</h4>
              <p className="text-2xl font-bold text-green-700 mb-1">
                {currency.symbol}{emergencyFundResults.scenarios.recommended.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">{emergencyFundResults.recommendedMonths} months based on your profile</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Conservative</h4>
              <p className="text-2xl font-bold text-purple-700 mb-1">
                {currency.symbol}{emergencyFundResults.scenarios.conservative.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600">12 months of expenses</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && emergencyFundResults && (
        <div className="space-y-6">
          <GoalProgressChart
            currentValue={emergencyFundResults.currentSavings}
            goalValue={emergencyFundResults.targetAmount}
            label="Emergency Fund Progress"
            unit={currency.symbol}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Plan</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Savings:</span>
                  <span className="font-medium">{currency.symbol}{values.monthlySavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Months to Goal:</span>
                  <span className="font-medium">{emergencyFundResults.monthsToTarget} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Date:</span>
                  <span className="font-medium">
                    {new Date(Date.now() + emergencyFundResults.monthsToTarget * 30 * 24 * 60 * 60 * 1000)
                      .toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-1">Increase Savings</h4>
                  <p className="text-sm text-yellow-700">
                    Save {currency.symbol}{Math.ceil(emergencyFundResults.shortfall / 6).toLocaleString()} 
                    more per month to reach goal in 6 months
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Reduce Expenses</h4>
                  <p className="text-sm text-blue-700">
                    Reducing monthly expenses by 10% would lower your target by {currency.symbol}
                    {(values.monthlyExpenses * 0.1 * emergencyFundResults.recommendedMonths).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}