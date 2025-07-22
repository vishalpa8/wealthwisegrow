"use client";
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
  isEffectivelyZero,
  roundToPrecision
} from '@/lib/utils/number';

const initialValues = {
  principal: 100000,
  rate: 8,
  time: 5,
  compoundingFrequency: 'yearly',
  calculationType: 'compound',
};

interface CompoundInterestInputs {
  principal: number;
  rate: number;
  time: number;
  compoundingFrequency: string;
  calculationType: string;
}

interface SimpleInterestInputs {
  principal: number;
  rate: number;
  time: number;
}

function calculateSimpleInterest(inputs: SimpleInterestInputs) {
  const principal = parseRobustNumber(inputs.principal);
  const rate = parseRobustNumber(inputs.rate);
  const time = parseRobustNumber(inputs.time);

  if (principal <= 0) throw new Error('Principal must be positive');
  if (rate < 0) throw Error('Interest rate cannot be negative');
  if (time <= 0) throw new Error('Time period must be positive');

  const simpleInterest = safeDivide(
    safeMultiply(safeMultiply(principal, rate), time),
    100
  );

  const totalAmount = safeAdd(principal, simpleInterest);

  return {
    principal: roundToPrecision(principal),
    simpleInterest: roundToPrecision(simpleInterest),
    totalAmount: roundToPrecision(totalAmount),
    effectiveRate: roundToPrecision(safeDivide(safeMultiply(simpleInterest, 100), principal)),
    monthlyInterest: roundToPrecision(safeDivide(simpleInterest, safeMultiply(time, 12)))
  };
}

function calculateCompoundInterest(inputs: CompoundInterestInputs) {
  const { principal, rate, time, compoundingFrequency } = inputs;

  if (principal <= 0) throw new Error('Principal must be positive');
  if (rate < 0) throw new Error('Interest rate cannot be negative');
  if (time <= 0) throw new Error('Time period must be positive');

  const frequencies: Record<string, number> = {
    'yearly': 1,
    'half-yearly': 2,
    'quarterly': 4,
    'monthly': 12,
    'daily': 365
  };

  const n = frequencies[compoundingFrequency] || 1;
  const r = safeDivide(rate, 100);

  const ratePerPeriod = safeDivide(r, n);
  const periodsTotal = safeMultiply(n, time);

  if (periodsTotal > 1000) {
    throw new Error('Calculation period too long - risk of overflow');
  }

  const compoundFactor = safePower(safeAdd(1, ratePerPeriod), periodsTotal);
  
  if (!isFinite(compoundFactor) || compoundFactor === 0) {
    throw new Error('Calculation overflow or underflow');
  }

  const totalAmount = safeMultiply(principal, compoundFactor);
  const compoundInterest = safeSubtract(totalAmount, principal);

  const simpleInterest = safeDivide(
    safeMultiply(safeMultiply(principal, rate), time),
    100
  );

  const additionalEarnings = safeSubtract(compoundInterest, simpleInterest);
  const effectiveAnnualRate = safeMultiply(
    safeSubtract(safePower(compoundFactor, safeDivide(1, time)), 1),
    100
  );

  return {
    principal: roundToPrecision(principal),
    totalAmount: roundToPrecision(totalAmount),
    compoundInterest: roundToPrecision(compoundInterest),
    simpleInterest: roundToPrecision(simpleInterest),
    additionalEarnings: roundToPrecision(additionalEarnings),
    effectiveAnnualRate: roundToPrecision(effectiveAnnualRate),
    compoundingFrequency: n
  };
}

