"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateInvestment } from '@/lib/calculations/investment';
import { InvestmentInputs } from '@/lib/validations/calculator';
import { SimpleLineChart, SimplePieChart, InvestmentGrowthChart, SimpleBarChart } from '@/components/ui/enhanced-charts';
import { ScenarioComparison } from '@/components/ui/scenario-comparison';
import { Tabs } from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';

const initialValues: InvestmentInputs = {
  initialAmount: 100000,
  monthlyContribution: 10000,
  annualReturn: 12,
  years: 10,
  compoundingFrequency: 'monthly'
};

export default function EnhancedInvestmentCalculatorPage() {
  const [values, setValues] = useState<InvestmentInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('calculator');
  const [comparisonScenarios, setComparisonScenarios] = useState<any[]>([]);

  const { currency } = useCurrency();

  const investmentResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      if (values.initialAmount < 0) {
        throw new Error('Initial amount cannot be negative');
      }
      if (values.monthlyContribution < 0) {
        throw new Error('Monthly contribution cannot be negative');
      }
      if (values.annualReturn < 0) {
        throw new Error('Annual return cannot be negative');
      }
      if (values.years <= 0) {
        throw new Error('Investment period must be greater than zero');
      }

      return calculateInvestment(values);
    } catch (err: any) {
      console.error('Investment calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Initial Investment',
      name: 'initialAmount',
      type: 'number',
      placeholder: '100,000',
      unit: currency.symbol,
      min: 0,
      max: 100000000,
      required: true,
      tooltip: 'One-time initial investment amount'
    },
    {
      label: 'Monthly Contribution',
      name: 'monthlyContribution',
      type: 'number',
      placeholder: '10,000',
      unit: currency.symbol,
      min: 0,
      max: 1000000,
      required: true,
      tooltip: 'Amount you plan to invest every month'
    },
    {
      label: 'Expected Annual Return',
      name: 'annualReturn',
      type: 'percentage',
      placeholder: '12',
      min: 0,
      max: 50,
      step: 0.1,
      required: true,
      tooltip: 'Expected annual return rate from your investments'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '10',
      min: 1,
      max: 50,
      unit: 'years',
      required: true,
      tooltip: 'Number of years you plan to invest'
    },
    {
      label: 'Compounding Frequency',
      name: 'compoundingFrequency',
      type: 'select',
      options: [
        { value: 'annually', label: 'Annually' },
        { value: 'semiannually', label: 'Semi-annually' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'daily', label: 'Daily' }
      ],
      required: true,
      tooltip: 'How often returns are compounded'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!investmentResults) return [];

    return [
      {
        label: 'Final Amount',
        value: investmentResults.finalAmount,
        type: 'currency',
        highlight: true,
        tooltip: 'Total value of your investment at maturity'
      },
      {
        label: 'Total Contributions',
        value: investmentResults.totalContributions,
        type: 'currency',
        tooltip: 'Total amount you will invest over the period'
      },
      {
        label: 'Total Growth',
        value: investmentResults.totalGrowth,
        type: 'currency',
        tooltip: 'Total returns earned from your investments'
      },
      {
        label: 'Annualized Return',
        value: investmentResults.annualizedReturn,
        type: 'percentage',
        tooltip: 'Effective annual return rate achieved'
      },
      {
        label: 'Return Multiple',
        value: investmentResults.finalAmount / investmentResults.totalContributions,
        type: 'number',
        tooltip: 'How many times your investment will grow'
      }
    ];
  }, [investmentResults]);

  // Prepare data for visualizations
  const pieChartData = useMemo(() => {
    if (!investmentResults) return [];
    return [
      {
        label: "Total Contributions",
        value: investmentResults.totalContributions,
        color: "#3b82f6"
      },
      {
        label: "Investment Growth",
        value: investmentResults.totalGrowth,
        color: "#10b981"
      }
    ];
  }, [investmentResults]);

  // Generate monthly growth data for line chart
  const monthlyGrowthData = useMemo(() => {
    if (!investmentResults) return [];
    
    const monthlyData = [];
    const monthlyRate = values.annualReturn / 100 / 12;
    let currentValue = values.initialAmount;
    
    for (let month = 0; month <= Math.min(values.years * 12, 120); month++) {
      if (month > 0) {
        currentValue += values.monthlyContribution;
        currentValue *= (1 + monthlyRate);
      }
      
      monthlyData.push({
        label: month === 0 ? 'Start' : `M${month}`,
        value: currentValue
      });
    }
    
    return monthlyData;
  }, [values, investmentResults]);

  // Prepare yearly breakdown for bar chart
  const yearlyComparisonData = useMemo(() => {
    if (!investmentResults) return [];
    
    return investmentResults.yearlyBreakdown.map(year => ({
      label: `Year ${year.year}`,
      value: year.endingBalance
    }));
  }, [investmentResults]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 500);
  };

  // Comparison functionality
  const addToComparison = () => {
    if (!investmentResults) return;
    
    const scenario = {
      id: uuidv4(),
      name: `${currency.symbol}${values.initialAmount.toLocaleString()} + ${currency.symbol}${values.monthlyContribution.toLocaleString()}/m @ ${values.annualReturn}%`,
      inputs: { ...values },
      results: results.map(r => ({ label: r.label, value: r.value, type: r.type }))
    };
    
    setComparisonScenarios(prev => [...prev, scenario]);
  };

  const removeFromComparison = (id: string) => {
    setComparisonScenarios(prev => prev.filter(s => s.id !== id));
  };

  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: '🧮' },
    { id: 'growth', label: 'Growth Analysis', icon: '📈' },
    { id: 'breakdown', label: 'Investment Breakdown', icon: '📊' },
    { id: 'yearly', label: 'Yearly Progress', icon: '📅' },
    { id: 'comparison', label: 'Compare Scenarios', icon: '⚖️' }
  ];

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Investment Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Diversify your investment portfolio</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Start investing early to maximize compounding</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Regular investments reduce market timing risk</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Review and rebalance periodically</p>
          </div>
        </div>
      </div>

      {investmentResults && (
        <div className="card">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Total Investment</h4>
              <p className="text-sm text-neutral-700">{currency.symbol}{investmentResults.totalContributions.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Expected Growth</h4>
              <p className="text-sm text-success-600 font-medium">{currency.symbol}{investmentResults.totalGrowth.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Growth Multiple</h4>
              <p className="text-sm text-blue-600 font-medium">
                {(investmentResults.finalAmount / investmentResults.totalContributions).toFixed(2)}x
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CalculatorLayout
      title="Enhanced Investment Calculator"
      description="Calculate investment growth with detailed visualizations, yearly breakdowns, and scenario comparisons."
      sidebar={sidebar}
    >
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <EnhancedCalculatorForm
            title="Investment Details"
            description="Enter your investment parameters to see projected growth."
            fields={fields}
            values={values}
            onChange={handleChange}
            onCalculate={handleCalculate}
            results={investmentResults ? results : []}
            loading={loading}
            error={calculationError}
            showComparison={false}
          />
          
          {investmentResults && (
            <div className="flex justify-center">
              <button
                onClick={addToComparison}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Comparison
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'growth' && investmentResults && (
        <div className="space-y-6">
          <SimpleLineChart
            data={monthlyGrowthData}
            title="Investment Growth Over Time"
            height={300}
            showValues={false}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Milestones</h3>
              <div className="space-y-3">
                {[1, 2, 5, 10].filter(year => year <= values.years).map(year => {
                  const yearData = investmentResults.yearlyBreakdown.find(y => y.year === year);
                  if (!yearData) return null;
                  
                  return (
                    <div key={year} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Year {year}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {currency.symbol}{yearData.endingBalance.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Growth: {currency.symbol}{yearData.cumulativeGrowth.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compounding Effect</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {currency.symbol}{investmentResults.totalGrowth.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Growth from Compounding</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-blue-600 mb-2">
                    {investmentResults.annualizedReturn.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">Effective Annual Return</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'breakdown' && investmentResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimplePieChart
            data={pieChartData}
            title="Investment vs Growth"
            showPercentages={true}
          />
          <InvestmentGrowthChart
            yearlyData={investmentResults.yearlyBreakdown.map(year => ({
              year: year.year,
              principal: year.cumulativeContributions,
              interest: year.cumulativeGrowth,
              total: year.endingBalance
            }))}
            title="Cumulative Investment vs Growth"
          />
        </div>
      )}

      {activeTab === 'yearly' && investmentResults && (
        <div className="space-y-6">
          <SimpleBarChart
            data={yearlyComparisonData}
            title="Year-wise Investment Value"
            height={300}
          />
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Yearly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Year</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700">Starting Balance</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700">Contributions</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700">Growth</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700">Ending Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {investmentResults.yearlyBreakdown.map((year, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-900">{year.year}</td>
                      <td className="py-3 px-2 text-right text-gray-900">
                        {currency.symbol}{year.startingBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right text-blue-600">
                        {currency.symbol}{year.contributions.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right text-green-600">
                        {currency.symbol}{year.growth.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-900 font-medium">
                        {currency.symbol}{year.endingBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <ScenarioComparison
          scenarios={comparisonScenarios}
          onAddScenario={addToComparison}
          onRemoveScenario={removeFromComparison}
          title="Investment Scenario Comparison"
          maxScenarios={4}
        />
      )}
    </CalculatorLayout>
  );
}