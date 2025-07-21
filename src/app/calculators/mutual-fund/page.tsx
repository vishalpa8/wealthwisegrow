'use client';

import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { secureCalculation } from '@/lib/security';

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

function calculateReturns(inputs: typeof initialValues) {
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
    // Calculate for SIP investment
    const totalMonths = Math.floor(durationInYears * 12);
    for (let i = 0; i < totalMonths; i++) {
      const monthlyInvestmentAfterLoad = monthlyInvestment * (1 - entryLoad / 100);
      units += monthlyInvestmentAfterLoad / purchaseNav;
      totalInvestment += monthlyInvestment;
    }
    currentValue = units * currentNav * (1 - exitLoad / 100);
  }

  absoluteReturns = ((currentValue - totalInvestment) / totalInvestment) * 100;
  cagr = (Math.pow(currentValue / totalInvestment, 1 / durationInYears) - 1) * 100;

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
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Investment Type',
      name: 'investmentType',
      type: 'select',
      options: [
        { value: 'lumpsum', label: 'Lumpsum Investment' },
        { value: 'sip', label: 'SIP Investment' }
      ],
      required: true,
      tooltip: 'Choose between one-time or regular monthly investments'
    },
    {
      label: 'Investment Start Date',
      name: 'startDate',
      type: 'date',
      required: true,
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
      min: 100,
      max: 10000000,
      required: true,
      tooltip: values.investmentType === 'lumpsum' ? 'One-time investment amount' : 'Monthly SIP amount'
    },
    {
      label: 'Purchase NAV',
      name: 'purchaseNav',
      type: 'number',
      placeholder: '10.00',
      min: 0.01,
      step: 0.01,
      required: true,
      tooltip: 'NAV at which units were purchased'
    },
    {
      label: 'Current NAV',
      name: 'currentNav',
      type: 'number',
      placeholder: '12.00',
      min: 0.01,
      step: 0.01,
      required: true,
      tooltip: 'Current NAV of the mutual fund'
    },
    {
      label: 'Entry Load (%)',
      name: 'entryLoad',
      type: 'percentage',
      placeholder: '0',
      min: 0,
      max: 5,
      step: 0.01,
      tooltip: 'Entry load charged by the fund (if any)'
    },
    {
      label: 'Exit Load (%)',
      name: 'exitLoad',
      type: 'percentage',
      placeholder: '0',
      min: 0,
      max: 5,
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

  const results = useMemo(() => {
    try {
      setError('');

      if (!values.startDate) {
        setError('Please select investment start date');
        return [];
      }

      const result = secureCalculation(
        'mutual-fund',
        values,
        () => calculateReturns(values)
      );

      if (!result) {
        setError('Calculation failed. Please verify your inputs.');
        return [];
      }

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Current Value',
          value: result.currentValue,
          type: 'currency',
          highlight: true,
          tooltip: 'Current value of your investment'
        },
        {
          label: 'Total Investment',
          value: result.totalInvestment,
          type: 'currency',
          tooltip: 'Total amount invested'
        },
        {
          label: 'Total Units',
          value: result.units,
          type: 'number',
          tooltip: 'Number of units held'
        },
        {
          label: 'Absolute Returns',
          value: result.absoluteReturns,
          type: 'percentage',
          tooltip: 'Total returns without considering time period'
        },
        {
          label: 'CAGR',
          value: result.cagr,
          type: 'percentage',
          tooltip: 'Compounded Annual Growth Rate'
        },
        {
          label: 'Total Gains',
          value: result.gains,
          type: 'currency',
          tooltip: 'Profit earned on investment'
        }
      ];

      if (values.taxBracket !== 'none') {
        calculatorResults.push(
          {
            label: 'Tax Amount',
            value: result.taxAmount,
            type: 'currency',
            tooltip: 'Tax payable on gains'
          },
          {
            label: 'Post-tax Value',
            value: result.postTaxValue,
            type: 'currency',
            tooltip: 'Investment value after tax'
          }
        );
      }

      return calculatorResults;
    } catch (err) {
      console.error('Mutual fund calculation error:', err);
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
        title="Mutual Fund Returns Calculator"
        description="Calculate your mutual fund returns including CAGR, absolute returns, and tax implications."
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
