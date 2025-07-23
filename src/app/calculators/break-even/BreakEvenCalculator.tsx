"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { SimpleBarChart } from '@/components/ui/enhanced-charts';
import { Tabs } from '@/components/ui/tabs';
import { parseRobustNumber } from '@/lib/utils/number';

const initialValues = {
  fixedCost: 100000,
  variableCostPerUnit: 50,
  sellingPricePerUnit: 150,
  targetProfit: 50000,
  currentSales: 0
};

interface BreakEvenInputs {
  fixedCost: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  targetProfit: number;
  currentSales: number;
}

function calculateBreakEven(inputs: BreakEvenInputs) {
  // Use parseRobustNumber for flexible input handling
  const fixedCost = Math.abs(parseRobustNumber(inputs.fixedCost)) || 100000;
  const variableCostPerUnit = Math.abs(parseRobustNumber(inputs.variableCostPerUnit)) || 50;
  const sellingPricePerUnit = Math.abs(parseRobustNumber(inputs.sellingPricePerUnit)) || 150;
  const targetProfit = Math.abs(parseRobustNumber(inputs.targetProfit)) || 0;
  const currentSales = Math.abs(parseRobustNumber(inputs.currentSales)) || 0;

  // Ensure selling price is greater than variable cost
  const effectiveSellingPrice = Math.max(sellingPricePerUnit, variableCostPerUnit + 1);
  
  const contributionMargin = effectiveSellingPrice - variableCostPerUnit;
  const contributionMarginRatio = (contributionMargin / effectiveSellingPrice) * 100;
  
  // Break-even calculations
  const breakEvenUnits = contributionMargin > 0 ? fixedCost / contributionMargin : 0;
  const breakEvenRevenue = breakEvenUnits * effectiveSellingPrice;
  
  // Target profit calculations
  const unitsForTargetProfit = contributionMargin > 0 ? (fixedCost + targetProfit) / contributionMargin : 0;
  const revenueForTargetProfit = unitsForTargetProfit * effectiveSellingPrice;
  
  // Current position analysis
  const currentRevenue = currentSales * effectiveSellingPrice;
  const currentVariableCost = currentSales * variableCostPerUnit;
  const currentTotalCost = fixedCost + currentVariableCost;
  const currentProfit = currentRevenue - currentTotalCost;
  
  // Safety margin
  const safetyMargin = currentSales > 0 && breakEvenUnits > 0 ? ((currentSales - breakEvenUnits) / currentSales) * 100 : 0;
  
  // Additional units needed
  const additionalUnitsNeeded = Math.max(0, breakEvenUnits - currentSales);
  const additionalUnitsForProfit = Math.max(0, unitsForTargetProfit - currentSales);

  return {
    breakEvenUnits: Math.round(breakEvenUnits * 100) / 100,
    breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
    contributionMargin: Math.round(contributionMargin * 100) / 100,
    contributionMarginRatio: Math.round(contributionMarginRatio * 100) / 100,
    unitsForTargetProfit: Math.round(unitsForTargetProfit * 100) / 100,
    revenueForTargetProfit: Math.round(revenueForTargetProfit * 100) / 100,
    currentRevenue: Math.round(currentRevenue * 100) / 100,
    currentTotalCost: Math.round(currentTotalCost * 100) / 100,
    currentProfit: Math.round(currentProfit * 100) / 100,
    safetyMargin: Math.round(safetyMargin * 100) / 100,
    additionalUnitsNeeded: Math.round(additionalUnitsNeeded * 100) / 100,
    additionalUnitsForProfit: Math.round(additionalUnitsForProfit * 100) / 100
  };
}

