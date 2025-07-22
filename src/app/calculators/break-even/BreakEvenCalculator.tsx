"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";

const initialValues = {
  fixedCost: 100000,
  variableCostPerUnit: 50,
  sellingPricePerUnit: 150,
};

interface BreakEvenInputs {
  fixedCost: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
}

function calculateBreakEven(inputs: BreakEvenInputs) {
  const { fixedCost, variableCostPerUnit, sellingPricePerUnit } = inputs;

  if (sellingPricePerUnit <= variableCostPerUnit) {
    throw new Error('Selling price must be greater than variable cost per unit');
  }
  if (fixedCost < 0 || variableCostPerUnit < 0 || sellingPricePerUnit < 0) {
    throw new Error('Costs and prices cannot be negative.');
  }

  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  const breakEvenUnits = fixedCost / contributionMargin;
  const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;

  return {
    breakEvenUnits: Math.round(breakEvenUnits * 100) / 100,
    breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
  };
}

export default function BreakEvenCalculator() {
  const [values, setValues] = useState<BreakEvenInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const breakEvenResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      return calculateBreakEven(values);
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
      min: 0,
      required: true,
      tooltip: 'Costs that do not change with the level of output (e.g., rent, salaries)'
    },
    {
      label: 'Variable Cost Per Unit',
      name: 'variableCostPerUnit',
      type: 'number',
      placeholder: '50',
      unit: currency.symbol,
      min: 0,
      required: true,
      tooltip: 'Cost incurred per unit of production (e.g., raw materials)'
    },
    {
      label: 'Selling Price Per Unit',
      name: 'sellingPricePerUnit',
      type: 'number',
      placeholder: '150',
      unit: currency.symbol,
      min: 0,
      required: true,
      tooltip: 'Price at which each unit is sold'
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
    ];
  }, [breakEvenResults, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Break-even Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Understand your fixed and variable costs.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Lowering fixed costs reduces the break-even point.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Increasing selling price or reducing variable costs helps.</p>
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
    </CalculatorLayout>
  );
}