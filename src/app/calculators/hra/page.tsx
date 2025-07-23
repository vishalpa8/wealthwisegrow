'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from '@/lib/utils/number';

const initialValues = {
  basicSalary: 50000,
  hraReceived: 20000,
  rentPaid: 15000,
  cityType: 'metro',
  monthsRented: 12
};

interface HRAInputs {
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  cityType: string;
  monthsRented: number;
}

function calculateHRAExemption(inputs: HRAInputs) {
  // Use parseRobustNumber for flexible input handling
  const basicSalary = Math.abs(parseRobustNumber(inputs.basicSalary)) || 1000;
  const hraReceived = Math.abs(parseRobustNumber(inputs.hraReceived)) || 0;
  const rentPaid = Math.abs(parseRobustNumber(inputs.rentPaid)) || 0;
  const monthsRented = Math.max(1, Math.min(12, Math.abs(parseRobustNumber(inputs.monthsRented)) || 12));
  const cityType = inputs.cityType || 'metro';

  // Annual calculations
  const annualBasic = basicSalary * 12;
  const annualHRA = hraReceived * 12;
  const annualRent = rentPaid * monthsRented;

  // Calculate exemption based on three conditions
  const actualHRA = annualHRA;
  const rentMinusBasic = annualRent - (annualBasic * 0.1); // Rent paid minus 10% of basic
  const basicPercent = annualBasic * (cityType === 'metro' ? 0.5 : 0.4); // 50% for metro, 40% for non-metro

  // Exemption is minimum of the three
  const exemption = Math.min(
    actualHRA,
    rentMinusBasic > 0 ? rentMinusBasic : 0,
    basicPercent
  );

  // Calculate taxable HRA
  const taxableHRA = annualHRA - exemption;

  return {
    annualBasic,
    annualHRA,
    annualRent,
    exemption,
    taxableHRA,
    basicPercent,
    rentMinusBasic,
    actualHRA,
    monthlyExemption: exemption / 12,
    monthlyTaxableHRA: taxableHRA / 12
  };
}

export default function HRACalculatorPage() {
  const [values, setValues] = useState<HRAInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const hraResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases gracefully
      const calculation = calculateHRAExemption(values);
      return calculation;
    } catch (err: any) {
      console.error('HRA calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Basic Salary (Monthly)',
      name: 'basicSalary',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      tooltip: 'Your monthly basic salary'
    },
    {
      label: 'HRA Received (Monthly)',
      name: 'hraReceived',
      type: 'number',
      placeholder: '20,000',
      unit: currency.symbol,
      tooltip: 'Monthly HRA received from employer'
    },
    {
      label: 'Rent Paid (Monthly)',
      name: 'rentPaid',
      type: 'number',
      placeholder: '15,000',
      unit: currency.symbol,
      tooltip: 'Monthly rent paid for accommodation'
    },
    {
      label: 'City Type',
      name: 'cityType',
      type: 'select',
      options: [
        { value: 'metro', label: 'Metro City (50%)' },
        { value: 'non-metro', label: 'Non-Metro City (40%)' }
      ],
      tooltip: 'Metro cities: Delhi, Mumbai, Kolkata, Chennai'
    },
    {
      label: 'Months Rented',
      name: 'monthsRented',
      type: 'number',
      placeholder: '12',
      tooltip: 'Number of months rent paid in the financial year'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!hraResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Annual HRA Exemption',
        value: hraResults.exemption,
        type: 'currency',
        highlight: true,
        tooltip: 'Total HRA exemption for the year'
      },
      {
        label: 'Monthly HRA Exemption',
        value: hraResults.monthlyExemption,
        type: 'currency',
        tooltip: 'Monthly HRA exemption amount'
      },
      {
        label: 'Annual Taxable HRA',
        value: hraResults.taxableHRA,
        type: 'currency',
        tooltip: 'HRA amount that is taxable'
      },
      {
        label: 'Monthly Taxable HRA',
        value: hraResults.monthlyTaxableHRA,
        type: 'currency',
        tooltip: 'Monthly taxable HRA amount'
      }
    ];

    // Add details of calculation
    calculatorResults.push(
      {
        label: 'Actual HRA Received',
        value: hraResults.actualHRA,
        type: 'currency',
        tooltip: 'Total HRA received for the year'
      },
      {
        label: `${values.cityType === 'metro' ? '50%' : '40%'} of Basic`,
        value: hraResults.basicPercent,
        type: 'currency',
        tooltip: `${values.cityType === 'metro' ? '50%' : '40%'} of annual basic salary`
      },
      {
        label: 'Rent - 10% of Basic',
        value: hraResults.rentMinusBasic,
        type: 'currency',
        tooltip: 'Rent paid minus 10% of basic salary'
      }
    );

    return calculatorResults;
  }, [hraResults, values.cityType, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">HRA Exemption Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Keep rent receipts as proof for HRA claims.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">HRA exemption is part of your salary structure.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">If you own a house, you cannot claim HRA.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="HRA Exemption Calculator"
      description="Calculate your House Rent Allowance (HRA) exemption and determine the taxable portion of your HRA."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="HRA Details"
        description="Enter your HRA and rent details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={hraResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}