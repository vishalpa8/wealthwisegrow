'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import {
  parseRobustNumber,
  safeDivide,
  safeMultiply,
  safePower,
  safeAdd,
  safeSubtract,
  isEffectivelyZero
} from '@/lib/utils/number';

const initialValues = {
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

interface ROIResults {
  roi: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
  profitabilityIndex: number;
  annualizedROI: number;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  taxAmount: number;
  roiAfterTax: number;
}

function calculateROI(inputs: ROIInputs): ROIResults {
  const {
    initialInvestment,
    projectDuration,
    revenueType,
    monthlyRevenue,
    oneTimeRevenue,
    operatingCosts,
    maintenanceCosts,
    salvageValue,
    discountRate,
    taxRate
  } = inputs;

  // Calculate total revenue
  const recurringRevenue = revenueType === 'recurring' ? safeMultiply(monthlyRevenue, projectDuration) : 0;
  const totalRevenue = safeAdd(recurringRevenue, oneTimeRevenue);

  // Calculate total costs
  const totalOperatingCosts = safeMultiply(operatingCosts, projectDuration);
  const totalMaintenanceCosts = safeMultiply(maintenanceCosts, projectDuration);
  const totalCosts = safeAdd(totalOperatingCosts, totalMaintenanceCosts);

  // Calculate net profit before tax
  const netProfitBeforeTax = safeSubtract(safeAdd(safeSubtract(totalRevenue, totalCosts), salvageValue), initialInvestment);
  const taxAmount = safeMultiply(Math.max(0, netProfitBeforeTax), safeDivide(taxRate, 100));
  const netProfit = safeSubtract(netProfitBeforeTax, taxAmount);

  // Calculate ROI
  const roi = safeMultiply(safeDivide(netProfit, initialInvestment), 100);
  const roiAfterTax = safeMultiply(safeDivide(safeSubtract(netProfit, taxAmount), initialInvestment), 100);

  // Calculate annualized ROI
  const annualizedROI = safeMultiply(safeSubtract(safePower(safeAdd(1, safeDivide(roi, 100)), safeDivide(12, projectDuration)), 1), 100);

  // Calculate payback period (in months)
  const monthlyNetCashFlow = safeDivide(safeSubtract(totalRevenue, totalCosts), projectDuration);
  const paybackPeriod = safeDivide(initialInvestment, monthlyNetCashFlow);

  // Calculate NPV
  const monthlyRate = safeDivide(safeDivide(discountRate, 12), 100);
  let npv = -initialInvestment;
  for (let i = 1; i <= projectDuration; i++) {
    npv = safeAdd(npv, safeDivide(monthlyNetCashFlow, safePower(safeAdd(1, monthlyRate), i)));
  }
  npv = safeAdd(npv, safeDivide(salvageValue, safePower(safeAdd(1, monthlyRate), projectDuration)));

  // Calculate IRR using iterative method
  let irr = 0;
  let step = 0.1;
  let iteration = 0;
  const maxIterations = 100;

  while (iteration < maxIterations) {
    let npvAtRate = -initialInvestment;
    const rate = safeDivide(safeDivide(irr, 12), 100);

    for (let i = 1; i <= projectDuration; i++) {
      npvAtRate = safeAdd(npvAtRate, safeDivide(monthlyNetCashFlow, safePower(safeAdd(1, rate), i)));
    }
    npvAtRate = safeAdd(npvAtRate, safeDivide(salvageValue, safePower(safeAdd(1, rate), projectDuration)));

    if (Math.abs(npvAtRate) < 0.1) break;
    if (npvAtRate > 0) irr = safeAdd(irr, step);
    else irr = safeSubtract(irr, step);
    step = safeDivide(step, 2);
    iteration++;
  }

  // Calculate Profitability Index
  const profitabilityIndex = safeDivide(safeAdd(npv, initialInvestment), initialInvestment);

  return {
    roi,
    paybackPeriod,
    npv,
    irr,
    profitabilityIndex,
    annualizedROI,
    totalRevenue,
    totalCosts,
    netProfit,
    taxAmount,
    roiAfterTax
  };
}

export default function ROICalculatorPage() {
  const [values, setValues] = useState<ROIInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const roiResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Validate inputs
      if (values.initialInvestment <= 0) {
        throw new Error('Initial investment must be greater than zero');
      }
      if (values.projectDuration <= 0) {
        throw new Error('Project duration must be greater than zero');
      }
      if (values.discountRate < 0) {
        throw new Error('Discount rate cannot be negative');
      }
      if (values.taxRate < 0 || values.taxRate > 100) {
        throw new Error('Tax rate must be between 0 and 100');
      }

      const calculation = calculateROI(values);

      if (!isFinite(calculation.roi) || !isFinite(calculation.npv)) {
        throw new Error('Calculation overflow. Please use smaller values.');
      }

      return calculation;
    } catch (err: any) {
      console.error('ROI calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Initial Investment',
      name: 'initialInvestment',
      type: 'number',
      placeholder: '100,000',
      unit: currency.symbol,
      min: 1,
      required: true,
      tooltip: 'Total upfront investment amount'
    },
    {
      label: 'Project Duration',
      name: 'projectDuration',
      type: 'number',
      placeholder: '12',
      min: 1,
      max: 360,
      unit: 'months',
      required: true,
      tooltip: 'Duration of the investment project in months'
    },
    {
      label: 'Revenue Type',
      name: 'revenueType',
      type: 'select',
      options: [
        { value: 'recurring', label: 'Recurring Revenue' },
        { value: 'one-time', label: 'One-time Revenue' }
      ],
      required: true,
      tooltip: 'Choose between recurring or one-time revenue'
    },
    {
      label: values.revenueType === 'recurring' ? 'Monthly Revenue' : 'One-time Revenue',
      name: values.revenueType === 'recurring' ? 'monthlyRevenue' : 'oneTimeRevenue',
      type: 'number',
      placeholder: values.revenueType === 'recurring' ? '15,000' : '100,000',
      unit: currency.symbol,
      min: 0,
      required: true,
      tooltip: values.revenueType === 'recurring' ? 'Expected monthly revenue' : 'Expected one-time revenue'
    },
    {
      label: 'Monthly Operating Costs',
      name: 'operatingCosts',
      type: 'number',
      placeholder: '5,000',
      unit: currency.symbol,
      min: 0,
      required: true,
      tooltip: 'Regular operating expenses'
    },
    {
      label: 'Monthly Maintenance Costs',
      name: 'maintenanceCosts',
      type: 'number',
      placeholder: '1,000',
      unit: currency.symbol,
      min: 0,
      required: true,
      tooltip: 'Regular maintenance and upkeep costs'
    },
    {
      label: 'Salvage Value',
      name: 'salvageValue',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      min: 0,
      tooltip: 'Expected value at end of project'
    },
    {
      label: 'Discount Rate',
      name: 'discountRate',
      type: 'percentage',
      placeholder: '10',
      min: 0,
      max: 100,
      step: 0.1,
      required: true,
      tooltip: 'Rate used to calculate present value of future cash flows'
    },
    {
      label: 'Tax Rate',
      name: 'taxRate',
      type: 'percentage',
      placeholder: '20',
      min: 0,
      max: 100,
      step: 0.1,
      required: true,
      tooltip: 'Applicable tax rate on profits'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!roiResults) return [];

    return [
      {
        label: 'Return on Investment (ROI)',
        value: roiResults.roi,
        type: 'percentage',
        highlight: true,
        tooltip: 'Total return on investment percentage'
      },
      {
        label: 'ROI After Tax',
        value: roiResults.roiAfterTax,
        type: 'percentage',
        tooltip: 'ROI after considering tax implications'
      },
      {
        label: 'Annualized ROI',
        value: roiResults.annualizedROI,
        type: 'percentage',
        tooltip: 'ROI expressed as an annual rate'
      },
      {
        label: 'Payback Period',
        value: roiResults.paybackPeriod,
        type: 'number',
        tooltip: 'Months needed to recover initial investment'
      },
      {
        label: 'Net Present Value (NPV)',
        value: roiResults.npv,
        type: 'currency',
        tooltip: 'Present value of all cash flows'
      },
      {
        label: 'Internal Rate of Return (IRR)',
        value: roiResults.irr,
        type: 'percentage',
        tooltip: 'Rate at which NPV equals zero'
      },
      {
        label: 'Profitability Index',
        value: roiResults.profitabilityIndex,
        type: 'number',
        tooltip: 'Ratio of NPV to initial investment'
      },
      {
        label: 'Total Revenue',
        value: roiResults.totalRevenue,
        type: 'currency',
        tooltip: 'Total revenue over project duration'
      },
      {
        label: 'Total Costs',
        value: roiResults.totalCosts,
        type: 'currency',
        tooltip: 'Total costs over project duration'
      },
      {
        label: 'Net Profit',
        value: roiResults.netProfit,
        type: 'currency',
        tooltip: 'Total profit after all costs'
      },
      {
        label: 'Tax Amount',
        value: roiResults.taxAmount,
        type: 'currency',
        tooltip: 'Total tax payable on profits'
      }
    ];
  }, [roiResults, values.revenueType, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">ROI Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Higher ROI indicates a more profitable investment.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider both financial and non-financial returns.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">NPV and IRR provide deeper insights than simple ROI.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Return on Investment (ROI) Calculator"
      description="Calculate ROI, payback period, NPV, and other key metrics to evaluate your investment or project."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="ROI Details"
        description="Enter your investment or project details to calculate its return."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={roiResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}