export default function BreakEvenCalculator() {
  const [values, setValues] = useState<BreakEvenInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('calculator');

  const { currency } = useCurrency();

  const breakEvenResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases gracefully
      const calculation = calculateBreakEven(values);
      return calculation;
    } catch (err: any) {
      console.error('Break-even calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Fixed Costs',
      name: 'fixedCost',
      type: 'number',
      placeholder: '100,000',
      unit: currency.symbol,
      tooltip: 'Costs that do not change with the level of output (e.g., rent, salaries, insurance)'
    },
    {
      label: 'Variable Cost Per Unit',
      name: 'variableCostPerUnit',
      type: 'number',
      placeholder: '50',
      unit: currency.symbol,
      tooltip: 'Cost incurred per unit of production (e.g., raw materials, direct labor)'
    },
    {
      label: 'Selling Price Per Unit',
      name: 'sellingPricePerUnit',
      type: 'number',
      placeholder: '150',
      unit: currency.symbol,
      tooltip: 'Price at which each unit is sold to customers'
    },
    {
      label: 'Target Profit',
      name: 'targetProfit',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      tooltip: 'Desired profit amount (optional)'
    },
    {
      label: 'Current Sales (Units)',
      name: 'currentSales',
      type: 'number',
      placeholder: '0',
      tooltip: 'Current number of units sold (for analysis)'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!breakEvenResults) return [];

    return [
      {
        label: 'Break-even Point (Units)',
        value: breakEvenResults.breakEvenUnits,
        type: 'number',
        highlight: true,
        tooltip: 'Number of units that must be sold to cover all costs'
      },
      {
        label: 'Break-even Revenue',
        value: breakEvenResults.breakEvenRevenue,
        type: 'currency',
        tooltip: 'Total revenue needed to cover all costs'
      },
      {
        label: 'Contribution Margin',
        value: breakEvenResults.contributionMargin,
        type: 'currency',
        tooltip: 'Amount each unit contributes to covering fixed costs'
      },
      {
        label: 'Contribution Margin %',
        value: breakEvenResults.contributionMarginRatio,
        type: 'percentage',
        tooltip: 'Contribution margin as percentage of selling price'
      },
      {
        label: 'Units for Target Profit',
        value: breakEvenResults.unitsForTargetProfit,
        type: 'number',
        tooltip: 'Units needed to achieve target profit'
      },
      {
        label: 'Revenue for Target Profit',
        value: breakEvenResults.revenueForTargetProfit,
        type: 'currency',
        tooltip: 'Revenue needed to achieve target profit'
      }
    ];
  }, [breakEvenResults]);

  // Prepare data for analysis charts
  const analysisData = useMemo(() => {
    if (!breakEvenResults) return [];
    
    return [
      {
        label: 'Fixed Costs',
        value: values.fixedCost
      },
      {
        label: 'Variable Costs (Break-even)',
        value: breakEvenResults.breakEvenUnits * values.variableCostPerUnit
      },
      {
        label: 'Break-even Revenue',
        value: breakEvenResults.breakEvenRevenue
      }
    ];
  }, [breakEvenResults, values]);

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
    { id: 'analysis', label: 'Cost Analysis', icon: '📊' },
    { id: 'scenarios', label: 'Scenario Analysis', icon: '📈' }
  ];

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Break-even Formula</h3>
        <div className="bg-neutral-50 rounded-lg p-3 text-sm">
          <p className="font-medium mb-2">Break-even Point (Units) =</p>
          <p className="text-center">Fixed Costs ÷ Contribution Margin</p>
          <hr className="my-2" />
          <p className="font-medium mb-2">Contribution Margin =</p>
          <p className="text-center">Selling Price - Variable Cost</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Break-even Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Understand your fixed and variable costs clearly</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Lowering fixed costs reduces the break-even point</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Increasing selling price or reducing variable costs helps</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Monitor your safety margin regularly</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Break-even Point Calculator"
      description="Determine the sales volume (units or revenue) needed to cover all your costs and start making a profit."
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
          title="Break-even Details"
          description="Enter your cost and pricing information."
          fields={fields}
          values={values}
          onChange={handleChange}
          onCalculate={handleCalculate}
          results={breakEvenResults ? results : []}
          loading={loading}
          error={calculationError}
          showComparison={false}
        />
      )}

      {activeTab === 'analysis' && breakEvenResults && (
        <div className="space-y-6">
          <SimpleBarChart
            data={analysisData}
            title="Cost and Revenue Analysis"
            height={300}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Structure</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fixed Costs:</span>
                  <span className="font-medium">{currency.symbol}{values.fixedCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Variable Cost/Unit:</span>
                  <span className="font-medium">{currency.symbol}{values.variableCostPerUnit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selling Price/Unit:</span>
                  <span className="font-medium">{currency.symbol}{values.sellingPricePerUnit.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-600">Contribution Margin:</span>
                  <span className="font-medium text-green-600">
                    {currency.symbol}{breakEvenResults.contributionMargin.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Break-even Units:</span>
                  <span className="font-medium">{breakEvenResults.breakEvenUnits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Break-even Revenue:</span>
                  <span className="font-medium">{currency.symbol}{breakEvenResults.breakEvenRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contribution Margin %:</span>
                  <span className="font-medium">{breakEvenResults.contributionMarginRatio.toFixed(1)}%</span>
                </div>
                {values.currentSales > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Safety Margin:</span>
                    <span className={`font-medium ${breakEvenResults.safetyMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {breakEvenResults.safetyMargin.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenarios' && breakEvenResults && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scenario 1: Reduce Fixed Costs by 20% */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Reduce Fixed Costs by 20%</h4>
                <div className="text-sm space-y-1">
                  <p>New Fixed Costs: {currency.symbol}{(values.fixedCost * 0.8).toLocaleString()}</p>
                  <p>New Break-even: {Math.round((values.fixedCost * 0.8) / breakEvenResults.contributionMargin).toLocaleString()} units</p>
                  <p className="text-blue-700 font-medium">
                    Reduction: {Math.round(breakEvenResults.breakEvenUnits - (values.fixedCost * 0.8) / breakEvenResults.contributionMargin).toLocaleString()} units
                  </p>
                </div>
              </div>
              
              {/* Scenario 2: Increase Price by 10% */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Increase Price by 10%</h4>
                <div className="text-sm space-y-1">
                  <p>New Price: {currency.symbol}{(values.sellingPricePerUnit * 1.1).toLocaleString()}</p>
                  <p>New Contribution: {currency.symbol}{(values.sellingPricePerUnit * 1.1 - values.variableCostPerUnit).toLocaleString()}</p>
                  <p className="text-green-700 font-medium">
                    New Break-even: {Math.round(values.fixedCost / (values.sellingPricePerUnit * 1.1 - values.variableCostPerUnit)).toLocaleString()} units
                  </p>
                </div>
              </div>
              
              {/* Scenario 3: Reduce Variable Costs by 15% */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Reduce Variable Costs by 15%</h4>
                <div className="text-sm space-y-1">
                  <p>New Variable Cost: {currency.symbol}{(values.variableCostPerUnit * 0.85).toLocaleString()}</p>
                  <p>New Contribution: {currency.symbol}{(values.sellingPricePerUnit - values.variableCostPerUnit * 0.85).toLocaleString()}</p>
                  <p className="text-purple-700 font-medium">
                    New Break-even: {Math.round(values.fixedCost / (values.sellingPricePerUnit - values.variableCostPerUnit * 0.85)).toLocaleString()} units
                  </p>
                </div>
              </div>
            </div>
          </div>

          {values.currentSales > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Position Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Current Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current Sales:</span>
                      <span>{values.currentSales.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Revenue:</span>
                      <span>{currency.symbol}{breakEvenResults.currentRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Profit:</span>
                      <span className={breakEvenResults.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {currency.symbol}{breakEvenResults.currentProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Gap Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Units to Break-even:</span>
                      <span>{breakEvenResults.additionalUnitsNeeded.toLocaleString()} more</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Units for Target Profit:</span>
                      <span>{breakEvenResults.additionalUnitsForProfit.toLocaleString()} more</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safety Margin:</span>
                      <span className={breakEvenResults.safetyMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {breakEvenResults.safetyMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </CalculatorLayout>
  );
}