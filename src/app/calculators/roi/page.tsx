'use client';

import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { secureCalculation } from '@/lib/security';

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

function calculateROI(inputs: typeof initialValues): ROIResults {
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
  const recurringRevenue = revenueType === 'recurring' ? monthlyRevenue * projectDuration : 0;
  const totalRevenue = recurringRevenue + oneTimeRevenue;

  // Calculate total costs
  const totalOperatingCosts = operatingCosts * projectDuration;
  const totalMaintenanceCosts = maintenanceCosts * projectDuration;
  const totalCosts = totalOperatingCosts + totalMaintenanceCosts;

  // Calculate net profit before tax
  const netProfitBeforeTax = totalRevenue - totalCosts + salvageValue - initialInvestment;
  const taxAmount = Math.max(0, netProfitBeforeTax * (taxRate / 100));
  const netProfit = netProfitBeforeTax - taxAmount;

  // Calculate ROI
  const roi = (netProfit / initialInvestment) * 100;
  const roiAfterTax = ((netProfit - taxAmount) / initialInvestment) * 100;

  // Calculate annualized ROI
  const annualizedROI = (Math.pow(1 + roi / 100, 12 / projectDuration) - 1) * 100;

  // Calculate payback period (in months)
  const monthlyNetCashFlow = (totalRevenue - totalCosts) / projectDuration;
  const paybackPeriod = initialInvestment / monthlyNetCashFlow;

  // Calculate NPV
  const monthlyRate = discountRate / 12 / 100;
  let npv = -initialInvestment;
  for (let i = 1; i <= projectDuration; i++) {
    npv += monthlyNetCashFlow / Math.pow(1 + monthlyRate, i);
  }
  npv += salvageValue / Math.pow(1 + monthlyRate, projectDuration);

  // Calculate IRR using iterative method
  let irr = 0;
  let step = 0.1;
  let iteration = 0;
  const maxIterations = 100;

  while (iteration < maxIterations) {
    let npvAtRate = -initialInvestment;
    const rate = irr / 12 / 100;

    for (let i = 1; i <= projectDuration; i++) {
      npvAtRate += monthlyNetCashFlow / Math.pow(1 + rate, i);
    }
    npvAtRate += salvageValue / Math.pow(1 + rate, projectDuration);

    if (Math.abs(npvAtRate) < 0.1) break;
    if (npvAtRate > 0) irr += step;
    else irr -= step;
    step /= 2;
    iteration++;
  }

  // Calculate Profitability Index
  const profitabilityIndex = (npv + initialInvestment) / initialInvestment;

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
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Initial Investment',
      name: 'initialInvestment',
      type: 'number',
      placeholder: '100000',
      min: 1,
      required: true,
      tooltip: 'Total upfront investment amount'
    },
    {
      label: 'Project Duration (Months)',
      name: 'projectDuration',
      type: 'number',
      placeholder: '12',
      min: 1,
      max: 360,
      required: true,
      tooltip: 'Duration of the investment project'
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
      placeholder: values.revenueType === 'recurring' ? '15000' : '100000',
      min: 0,
      required: true,
      tooltip: values.revenueType === 'recurring' ? 'Expected monthly revenue' : 'Expected one-time revenue'
    },
    {
      label: 'Monthly Operating Costs',
      name: 'operatingCosts',
      type: 'number',
      placeholder: '5000',
      min: 0,
      required: true,
      tooltip: 'Regular operating expenses'
    },
    {
      label: 'Monthly Maintenance Costs',
      name: 'maintenanceCosts',
      type: 'number',
      placeholder: '1000',
      min: 0,
      required: true,
      tooltip: 'Regular maintenance and upkeep costs'
    },
    {
      label: 'Salvage Value',
      name: 'salvageValue',
      type: 'number',
      placeholder: '0',
      min: 0,
      tooltip: 'Expected value at end of project'
    },
    {
      label: 'Discount Rate (%)',
      name: 'discountRate',
      type: 'percentage',
      placeholder: '10',
      min: 0,
      max: 100,
      step: 0.1,
      required: true,
      tooltip: 'Rate used to calculate present value'
    },
    {
      label: 'Tax Rate (%)',
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

  const results = useMemo(() => {
    try {
      setError('');

      // Validate inputs
      if (values.initialInvestment <= 0) {
        setError('Initial investment must be greater than zero');
        return [];
      }

      const result = secureCalculation(
        'roi',
        values,
        () => calculateROI(values)
      );

      if (!result) {
        setError('Calculation failed. Please verify your inputs.');
        return [];
      }

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Return on Investment (ROI)',
          value: result.roi,
          type: 'percentage',
          highlight: true,
          tooltip: 'Total return on investment percentage'
        },
        {
          label: 'ROI After Tax',
          value: result.roiAfterTax,
          type: 'percentage',
          tooltip: 'ROI after considering tax implications'
        },
        {
          label: 'Annualized ROI',
          value: result.annualizedROI,
          type: 'percentage',
          tooltip: 'ROI expressed as an annual rate'
        },
        {
          label: 'Payback Period',
          value: result.paybackPeriod,
          type: 'number',
          tooltip: 'Months needed to recover initial investment'
        },
        {
          label: 'Net Present Value (NPV)',
          value: result.npv,
          type: 'currency',
          tooltip: 'Present value of all cash flows'
        },
        {
          label: 'Internal Rate of Return (IRR)',
          value: result.irr,
          type: 'percentage',
          tooltip: 'Rate at which NPV equals zero'
        },
        {
          label: 'Profitability Index',
          value: result.profitabilityIndex,
          type: 'number',
          tooltip: 'Ratio of NPV to initial investment'
        },
        {
          label: 'Total Revenue',
          value: result.totalRevenue,
          type: 'currency',
          tooltip: 'Total revenue over project duration'
        },
        {
          label: 'Total Costs',
          value: result.totalCosts,
          type: 'currency',
          tooltip: 'Total costs over project duration'
        },
        {
          label: 'Net Profit',
          value: result.netProfit,
          type: 'currency',
          tooltip: 'Total profit after all costs'
        },
        {
          label: 'Tax Amount',
          value: result.taxAmount,
          type: 'currency',
          tooltip: 'Total tax payable on profits'
        }
      ];

      return calculatorResults;
    } catch (err) {
      console.error('ROI calculation error:', err);
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Return on Investment (ROI) Calculator"
        description="Calculate ROI, payback period, NPV, and other key metrics to evaluate your investment or project."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={results}
        loading={loading}
        error={error}
        showComparison={true}
      />
    </div>
  );
}
