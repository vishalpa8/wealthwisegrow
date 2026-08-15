"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { BaseCalculatorTemplate } from '@/components/templates/base-calculator';
import { EnhancedCalculatorField, CalculatorResult } from '@/components/organisms/enhanced-calculator-form';
import { useCurrency } from "@/contexts/currency-context";
import { SimpleBarChart } from '@/components/molecules/enhanced-charts';
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

export default function FinancialHealthCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Monthly Income', name: 'monthlyIncome', type: 'number', placeholder: '100,000', unit: currency.symbol, tooltip: 'Your total monthly income after taxes' },
    { label: 'Monthly Expenses', name: 'monthlyExpenses', type: 'number', placeholder: '70,000', unit: currency.symbol, tooltip: 'Your total monthly living expenses' },
    { label: 'Total Debt', name: 'totalDebt', type: 'number', placeholder: '500,000', unit: currency.symbol, tooltip: 'Total outstanding debt' },
    { label: 'Emergency Fund', name: 'emergencyFund', type: 'number', placeholder: '200,000', unit: currency.symbol, tooltip: 'Amount saved for emergencies' },
    { label: 'Total Investments', name: 'investments', type: 'number', placeholder: '300,000', unit: currency.symbol, tooltip: 'Total value of investments' },
    { label: 'Age', name: 'age', type: 'number', placeholder: '30', tooltip: 'Your current age' },
    { label: 'Have Insurance Coverage', name: 'hasInsurance', type: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], tooltip: 'Do you have adequate life and health insurance?' },
    { label: 'Have Retirement Plan', name: 'hasRetirementPlan', type: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], tooltip: 'Do you have a retirement savings plan?' },
    { label: 'Credit Score', name: 'creditScore', type: 'number', placeholder: '750', tooltip: 'Your current credit score' }
  ];

  const calculate = (inputs: FinancialHealthInputs) => {
    const monthlyIncome = Math.abs(parseRobustNumber(inputs.monthlyIncome)) || 100000;
    const monthlyExpenses = Math.abs(parseRobustNumber(inputs.monthlyExpenses)) || 0;
    const totalDebt = Math.abs(parseRobustNumber(inputs.totalDebt)) || 0;
    const emergencyFund = Math.abs(parseRobustNumber(inputs.emergencyFund)) || 0;
    const investments = Math.abs(parseRobustNumber(inputs.investments)) || 0;
    const age = Math.max(18, Math.min(100, Math.abs(parseRobustNumber(inputs.age)) || 30));
    const hasInsurance = inputs.hasInsurance || 'no';
    const hasRetirementPlan = inputs.hasRetirementPlan || 'no';
    const creditScore = Math.max(300, Math.min(850, Math.abs(parseRobustNumber(inputs.creditScore)) || 750));

    // Calculate individual scores
    const savingsRateValue = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const savingsScore = savingsRateValue >= 20 ? 100 : savingsRateValue >= 15 ? 80 : savingsRateValue >= 10 ? 60 : savingsRateValue >= 5 ? 40 : savingsRateValue >= 0 ? 20 : 0;

    const annualIncome = monthlyIncome * 12;
    const debtRatio = annualIncome > 0 ? (totalDebt / annualIncome) * 100 : 0;
    const debtScore = debtRatio <= 20 ? 100 : debtRatio <= 36 ? 80 : debtRatio <= 50 ? 60 : debtRatio <= 75 ? 40 : debtRatio <= 100 ? 20 : 0;

    const monthsCovered = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    const efScore = monthsCovered >= 6 ? 100 : monthsCovered >= 4 ? 80 : monthsCovered >= 3 ? 60 : monthsCovered >= 1 ? 40 : monthsCovered >= 0.5 ? 20 : 0;

    const invRatio = annualIncome > 0 ? (investments / annualIncome) * 100 : 0;
    const expectedRatio = Math.max(10, age * 2);
    const invScore = invRatio >= expectedRatio ? 100 : invRatio >= expectedRatio * 0.8 ? 80 : invRatio >= expectedRatio * 0.6 ? 60 : invRatio >= expectedRatio * 0.4 ? 40 : invRatio >= expectedRatio * 0.2 ? 20 : 0;

    const csScore = creditScore >= 800 ? 100 : creditScore >= 750 ? 90 : creditScore >= 700 ? 80 : creditScore >= 650 ? 60 : creditScore >= 600 ? 40 : creditScore >= 550 ? 20 : 0;
    const insScore = hasInsurance === 'yes' ? 100 : 0;
    
    let retScore = 0;
    if (hasRetirementPlan === 'yes') {
      if (age < 30) retScore = 100;
      else if (age < 40) retScore = 90;
      else if (age < 50) retScore = 80;
      else retScore = 70;
    }

    const overallScore = Math.round(savingsScore*0.2 + debtScore*0.2 + efScore*0.15 + invScore*0.15 + csScore*0.15 + insScore*0.1 + retScore*0.05);

    let category = 'Critical', categoryColor = '#ef4444';
    if (overallScore >= 80) { category = 'Excellent'; categoryColor = '#10b981'; }
    else if (overallScore >= 70) { category = 'Good'; categoryColor = '#3b82f6'; }
    else if (overallScore >= 60) { category = 'Fair'; categoryColor = '#f59e0b'; }
    else if (overallScore >= 40) { category = 'Poor'; categoryColor = '#f97316'; }

    const recommendations = [];
    if (savingsScore < 60) recommendations.push('Increase your savings rate to at least 15-20% of income');
    if (debtScore < 60) recommendations.push('Focus on reducing debt to improve debt-to-income ratio');
    if (efScore < 80) recommendations.push('Build emergency fund to cover 3-6 months of expenses');
    if (invScore < 60) recommendations.push('Increase investments for long-term wealth building');
    if (csScore < 80) recommendations.push('Work on improving credit score through timely payments');
    if (insScore < 100) recommendations.push('Get adequate insurance coverage for financial protection');
    if (retScore < 100) recommendations.push('Start retirement planning as early as possible');

    const results: CalculatorResult[] = [
      { label: 'Financial Health Score', value: overallScore, type: 'number', highlight: true },
      { label: 'Health Category', value: category, type: 'number' },
      { label: 'Savings Rate', value: savingsRateValue, type: 'percentage' },
      { label: 'Debt-to-Income Ratio', value: debtRatio, type: 'percentage' },
      { label: 'Emergency Fund Coverage', value: monthsCovered, type: 'number' }
    ];

    const chartData = {
      overallScore,
      category,
      categoryColor,
      recommendations,
      scoreBreakdownData: [
        { label: 'Savings Rate', value: savingsScore },
        { label: 'Debt Management', value: debtScore },
        { label: 'Emergency Fund', value: efScore },
        { label: 'Investments', value: invScore },
        { label: 'Credit Score', value: csScore },
        { label: 'Insurance', value: insScore },
        { label: 'Retirement Plan', value: retScore }
      ]
    };

    return { results, chartData };
  };

  const charts = [
    {
      id: "health-summary",
      render: (results: any, chartData: any) => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Financial Health Score</h3>
              <div className="text-6xl font-bold mb-2" style={{ color: chartData.categoryColor }}>{chartData.overallScore}</div>
              <div className="text-xl font-semibold mb-4" style={{ color: chartData.categoryColor }}>{chartData.category}</div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="h-4 rounded-full transition-all duration-500" style={{ width: `${chartData.overallScore}%`, backgroundColor: chartData.categoryColor }} />
              </div>
            </div>
            <SimpleBarChart data={chartData.scoreBreakdownData} title="Score Breakdown by Category" height={300} formatValue={(value) => `${value}/100`} />
          </div>
          {chartData.recommendations.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations for Improvement</h3>
              <div className="space-y-3">
                {chartData.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-600 font-bold">{index + 1}.</span>
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  const seoContent = (
      <SEOContent title="Financial Health Tips"
      description="Assess your overall financial health with a comprehensive score based on key financial metrics."
      sections={[
        { title: "Review Regularly", content: "Review your financial health regularly." },
        { title: "Focus on Weaknesses", content: "Focus on areas with lowest scores first." },
        { title: "Set Goals", content: "Set specific financial goals." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<FinancialHealthInputs>
      title="Financial Health Score Calculator"
      description="Assess your overall financial health with a comprehensive score based on key financial metrics."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      charts={charts}
      seoContent={seoContent}
    />
  );
}
