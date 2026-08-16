"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber, safeDivide, safeMultiply, safePower, safeAdd, safeSubtract } from "@/lib/utils/number";

interface ROIInputs {
  initialInvestment: number;
  projectDuration: number;
  revenueType: string;
  monthlyRevenue: number;
  oneTimeRevenue: number;
  operatingCosts: number;
  maintenanceCosts: number;
  salvageValue: number;
  discountRate: number;
  taxRate: number;
}

const initialValues: ROIInputs = {
  initialInvestment: 100000,
  projectDuration: 12,
  revenueType: 'recurring',
  monthlyRevenue: 15000,
  oneTimeRevenue: 0,
  operatingCosts: 5000,
  maintenanceCosts: 1000,
  salvageValue: 0,
  discountRate: 10,
  taxRate: 20
};

export default function ROICalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Initial Investment', name: 'initialInvestment', type: 'number', placeholder: '100,000', unit: currency.symbol },
    { label: 'Project Duration', name: 'projectDuration', type: 'number', placeholder: '12', unit: 'months' },
    { label: 'Revenue Type', name: 'revenueType', type: 'select', options: [{ value: 'recurring', label: 'Recurring Revenue' }, { value: 'one-time', label: 'One-time Revenue' }] },
    { label: 'Monthly Revenue', name: 'monthlyRevenue', type: 'number', placeholder: '15,000', unit: currency.symbol },
    { label: 'One-time Revenue', name: 'oneTimeRevenue', type: 'number', placeholder: '100,000', unit: currency.symbol },
    { label: 'Monthly Operating Costs', name: 'operatingCosts', type: 'number', placeholder: '5,000', unit: currency.symbol },
    { label: 'Monthly Maintenance Costs', name: 'maintenanceCosts', type: 'number', placeholder: '1,000', unit: currency.symbol },
    { label: 'Salvage Value', name: 'salvageValue', type: 'number', placeholder: '0', unit: currency.symbol },
    { label: 'Discount Rate', name: 'discountRate', type: 'percentage', placeholder: '10', step: 0.1 },
    { label: 'Tax Rate', name: 'taxRate', type: 'percentage', placeholder: '20', step: 0.1 }
  ];

  const calculate = (inputs: ROIInputs) => {
    const initialInvestment = Math.abs(parseRobustNumber(inputs.initialInvestment)) || 100000;
    const projectDuration = Math.max(1, Math.abs(parseRobustNumber(inputs.projectDuration)) || 12);
    const monthlyRevenue = Math.abs(parseRobustNumber(inputs.monthlyRevenue)) || 0;
    const oneTimeRevenue = Math.abs(parseRobustNumber(inputs.oneTimeRevenue)) || 0;
    const operatingCosts = Math.abs(parseRobustNumber(inputs.operatingCosts)) || 0;
    const maintenanceCosts = Math.abs(parseRobustNumber(inputs.maintenanceCosts)) || 0;
    const salvageValue = Math.abs(parseRobustNumber(inputs.salvageValue)) || 0;
    const discountRate = Math.abs(parseRobustNumber(inputs.discountRate)) || 0;
    const taxRate = Math.abs(parseRobustNumber(inputs.taxRate)) || 0;

    const recurringRevenue = inputs.revenueType === 'recurring' ? safeMultiply(monthlyRevenue, projectDuration) : 0;
    const totalRevenue = safeAdd(recurringRevenue, oneTimeRevenue);

    const totalOperatingCosts = safeMultiply(operatingCosts, projectDuration);
    const totalMaintenanceCosts = safeMultiply(maintenanceCosts, projectDuration);
    const totalCosts = safeAdd(totalOperatingCosts, totalMaintenanceCosts);

    const netProfitBeforeTax = safeSubtract(safeAdd(safeSubtract(totalRevenue, totalCosts), salvageValue), initialInvestment);
    const taxAmount = safeMultiply(Math.max(0, netProfitBeforeTax), safeDivide(taxRate, 100));
    const netProfit = safeSubtract(netProfitBeforeTax, taxAmount);

    const roi = safeMultiply(safeDivide(netProfit, initialInvestment), 100);
    const roiAfterTax = safeMultiply(safeDivide(safeSubtract(netProfit, taxAmount), initialInvestment), 100);

    const annualizedROI = safeMultiply(safeSubtract(safePower(safeAdd(1, safeDivide(roi, 100)), safeDivide(12, projectDuration)), 1), 100);

    const monthlyNetCashFlow = safeDivide(safeSubtract(totalRevenue, totalCosts), projectDuration);
    const paybackPeriod = safeDivide(initialInvestment, monthlyNetCashFlow);

    const monthlyRate = safeDivide(safeDivide(discountRate, 12), 100);
    let npv = -initialInvestment;
    for (let i = 1; i <= projectDuration; i++) {
      npv = safeAdd(npv, safeDivide(monthlyNetCashFlow, safePower(safeAdd(1, monthlyRate), i)));
    }
    npv = safeAdd(npv, safeDivide(salvageValue, safePower(safeAdd(1, monthlyRate), projectDuration)));

    const profitabilityIndex = safeDivide(safeAdd(npv, initialInvestment), initialInvestment);

    const results: CalculatorResult[] = [
      { label: 'Return on Investment (ROI)', value: roi, type: 'percentage', highlight: true },
      { label: 'ROI After Tax', value: roiAfterTax, type: 'percentage' },
      { label: 'Annualized ROI', value: annualizedROI, type: 'percentage' },
      { label: 'Payback Period', value: paybackPeriod, type: 'number' },
      { label: 'Net Present Value (NPV)', value: npv, type: 'currency' },
      { label: 'Profitability Index', value: profitabilityIndex, type: 'number' },
      { label: 'Net Profit', value: netProfit, type: 'currency' }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<ROIInputs>
      title="Simple Return on Investment (ROI) Calculator"
      description="Calculate ROI, payback period, NPV, and other key metrics to evaluate your investment or project."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
