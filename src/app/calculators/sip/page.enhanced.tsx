"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateSIP, SIPInputs } from '@/lib/calculations/savings';

import { SimpleLineChart, SimplePieChart, InvestmentGrowthChart } from '@/components/ui/enhanced-charts';
import { ScenarioComparison } from '@/components/ui/scenario-comparison';
import { Tabs } from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';

const initialValues = {
  monthlyInvestment: 5000,
  annualReturn: 12,
  years: 10
};

export default function EnhancedSIPCalculatorPage() {
  const [values, setValues] = useState<SIPInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('calculator');
  const [comparisonScenarios, setComparisonScenarios] = useState<any[]>([]);

  const { currency } = useCurrency();

  const sipResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases
      const calculation = calculateSIP(values);
      
      if (calculation.error) {
        throw new Error(calculation.error);
      }

      return calculation;
    } catch (err: any) {
      console.error('SIP calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  // Generate yearly breakdown for visualization
  const yearlyBreakdown = useMemo(() => {
    if (!sipResults) return [];
    
    const monthlyRate = values.annualReturn / 100 / 12;
    const yearlyData = [];
    let cumulativeInvestment = 0;
    let cumulativeValue = 0;

    for (let year = 1; year <= values.years; year++) {
      const monthsCompleted = year * 12;
      cumulativeInvestment = values.monthlyInvestment * monthsCompleted;
      
      // Calculate future value up to this year
      if (monthlyRate === 0) {
        cumulativeValue = cumulativeInvestment;
      } else {
        cumulativeValue = values.monthlyInvestment * 
          ((Math.pow(1 + monthlyRate, monthsCompleted) - 1) / monthlyRate);
      }
      
      yearlyData.push({
        year,
        principal: cumulativeInvestment,
        interest: cumulativeValue - cumulativeInvestment,
        total: cumulativeValue
      });
    }
    
    return yearlyData;
  }, [values, sipResults]);

  // Generate monthly growth data for line chart
  const monthlyGrowthData = useMemo(() => {
    if (!sipResults) return [];
    
    const monthlyRate = values.annualReturn / 100 / 12;
    const monthlyData = [];
    
    for (let month = 1; month <= Math.min(values.years * 12, 60); month++) {
      const investment = values.monthlyInvestment * month;
      let value;
      
      if (monthlyRate === 0) {
        value = investment;
      } else {
        value = values.monthlyInvestment * 
          ((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate);
      }
      
      monthlyData.push({
        label: `M${month}`,
        value: value
      });
    }
    
    return monthlyData;
  }, [values, sipResults]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Monthly Investment',
      name: 'monthlyInvestment',
      type: 'number',
      placeholder: '5,000',
      unit: currency.symbol,
      tooltip: 'Amount you plan to invest every month through SIP'
    },
    {
      label: 'Expected Annual Return',
      name: 'annualReturn',
      type: 'percentage',
      placeholder: '12',
      tooltip: 'Expected annual return rate from your investments'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '10',
      unit: 'years',
      tooltip: 'Number of years you plan to continue the SIP'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!sipResults) return [];

    return [
      {
        label: 'Maturity Amount',
        value: sipResults.maturityAmount,
        type: 'currency',
        highlight: true,
        tooltip: 'Total amount you will receive at maturity'
      },
      {
        label: 'Total Investment',
        value: sipResults.totalInvestment,
        type: 'currency',
        tooltip: 'Total amount you will invest over the period'
      },
      {
        label: 'Total Returns',
        value: sipResults.totalGains,
        type: 'currency',
        tooltip: 'Profit earned from your investments'
      },
      {
        label: 'Effective Annual Return',
        value: ((sipResults.maturityAmount / sipResults.totalInvestment) ** (1 / values.years) - 1) * 100,
        type: 'percentage',
        tooltip: 'Annualized return rate considering compounding'
      },
      {
        label: 'Return Multiple',
        value: sipResults.maturityAmount / sipResults.totalInvestment,
        type: 'number',
        tooltip: 'How many times your investment will grow'
      }
    ];
  }, [sipResults, values.years]);

  // Prepare data for pie chart
  const pieChartData = useMemo(() => {
    if (!sipResults) return [];
    return [
      {
        label: "Total Investment",
        value: sipResults.totalInvestment,
        color: "#3b82f6"
      },
      {
        label: "Returns",
        value: sipResults.totalGains,
        color: "#10b981"
      }
    ];
  }, [sipResults]);

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
    if (!sipResults) return;
    
    const scenario = {
      id: uuidv4(),
      name: `SIP ${currency.symbol}${values.monthlyInvestment.toLocaleString()}/month @ ${values.annualReturn}% for ${values.years}Y`,
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
    { id: 'comparison', label: 'Compare Scenarios', icon: '⚖️' }
  ];

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">SIP Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">SIPs help in rupee cost averaging and reduce market timing risk.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Longer investment horizons generally yield better returns.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Regularly review your SIP performance and adjust as needed.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Start early to maximize the power of compounding.</p>
          </div>
        </div>
      </div>
      
      {sipResults && (
        <div className="card">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Monthly Investment</h4>
              <p className="text-sm text-neutral-700">{currency.symbol}{values.monthlyInvestment.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Total Investment</h4>
              <p className="text-sm text-neutral-700">{currency.symbol}{sipResults.totalInvestment.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Expected Returns</h4>
              <p className="text-sm text-success-600 font-medium">{currency.symbol}{sipResults.totalGains.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CalculatorLayout
      title="Enhanced SIP Calculator"
      description="Calculate the future value of your Systematic Investment Plan (SIP) investments with detailed visualizations and growth analysis."
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
            title="SIP Details"
            description="Enter your SIP investment details."
            fields={fields}
            values={values}
            onChange={handleChange}
            onCalculate={handleCalculate}
            results={sipResults ? results : []}
            loading={loading}
            error={calculationError}
            showComparison={false}
          />
          
          {sipResults && (
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

      {activeTab === 'growth' && sipResults && (
        <div className="space-y-6">
          <SimpleLineChart
            data={monthlyGrowthData}
            title="SIP Growth Over Time"
            height={300}
            showValues={false}
          />
          <InvestmentGrowthChart
            yearlyData={yearlyBreakdown}
            title="Yearly Investment vs Returns"
          />
        </div>
      )}

      {activeTab === 'breakdown' && sipResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimplePieChart
            data={pieChartData}
            title="Investment vs Returns"
            showPercentages={true}
          />
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-wise Breakdown</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {yearlyBreakdown.map((data, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Year {data.year}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {currency.symbol}{data.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Invested: {currency.symbol}{data.principal.toLocaleString()} | 
                      Returns: {currency.symbol}{data.interest.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <ScenarioComparison
          scenarios={comparisonScenarios}
          onAddScenario={addToComparison}
          onRemoveScenario={removeFromComparison}
          title="SIP Scenario Comparison"
          maxScenarios={4}
        />
      )}
    </CalculatorLayout>
  );
}