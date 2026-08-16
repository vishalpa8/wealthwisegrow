"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import React from 'react';
import { BaseCalculatorTemplate } from '@/components/templates/base-calculator';
import { EnhancedCalculatorField, CalculatorResult } from '@/components/organisms/enhanced-calculator-form';
import { useCurrency } from "@/contexts/currency-context";
import { SimpleBarChart, GoalProgressChart } from '@/components/molecules/enhanced-charts';
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

export default function EmergencyFundCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Monthly Expenses', name: 'monthlyExpenses', type: 'number', placeholder: '50,000', unit: currency.symbol, tooltip: 'Your total monthly living expenses' },
    { label: 'Current Savings', name: 'currentSavings', type: 'number', placeholder: '100,000', unit: currency.symbol, tooltip: 'Amount you currently have saved' },
    { label: 'Target Months Coverage', name: 'targetMonths', type: 'number', placeholder: '6', unit: 'months' },
    { label: 'Monthly Savings Capacity', name: 'monthlySavings', type: 'number', placeholder: '10,000', unit: currency.symbol },
    { label: 'Emergency Type', name: 'emergencyType', type: 'select', options: [
      { value: 'general', label: 'General Emergency Fund' },
      { value: 'medical', label: 'Medical Emergency Focus' },
      { value: 'business', label: 'Business/Income Loss' },
      { value: 'family', label: 'Family Emergency' }
    ] },
    { label: 'Number of Dependents', name: 'dependents', type: 'number', placeholder: '2' },
    { label: 'Job Stability', name: 'jobStability', type: 'select', options: [
      { value: 'stable', label: 'Stable Employment' },
      { value: 'unstable', label: 'Unstable Employment' },
      { value: 'freelance', label: 'Freelance/Contract' },
      { value: 'business', label: 'Business Owner' }
    ] }
  ];

  const calculate = (inputs: EmergencyFundInputs) => {
    const monthlyExpenses = Math.abs(parseRobustNumber(inputs.monthlyExpenses)) || 50000;
    const currentSavings = Math.abs(parseRobustNumber(inputs.currentSavings)) || 0;
    const targetMonths = Math.max(1, Math.abs(parseRobustNumber(inputs.targetMonths)) || 6);
    const monthlySavings = Math.abs(parseRobustNumber(inputs.monthlySavings)) || 0;
    const emergencyType = inputs.emergencyType || 'general';
    const dependents = Math.abs(parseRobustNumber(inputs.dependents)) || 0;
    const jobStability = inputs.jobStability || 'stable';

    let recommendedMonths = targetMonths;
    if (jobStability === 'unstable') recommendedMonths += 2;
    else if (jobStability === 'freelance') recommendedMonths += 3;
    if (dependents > 2) recommendedMonths += 1;
    if (emergencyType === 'medical') recommendedMonths += 1;
    else if (emergencyType === 'business') recommendedMonths += 2;

    const targetAmount = monthlyExpenses * recommendedMonths;
    const shortfall = Math.max(0, targetAmount - currentSavings);
    const monthsToTarget = shortfall > 0 && monthlySavings > 0 ? Math.ceil(shortfall / monthlySavings) : 0;
    const progressPercentage = targetAmount > 0 ? (currentSavings / targetAmount) * 100 : 0;
    
    const scenarios = {
      basic: monthlyExpenses * 3,
      recommended: targetAmount,
      conservative: monthlyExpenses * 12
    };

    const results: CalculatorResult[] = [
      { label: 'Recommended Fund', value: targetAmount, type: 'currency', highlight: true, tooltip: `${recommendedMonths} months of expenses` },
      { label: 'Current Progress', value: progressPercentage, type: 'percentage' },
      { label: 'Amount Still Needed', value: shortfall, type: 'currency' },
      { label: 'Months to Target', value: monthsToTarget, type: 'number' },
      { label: 'Monthly Coverage (Current)', value: monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0, type: 'number' }
    ];

    const chartData = {
      scenarioData: [
        { label: 'Basic (3 months)', value: scenarios.basic },
        { label: 'Recommended', value: scenarios.recommended },
        { label: 'Conservative (12 months)', value: scenarios.conservative }
      ],
      currentSavings,
      targetAmount,
      monthsToTarget,
      shortfall,
      monthlySavings,
      monthlyExpenses,
      recommendedMonths
    };

    return { results, chartData };
  };

  const charts = [
    {
      id: "scenarios",
      render: (results: any, chartData: any) => (
        <div className="space-y-6">
          <SimpleBarChart data={chartData.scenarioData} title="Emergency Fund Scenarios" height={300} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Basic Coverage</h4>
              <p className="text-2xl font-bold text-blue-700 mb-1">{currency.symbol}{chartData.scenarioData[0].value.toLocaleString()}</p>
              <p className="text-sm text-blue-600">3 months of expenses</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Recommended</h4>
              <p className="text-2xl font-bold text-green-700 mb-1">{currency.symbol}{chartData.scenarioData[1].value.toLocaleString()}</p>
              <p className="text-sm text-green-600">{chartData.recommendedMonths} months based on your profile</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Conservative</h4>
              <p className="text-2xl font-bold text-purple-700 mb-1">{currency.symbol}{chartData.scenarioData[2].value.toLocaleString()}</p>
              <p className="text-sm text-purple-600">12 months of expenses</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "progress",
      render: (results: any, chartData: any) => (
        <div className="space-y-6">
          <GoalProgressChart
            currentValue={chartData.currentSavings}
            goalValue={chartData.targetAmount}
            label="Emergency Fund Progress"
            unit={currency.symbol}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Plan</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Savings:</span>
                  <span className="font-medium">{currency.symbol}{chartData.monthlySavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Months to Goal:</span>
                  <span className="font-medium">{chartData.monthsToTarget} months</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-1">Increase Savings</h4>
                  <p className="text-sm text-yellow-700">Save {currency.symbol}{Math.ceil(chartData.shortfall / 6).toLocaleString()} more per month to reach goal in 6 months</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const seoContent = (
      <SEOContent title="Emergency Fund Tips"
      description="Calculate how much you need in your emergency fund based on your expenses, dependents, and risk factors."
      sections={[
        { title: "Accessibility", content: "Keep emergency funds in easily accessible accounts." },
        { title: "Target Amount", content: "Aim for 3-6 months of expenses minimum." },
        { title: "Accounts", content: "Consider high-yield savings accounts." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<EmergencyFundInputs>
      title="Personal Emergency Fund Savings Calculator"
      description="Calculate how much you need in your emergency fund based on your expenses, dependents, and risk factors."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      charts={charts}
      seoContent={seoContent}
    />
  );
}
