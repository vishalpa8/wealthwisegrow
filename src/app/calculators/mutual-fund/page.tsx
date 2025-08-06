'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";


const initialValues = {
  investmentType: 'lumpsum',
  initialInvestment: 100000,
  monthlyInvestment: 10000,
  startDate: '',
  endDate: '',
  purchaseNav: 10,
  currentNav: 12,
  entryLoad: 0,
  exitLoad: 0,
  taxBracket: 'none'
};

interface MutualFundInputs {
  investmentType: string;
  initialInvestment: number;
  monthlyInvestment: number;
  startDate: string;
  endDate: string;
  purchaseNav: number;
  currentNav: number;
  entryLoad: number;
  exitLoad: number;
  taxBracket: string;
}

function calculateReturns(inputs: MutualFundInputs) {
  const {
    investmentType,
    initialInvestment,
    monthlyInvestment,
    startDate,
    endDate,
    purchaseNav,
    currentNav,
    entryLoad,
    exitLoad,
    taxBracket
  } = inputs;

  const startDateTime = new Date(startDate).getTime();
  const endDateTime = endDate ? new Date(endDate).getTime() : Date.now();
  const durationInYears = (endDateTime - startDateTime) / (365.25 * 24 * 60 * 60 * 1000);

  let totalInvestment = 0;
  let units = 0;
  let currentValue = 0;
  let absoluteReturns = 0;
  let cagr = 0;

  if (investmentType === 'lumpsum') {
    // Calculate for lumpsum investment
    const investmentAfterLoad = initialInvestment * (1 - entryLoad / 100);
    units = investmentAfterLoad / purchaseNav;
    currentValue = units * currentNav * (1 - exitLoad / 100);
    totalInvestment = initialInvestment;
  } else {
    // Calculate for SIP investment - use more accurate month calculation
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate || Date.now());
    
    // Calculate months more accurately
    let totalMonths = (endDateObj.getFullYear() - startDateObj.getFullYear()) * 12;
    totalMonths += endDateObj.getMonth() - startDateObj.getMonth();
    
    // If the end date's day is before the start date's day, subtract a month
    if (endDateObj.getDate() < startDateObj.getDate()) {
      totalMonths--;
    }
    
    // Ensure non-negative months
    totalMonths = Math.max(0, totalMonths);
    
    for (let i = 0; i < totalMonths; i++) {
      const monthlyInvestmentAfterLoad = monthlyInvestment * (1 - entryLoad / 100);
      units += monthlyInvestmentAfterLoad / purchaseNav;
      totalInvestment += monthlyInvestment;
    }
    currentValue = units * currentNav * (1 - exitLoad / 100);
  }

  absoluteReturns = totalInvestment > 0 ? ((currentValue - totalInvestment) / totalInvestment) * 100 : 0;
  cagr = (totalInvestment > 0 && durationInYears > 0) ? 
    (Math.pow(currentValue / totalInvestment, 1 / durationInYears) - 1) * 100 : 0;

  // Calculate tax implications
  const taxRate = parseInt(taxBracket) || 0;
  const gains = currentValue - totalInvestment;
  const taxAmount = (gains * taxRate) / 100;
  const postTaxValue = currentValue - taxAmount;

  return {
    totalInvestment,
    units,
    currentValue,
    absoluteReturns,
    cagr,
    gains,
    taxAmount,
    postTaxValue,
    durationInYears
  };
}

