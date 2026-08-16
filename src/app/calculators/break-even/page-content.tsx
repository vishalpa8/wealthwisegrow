"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";

interface BreakEvenInputs {
  fixedCost: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  targetProfit: number;
  currentSales: number;
}

const initialValues: BreakEvenInputs = {
  fixedCost: 100000,
  variableCostPerUnit: 50,
  sellingPricePerUnit: 150,
  targetProfit: 50000,
  currentSales: 0
};

export function BreakEvenContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
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
  ], [currency.symbol]);

  const calculate = (inputs: BreakEvenInputs) => {
    const fixedCost = Math.abs(parseRobustNumber(inputs.fixedCost)) || 100000;
    const variableCostPerUnit = Math.abs(parseRobustNumber(inputs.variableCostPerUnit)) || 50;
    const sellingPricePerUnit = Math.abs(parseRobustNumber(inputs.sellingPricePerUnit)) || 150;
    const targetProfit = Math.abs(parseRobustNumber(inputs.targetProfit)) || 0;
    const currentSales = Math.abs(parseRobustNumber(inputs.currentSales)) || 0;

    const effectiveSellingPrice = Math.max(sellingPricePerUnit, variableCostPerUnit + 1);
    const contributionMargin = effectiveSellingPrice - variableCostPerUnit;
    const contributionMarginRatio = (contributionMargin / effectiveSellingPrice) * 100;
    
    const breakEvenUnits = contributionMargin > 0 ? fixedCost / contributionMargin : 0;
    const breakEvenRevenue = breakEvenUnits * effectiveSellingPrice;
    const unitsForTargetProfit = contributionMargin > 0 ? (fixedCost + targetProfit) / contributionMargin : 0;
    const revenueForTargetProfit = unitsForTargetProfit * effectiveSellingPrice;
    
    const results: CalculatorResult[] = [
      {
        label: 'Break-even Point (Units)',
        value: breakEvenUnits,
        type: 'number',
        highlight: true,
        tooltip: 'Number of units that must be sold to cover all costs'
      },
      {
        label: 'Break-even Revenue',
        value: breakEvenRevenue,
        type: 'currency',
        tooltip: 'Total revenue needed to cover all costs'
      },
      {
        label: 'Contribution Margin',
        value: contributionMargin,
        type: 'currency',
        tooltip: 'Amount each unit contributes to covering fixed costs'
      },
      {
        label: 'Contribution Margin %',
        value: contributionMarginRatio,
        type: 'percentage',
        tooltip: 'Contribution margin as percentage of selling price'
      },
      {
        label: 'Units for Target Profit',
        value: unitsForTargetProfit,
        type: 'number',
        tooltip: 'Units needed to achieve target profit'
      },
      {
        label: 'Revenue for Target Profit',
        value: revenueForTargetProfit,
        type: 'currency',
        tooltip: 'Revenue needed to achieve target profit'
      }
    ];
    return { results };
  };

  const sidebar = (
    <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );

  return (
    <BaseCalculatorTemplate<BreakEvenInputs>
      title="Business Break-Even Point & Profitability Calculator"
      description="Determine the sales volume (units or revenue) needed to cover all your costs and start making a profit."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      sidebar={sidebar}
    />
  );
}
