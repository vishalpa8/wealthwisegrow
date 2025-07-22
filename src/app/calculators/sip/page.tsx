"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateSIP, SIPInputs } from '@/lib/calculations/savings';
import { sipSchema } from '@/lib/validations/calculator';

const initialValues = {
  monthlyInvestment: 5000,
  annualReturn: 12,
  years: 10
};

export default function SIPCalculatorPage() {
  const [values, setValues] = useState<SIPInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const sipResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      const validation = sipSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        throw new Error(errorMessage);
      }

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

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Monthly Investment',
      name: 'monthlyInvestment',
      type: 'number',
      placeholder: '5,000',
      unit: currency.symbol,
      min: 100,
      max: 1000000,
      required: true,
      tooltip: 'Amount you plan to invest every month through SIP'
    },
    {
      label: 'Expected Annual Return',
      name: 'annualReturn',
      type: 'percentage',
      placeholder: '12',
      min: 1,
      max: 50,
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
      }
    ];
  }, [sipResults, values.years, currency.symbol]);

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
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="SIP Calculator"
      description="Calculate the future value of your Systematic Investment Plan (SIP) investments with the power of compounding."
      sidebar={sidebar}
    >
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
    </CalculatorLayout>
  );
}