export default function MutualFundCalculatorPage() {
  const [values, setValues] = useState<MutualFundInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const mutualFundResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases
      if (!values.startDate || new Date(values.startDate).toString() === 'Invalid Date') {
        // Don't throw an error, just return null to indicate no valid calculation yet
        return null;
      }

      return calculateReturns(values);
    } catch (err: any) {
      console.error('Mutual fund calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Investment Type',
      name: 'investmentType',
      type: 'select',
      options: [
        { value: 'lumpsum', label: 'Lumpsum Investment' },
        { value: 'sip', label: 'SIP Investment' }
      ],
      tooltip: 'Choose between one-time or regular monthly investments'
    },
    {
      label: 'Investment Start Date',
      name: 'startDate',
      type: 'date',
      tooltip: 'When did you start investing?'
    },
    {
      label: 'Investment End Date',
      name: 'endDate',
      type: 'date',
      tooltip: 'Leave blank for current date'
    },
    {
      label: values.investmentType === 'lumpsum' ? 'Investment Amount' : 'Monthly Investment',
      name: values.investmentType === 'lumpsum' ? 'initialInvestment' : 'monthlyInvestment',
      type: 'number',
      placeholder: values.investmentType === 'lumpsum' ? '1,00,000' : '10,000',
      unit: currency.symbol,
      tooltip: values.investmentType === 'lumpsum' ? 'One-time investment amount' : 'Monthly SIP amount'
    },
    {
      label: 'Purchase NAV',
      name: 'purchaseNav',
      type: 'number',
      placeholder: '10.00',
      unit: currency.symbol,
      step: 0.01,
      tooltip: 'NAV at which units were purchased'
    },
    {
      label: 'Current NAV',
      name: 'currentNav',
      type: 'number',
      placeholder: '12.00',
      unit: currency.symbol,
      step: 0.01,
      tooltip: 'Current NAV of the mutual fund'
    },
    {
      label: 'Entry Load (%)',
      name: 'entryLoad',
      type: 'percentage',
      placeholder: '0',
      step: 0.01,
      tooltip: 'Entry load charged by the fund (if any)'
    },
    {
      label: 'Exit Load (%)',
      name: 'exitLoad',
      type: 'percentage',
      placeholder: '0',
      step: 0.01,
      tooltip: 'Exit load charged by the fund (if any)'
    },
    {
      label: 'Tax Bracket',
      name: 'taxBracket',
      type: 'select',
      options: [
        { value: 'none', label: 'No Tax' },
        { value: '10', label: '10%' },
        { value: '20', label: '20%' },
        { value: '30', label: '30%' }
      ],
      tooltip: 'Your income tax bracket for gain calculation'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!mutualFundResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Current Value',
        value: mutualFundResults.currentValue,
        type: 'currency',
        highlight: true,
        tooltip: 'Current value of your investment'
      },
      {
        label: 'Total Investment',
        value: mutualFundResults.totalInvestment,
        type: 'currency',
        tooltip: 'Total amount invested'
      },
      {
        label: 'Total Units',
        value: mutualFundResults.units,
        type: 'number',
        tooltip: 'Number of units held'
      },
      {
        label: 'Absolute Returns',
        value: mutualFundResults.absoluteReturns,
        type: 'percentage',
        tooltip: 'Total returns without considering time period'
      },
      {
        label: 'CAGR',
        value: mutualFundResults.cagr,
        type: 'percentage',
        tooltip: 'Compounded Annual Growth Rate'
      },
      {
        label: 'Total Gains',
        value: mutualFundResults.gains,
        type: 'currency',
        tooltip: 'Profit earned on investment'
      }
    ];

    if (values.taxBracket !== 'none') {
      calculatorResults.push(
        {
          label: 'Tax Amount',
          value: mutualFundResults.taxAmount,
          type: 'currency',
          tooltip: 'Tax payable on gains'
        },
        {
          label: 'Post-tax Value',
          value: mutualFundResults.postTaxValue,
          type: 'currency',
          tooltip: 'Investment value after tax'
        }
      );
    }

    return calculatorResults;
  }, [mutualFundResults, values.taxBracket, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Mutual Fund Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Understand NAV and its impact on returns.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider expense ratios and loads before investing.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">SIPs help in rupee cost averaging.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Mutual Fund Returns Calculator"
      description="Calculate your mutual fund returns including CAGR, absolute returns, and tax implications."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Mutual Fund Details"
        description="Enter your mutual fund investment details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={mutualFundResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}