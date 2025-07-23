"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { SimpleBarChart } from '@/components/ui/enhanced-charts';
import { parseRobustNumber } from '@/lib/utils/number';

interface FinancialHealthInputs {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalDebt: number;
  emergencyFund: number;
  investments: number;
  age: number;
  hasInsurance: string;
  hasRetirementPlan: string;
  creditScore: number;
}

const initialValues: FinancialHealthInputs = {
  monthlyIncome: 100000,
  monthlyExpenses: 70000,
  totalDebt: 500000,
  emergencyFund: 200000,
  investments: 300000,
  age: 30,
  hasInsurance: 'yes',
  hasRetirementPlan: 'yes',
  creditScore: 750
};

interface HealthScoreResult {
  overallScore: number;
  category: string;
  categoryColor: string;
  scores: {
    savingsRate: { score: number; value: number };
    debtToIncome: { score: number; value: number };
    emergencyFund: { score: number; value: number };
    investmentRatio: { score: number; value: number };
    creditScore: { score: number; value: number };
    insurance: { score: number; value: string };
    retirement: { score: number; value: string };
  };
  recommendations: string[];
}

function calculateFinancialHealth(inputs: FinancialHealthInputs): HealthScoreResult {
  // Use parseRobustNumber for flexible input handling
  const monthlyIncome = Math.abs(parseRobustNumber(inputs.monthlyIncome)) || 100000;
  const monthlyExpenses = Math.abs(parseRobustNumber(inputs.monthlyExpenses)) || 0;
  const totalDebt = Math.abs(parseRobustNumber(inputs.totalDebt)) || 0;
  const emergencyFund = Math.abs(parseRobustNumber(inputs.emergencyFund)) || 0;
  const investments = Math.abs(parseRobustNumber(inputs.investments)) || 0;
  const age = Math.max(18, Math.min(100, Math.abs(parseRobustNumber(inputs.age)) || 30));
  const hasInsurance = inputs.hasInsurance || 'no';
  const hasRetirementPlan = inputs.hasRetirementPlan || 'no';
  const creditScore = Math.max(300, Math.min(850, Math.abs(parseRobustNumber(inputs.creditScore)) || 750));

  // Calculate individual scores (0-100)
  const scores = {
    savingsRate: calculateSavingsRateScore(monthlyIncome, monthlyExpenses),
    debtToIncome: calculateDebtToIncomeScore(totalDebt, monthlyIncome),
    emergencyFund: calculateEmergencyFundScore(emergencyFund, monthlyExpenses),
    investmentRatio: calculateInvestmentScore(investments, monthlyIncome, age),
    creditScore: calculateCreditScoreScore(creditScore),
    insurance: calculateInsuranceScore(hasInsurance),
    retirement: calculateRetirementScore(hasRetirementPlan, age)
  };

  // Calculate weighted overall score
  const weights = {
    savingsRate: 0.20,
    debtToIncome: 0.20,
    emergencyFund: 0.15,
    investmentRatio: 0.15,
    creditScore: 0.15,
    insurance: 0.10,
    retirement: 0.05
  };

  const overallScore = Object.entries(scores).reduce((total, [key, scoreData]) => {
    return total + (scoreData.score * weights[key as keyof typeof weights]);
  }, 0);

  const { category, categoryColor } = getScoreCategory(overallScore);
  const recommendations = generateRecommendations(scores);

  return {
    overallScore: Math.round(overallScore),
    category,
    categoryColor,
    scores,
    recommendations
  };
}

function calculateSavingsRateScore(income: number, expenses: number) {
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  let score = 0;
  
  if (savingsRate >= 20) score = 100;
  else if (savingsRate >= 15) score = 80;
  else if (savingsRate >= 10) score = 60;
  else if (savingsRate >= 5) score = 40;
  else if (savingsRate >= 0) score = 20;
  else score = 0;

  return { score, value: Math.max(0, savingsRate) };
}

function calculateDebtToIncomeScore(debt: number, monthlyIncome: number) {
  const annualIncome = monthlyIncome * 12;
  const debtToIncomeRatio = annualIncome > 0 ? (debt / annualIncome) * 100 : 0;
  let score = 0;

  if (debtToIncomeRatio <= 20) score = 100;
  else if (debtToIncomeRatio <= 36) score = 80;
  else if (debtToIncomeRatio <= 50) score = 60;
  else if (debtToIncomeRatio <= 75) score = 40;
  else if (debtToIncomeRatio <= 100) score = 20;
  else score = 0;

  return { score, value: debtToIncomeRatio };
}