export default function CompoundInterestCalculatorPage() {
  const [values, setValues] = useState<CompoundInterestInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const compoundInterestResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Basic validation
      if (values.principal <= 0) {
        throw new Error('Principal amount must be greater than zero');
      }
      if (values.rate < 0) {
        throw new Error('Interest rate cannot be negative');
      }
      if (values.time <= 0) {
        throw new Error('Time period must be greater than zero');
      }

      if (values.calculationType === 'compound') {
        // Additional validation for compound interest
        if (values.rate > 25 && values.time > 20) {
          throw new Error('High interest rate with long time period may cause calculation overflow');
        }

        const calculation = calculateCompoundInterest(values);

        if (!isFinite(calculation.totalAmount) || !isFinite(calculation.compoundInterest)) {
          throw new Error('Calculation overflow. Please use smaller values.');
        }

        return calculation;
      } else {
        const calculation = calculateSimpleInterest(values);

        if (!isFinite(calculation.simpleInterest) || !isFinite(calculation.totalAmount)) {
          throw new Error('Calculation overflow. Please use smaller values.');
        }

        return calculation;
      }
    } catch (err: any) {
      console.error('Interest calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Principal Amount',
      name: 'principal',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      min: 100,
      max: 100000000,
      required: true,
      tooltip: 'Initial amount of money invested or borrowed'
    },
    {
      label: 'Annual Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '8',
      min: 0,
      max: 50,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate (compound interest rate)'
    },
    {
      label: 'Time Period',
      name: 'time',
      type: 'number',
      placeholder: '5',
      min: 0.1,
      max: 50,
      step: 0.1,
      unit: 'years',
      required: true,
      tooltip: 'Duration for which money is invested or borrowed'
    },
    {
      label: 'Calculation Type',
      name: 'calculationType',
      type: 'select',
      required: true,
      options: [
        { value: 'compound', label: 'Compound Interest' },
        { value: 'simple', label: 'Simple Interest' },
      ],
      tooltip: 'Choose the type of interest calculation'
    },
    {
      label: 'Compounding Frequency',
      name: 'compoundingFrequency',
      type: 'select',
      required: true,
      options: [
        { value: 'yearly', label: 'Yearly (1 time/year)' },
        { value: 'half-yearly', label: 'Half-Yearly (2 times/year)' },
        { value: 'quarterly', label: 'Quarterly (4 times/year)' },
        { value: 'monthly', label: 'Monthly (12 times/year)' },
        { value: 'daily', label: 'Daily (365 times/year)' }
      ],
      tooltip: 'How often interest is compounded'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!compoundInterestResults) return [];

    if (values.calculationType === 'compound') {
      const compoundResults = compoundInterestResults as ReturnType<typeof calculateCompoundInterest>;
      return [
        {
          label: 'Final Amount',
          value: compoundResults.totalAmount,
          type: 'currency',
          highlight: true,
          tooltip: 'Principal + Compound Interest'
        },
        {
          label: 'Principal Amount',
          value: compoundResults.principal,
          type: 'currency',
          tooltip: 'Initial investment amount'
        },
        {
          label: 'Compound Interest',
          value: compoundResults.compoundInterest,
          type: 'currency',
          tooltip: 'Interest earned with compounding'
        },
        {
          label: 'Simple Interest (comparison)',
          value: compoundResults.simpleInterest,
          type: 'currency',
          tooltip: 'Interest without compounding for comparison'
        },
        {
          label: 'Additional Earnings (Compounding)',
          value: compoundResults.additionalEarnings,
          type: 'currency',
          tooltip: 'Extra money earned due to compounding effect'
        },
        {
          label: 'Effective Annual Rate',
          value: compoundResults.effectiveAnnualRate,
          type: 'percentage',
          tooltip: 'Effective annual return rate considering compounding'
        }
      ];
    } else {
      const simpleResults = compoundInterestResults as ReturnType<typeof calculateSimpleInterest>;
      return [
        {
          label: 'Total Amount',
          value: simpleResults.totalAmount,
          type: 'currency',
          highlight: true,
          tooltip: 'Principal + Simple Interest'
        },
        {
          label: 'Principal Amount',
          value: simpleResults.principal,
          type: 'currency',
          tooltip: 'Initial investment amount'
        },
        {
          label: 'Simple Interest',
          value: simpleResults.simpleInterest,
          type: 'currency',
          tooltip: 'Interest earned using simple interest formula'
        },
        {
          label: 'Effective Return Rate',
          value: simpleResults.effectiveRate,
          type: 'percentage',
          tooltip: 'Total return as percentage of principal'
        },
        {
          label: 'Monthly Interest',
          value: simpleResults.monthlyInterest,
          type: 'currency',
          tooltip: 'Average interest earned per month'
        }
      ];
    }
  }, [compoundInterestResults, values.calculationType, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Compound Interest Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compounding works best over longer periods.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Higher compounding frequency leads to more interest.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Even small regular investments can grow significantly.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Compound Interest Calculator"
      description="Calculate compound interest with different compounding frequencies and compare with simple interest."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Interest Details"
        description="Enter your investment or loan details to calculate interest."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={compoundInterestResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}