function calculateEmergencyFundScore(emergencyFund: number, monthlyExpenses: number) {
  const monthsCovered = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
  let score = 0;

  if (monthsCovered >= 6) score = 100;
  else if (monthsCovered >= 4) score = 80;
  else if (monthsCovered >= 3) score = 60;
  else if (monthsCovered >= 1) score = 40;
  else if (monthsCovered >= 0.5) score = 20;
  else score = 0;

  return { score, value: monthsCovered };
}

function calculateInvestmentScore(investments: number, monthlyIncome: number, age: number) {
  const annualIncome = monthlyIncome * 12;
  const investmentRatio = annualIncome > 0 ? (investments / annualIncome) * 100 : 0;
  const expectedRatio = Math.max(10, age * 2); // Rule of thumb: age * 2% of annual income
  
  let score = 0;
  if (investmentRatio >= expectedRatio) score = 100;
  else if (investmentRatio >= expectedRatio * 0.8) score = 80;
  else if (investmentRatio >= expectedRatio * 0.6) score = 60;
  else if (investmentRatio >= expectedRatio * 0.4) score = 40;
  else if (investmentRatio >= expectedRatio * 0.2) score = 20;
  else score = 0;

  return { score, value: investmentRatio };
}

function calculateCreditScoreScore(creditScore: number) {
  let score = 0;
  
  if (creditScore >= 800) score = 100;
  else if (creditScore >= 750) score = 90;
  else if (creditScore >= 700) score = 80;
  else if (creditScore >= 650) score = 60;
  else if (creditScore >= 600) score = 40;
  else if (creditScore >= 550) score = 20;
  else score = 0;

  return { score, value: creditScore };
}

function calculateInsuranceScore(hasInsurance: string) {
  const score = hasInsurance === 'yes' ? 100 : 0;
  return { score, value: hasInsurance };
}

function calculateRetirementScore(hasRetirementPlan: string, age: number) {
  let score = 0;
  
  if (hasRetirementPlan === 'yes') {
    if (age < 30) score = 100;
    else if (age < 40) score = 90;
    else if (age < 50) score = 80;
    else score = 70;
  } else {
    score = 0;
  }

  return { score, value: hasRetirementPlan };
}

function getScoreCategory(score: number) {
  if (score >= 80) return { category: 'Excellent', categoryColor: '#10b981' };
  if (score >= 70) return { category: 'Good', categoryColor: '#3b82f6' };
  if (score >= 60) return { category: 'Fair', categoryColor: '#f59e0b' };
  if (score >= 40) return { category: 'Poor', categoryColor: '#f97316' };
  return { category: 'Critical', categoryColor: '#ef4444' };
}

function generateRecommendations(scores: any): string[] {
  const recommendations = [];

  if (scores.savingsRate.score < 60) {
    recommendations.push('Increase your savings rate to at least 15-20% of income');
  }
  
  if (scores.debtToIncome.score < 60) {
    recommendations.push('Focus on reducing debt to improve debt-to-income ratio');
  }
  
  if (scores.emergencyFund.score < 80) {
    recommendations.push('Build emergency fund to cover 3-6 months of expenses');
  }
  
  if (scores.investmentRatio.score < 60) {
    recommendations.push('Increase investments for long-term wealth building');
  }
  
  if (scores.creditScore.score < 80) {
    recommendations.push('Work on improving credit score through timely payments');
  }
  
  if (scores.insurance.score < 100) {
    recommendations.push('Get adequate insurance coverage for financial protection');
  }
  
  if (scores.retirement.score < 100) {
    recommendations.push('Start retirement planning as early as possible');
  }

  return recommendations;
}

export default function FinancialHealthCalculatorPage() {
  const [values, setValues] = useState<FinancialHealthInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const healthResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases gracefully
      const calculation = calculateFinancialHealth(values);
      return calculation;
    } catch (err: any) {
      console.error('Financial health calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Monthly Income',
      name: 'monthlyIncome',
      type: 'number',
      placeholder: '100,000',
      unit: currency.symbol,
      tooltip: 'Your total monthly income after taxes'
    },
    {
      label: 'Monthly Expenses',
      name: 'monthlyExpenses',
      type: 'number',
      placeholder: '70,000',
      unit: currency.symbol,
      tooltip: 'Your total monthly living expenses'
    },
    {
      label: 'Total Debt',
      name: 'totalDebt',
      type: 'number',
      placeholder: '500,000',
      unit: currency.symbol,
      tooltip: 'Total outstanding debt (loans, credit cards, etc.)'
    },
    {
      label: 'Emergency Fund',
      name: 'emergencyFund',
      type: 'number',
      placeholder: '200,000',
      unit: currency.symbol,
      tooltip: 'Amount saved for emergencies'
    },
    {
      label: 'Total Investments',
      name: 'investments',
      type: 'number',
      placeholder: '300,000',
      unit: currency.symbol,
      tooltip: 'Total value of investments (stocks, mutual funds, etc.)'
    },
    {
      label: 'Age',
      name: 'age',
      type: 'number',
      placeholder: '30',
      tooltip: 'Your current age'
    },
    {
      label: 'Have Insurance Coverage',
      name: 'hasInsurance',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      tooltip: 'Do you have adequate life and health insurance?'
    },
    {
      label: 'Have Retirement Plan',
      name: 'hasRetirementPlan',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      tooltip: 'Do you have a retirement savings plan?'
    },
    {
      label: 'Credit Score',
      name: 'creditScore',
      type: 'number',
      placeholder: '750',
      tooltip: 'Your current credit score'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!healthResults) return [];

    return [
      {
        label: 'Financial Health Score',
        value: healthResults.overallScore,
        type: 'number',
        highlight: true,
        tooltip: `Your overall financial health rating: ${healthResults.category}`
      },
      {
        label: 'Health Category',
        value: healthResults.category,
        type: 'number',
        tooltip: 'Your financial health category based on the score'
      },
      {
        label: 'Savings Rate',
        value: healthResults.scores.savingsRate.value,
        type: 'percentage',
        tooltip: 'Percentage of income you save monthly'
      },
      {
        label: 'Debt-to-Income Ratio',
        value: healthResults.scores.debtToIncome.value,
        type: 'percentage',
        tooltip: 'Your total debt as percentage of annual income'
      },
      {
        label: 'Emergency Fund Coverage',
        value: healthResults.scores.emergencyFund.value,
        type: 'number',
        tooltip: 'Number of months your emergency fund can cover'
      }
    ];
  }, [healthResults]);

  // Prepare data for score breakdown chart
  const scoreBreakdownData = useMemo(() => {
    if (!healthResults) return [];
    
    return [
      { label: 'Savings Rate', value: healthResults.scores.savingsRate.score },
      { label: 'Debt Management', value: healthResults.scores.debtToIncome.score },
      { label: 'Emergency Fund', value: healthResults.scores.emergencyFund.score },
      { label: 'Investments', value: healthResults.scores.investmentRatio.score },
      { label: 'Credit Score', value: healthResults.scores.creditScore.score },
      { label: 'Insurance', value: healthResults.scores.insurance.score },
      { label: 'Retirement Plan', value: healthResults.scores.retirement.score }
    ];
  }, [healthResults]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 500);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Score Ranges</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Excellent</span>
            <span className="text-sm font-medium text-green-600">80-100</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Good</span>
            <span className="text-sm font-medium text-blue-600">70-79</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Fair</span>
            <span className="text-sm font-medium text-yellow-600">60-69</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Poor</span>
            <span className="text-sm font-medium text-orange-600">40-59</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Critical</span>
            <span className="text-sm font-medium text-red-600">0-39</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Review your financial health regularly</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Focus on areas with lowest scores first</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Set specific financial goals</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Seek professional advice if needed</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Financial Health Score Calculator"
      description="Assess your overall financial health with a comprehensive score based on key financial metrics."
      sidebar={sidebar}
    >
      <div className="space-y-6">
        <EnhancedCalculatorForm
          title="Financial Health Assessment"
          description="Enter your financial details to get a comprehensive health score."
          fields={fields}
          values={values}
          onChange={handleChange}
          onCalculate={handleCalculate}
          results={healthResults ? results : []}
          loading={loading}
          error={calculationError}
          showComparison={false}
        />

        {healthResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Score Display */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Financial Health Score</h3>
              <div 
                className="text-6xl font-bold mb-2"
                style={{ color: healthResults.categoryColor }}
              >
                {healthResults.overallScore}
              </div>
              <div 
                className="text-xl font-semibold mb-4"
                style={{ color: healthResults.categoryColor }}
              >
                {healthResults.category}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${healthResults.overallScore}%`,
                    backgroundColor: healthResults.categoryColor
                  }}
                />
              </div>
            </div>

            {/* Score Breakdown */}
            <SimpleBarChart
              data={scoreBreakdownData}
              title="Score Breakdown by Category"
              height={300}
              formatValue={(value) => `${value}/100`}
            />
          </div>
        )}

        {healthResults && healthResults.recommendations.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations for Improvement</h3>
            <div className="space-y-3">
              {healthResults.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-600 font-bold">{index + 1}.</span>
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}