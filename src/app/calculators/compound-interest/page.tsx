"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { SafeMath, isSafeNumber, roundToPrecision } from '@/lib/utils/currency';

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
}

interface SimpleInterestInputs {
  principal: number;
  rate: number;
  time: number;
}

function calculateSimpleInterest(inputs: SimpleInterestInputs) {
  const { principal, rate, time } = inputs;

  // Validate inputs
  if (!isSafeNumber(principal) || !isSafeNumber(rate) || !isSafeNumber(time)) {
    throw new Error('Invalid input values');
  }

  if (principal <= 0) throw new Error('Principal must be positive');
  if (rate < 0) throw Error('Interest rate cannot be negative');
  if (time <= 0) throw new Error('Time period must be positive');

  // Simple Interest formula: SI = P * R * T / 100
  const simpleInterest = SafeMath.divide(
    SafeMath.multiply(SafeMath.multiply(principal, rate), time),
    100
  );

  const totalAmount = SafeMath.add(principal, simpleInterest);

  return {
    principal: roundToPrecision(principal),
    simpleInterest: roundToPrecision(simpleInterest),
    totalAmount: roundToPrecision(totalAmount),
    effectiveRate: roundToPrecision(SafeMath.divide(SafeMath.multiply(simpleInterest, 100), principal)),
    monthlyInterest: roundToPrecision(SafeMath.divide(simpleInterest, SafeMath.multiply(time, 12)))
  };
}

function calculateCompoundInterest(inputs: CompoundInterestInputs) {
  const { principal, rate, time, compoundingFrequency } = inputs;

  // Validate inputs
  if (!isSafeNumber(principal) || !isSafeNumber(rate) || !isSafeNumber(time)) {
    throw new Error('Invalid input values');
  }

  if (principal <= 0) throw new Error('Principal must be positive');
  if (rate < 0) throw new Error('Interest rate cannot be negative');
  if (time <= 0) throw new Error('Time period must be positive');

  // Get compounding frequency
  const frequencies: Record<string, number> = {
    'yearly': 1,
    'half-yearly': 2,
    'quarterly': 4,
    'monthly': 12,
    'daily': 365
  };

  const n = frequencies[compoundingFrequency] || 1;
  const r = SafeMath.divide(rate, 100);

  // Compound Interest formula: A = P(1 + r/n)^(nt)
  const ratePerPeriod = SafeMath.divide(r, n);
  const periodsTotal = SafeMath.multiply(n, time);

  // Check for potential overflow
  if (periodsTotal > 1000) {
    throw new Error('Calculation period too long - risk of overflow');
  }

  const compoundFactor = SafeMath.power(SafeMath.add(1, ratePerPeriod), periodsTotal);
  
  if (!isSafeNumber(compoundFactor) || compoundFactor === 0) {
    throw new Error('Calculation overflow or underflow');
  }

  const totalAmount = SafeMath.multiply(principal, compoundFactor);
  const compoundInterest = SafeMath.subtract(totalAmount, principal);

  // Calculate simple interest for comparison
  const simpleInterest = SafeMath.divide(
    SafeMath.multiply(SafeMath.multiply(principal, rate), time),
    100
  );

  const additionalEarnings = SafeMath.subtract(compoundInterest, simpleInterest);
  const effectiveAnnualRate = SafeMath.multiply(
    SafeMath.subtract(SafeMath.power(compoundFactor, SafeMath.divide(1, time)), 1),
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
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Principal Amount',
      name: 'principal',
      type: 'number',
      placeholder: '1,00,000',
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

  const results = useMemo(() => {
    try {
      setError('');
      
      // Validate inputs
      if (!values.principal || !values.rate || !values.time) {
        setError('Please fill in all required fields');
        return [];
      }

      if (values.principal <= 0) {
        setError('Principal amount must be greater than zero');
        return [];
      }

      if (values.rate < 0) {
        setError('Interest rate cannot be negative');
        return [];
      }

      if (values.time <= 0) {
        setError('Time period must be greater than zero');
        return [];
      }

      if (values.principal > 100000000) {
        setError('Principal amount is too large');
        return [];
      }

      if (values.rate > 50) {
        setError('Interest rate seems unreasonably high');
        return [];
      }

      if (values.time > 50) {
        setError('Time period is too long');
        return [];
      }

      if (values.calculationType === 'compound') {
        // Additional validation for compound interest
        if (values.rate > 25 && values.time > 20) {
          setError('High interest rate with long time period may cause calculation overflow');
          return [];
        }

        const calculation = calculateCompoundInterest(values);

        // Validate calculation results
        if (!isSafeNumber(calculation.totalAmount) || !isSafeNumber(calculation.compoundInterest)) {
          setError('Calculation overflow. Please use smaller values.');
          return [];
        }

        const calculatorResults: CalculatorResult[] = [
          {
            label: 'Final Amount',
            value: calculation.totalAmount,
            type: 'currency',
            highlight: true,
            tooltip: 'Principal + Compound Interest'
          },
          {
            label: 'Principal Amount',
            value: calculation.principal,
            type: 'currency',
            tooltip: 'Initial investment amount'
          },
          {
            label: 'Compound Interest',
            value: calculation.compoundInterest,
            type: 'currency',
            tooltip: 'Interest earned with compounding'
          },
          {
            label: 'Simple Interest (comparison)',
            value: calculation.simpleInterest,
            type: 'currency',
            tooltip: 'Interest without compounding for comparison'
          },
          {
            label: 'Additional Earnings (Compounding)',
            value: calculation.additionalEarnings,
            type: 'currency',
            tooltip: 'Extra money earned due to compounding effect'
          },
          {
            label: 'Effective Annual Rate',
            value: calculation.effectiveAnnualRate,
            type: 'percentage',
            tooltip: 'Effective annual return rate considering compounding'
          }
        ];

        return calculatorResults;
      } else {
        const calculation = calculateSimpleInterest(values);

        // Validate calculation results
        if (!isSafeNumber(calculation.simpleInterest) || !isSafeNumber(calculation.totalAmount)) {
          setError('Calculation overflow. Please use smaller values.');
          return [];
        }

        const calculatorResults: CalculatorResult[] = [
          {
            label: 'Total Amount',
            value: calculation.totalAmount,
            type: 'currency',
            highlight: true,
            tooltip: 'Principal + Simple Interest'
          },
          {
            label: 'Principal Amount',
            value: calculation.principal,
            type: 'currency',
            tooltip: 'Initial investment amount'
          },
          {
            label: 'Simple Interest',
            value: calculation.simpleInterest,
            type: 'currency',
            tooltip: 'Interest earned using simple interest formula'
          },
          {
            label: 'Effective Return Rate',
            value: calculation.effectiveRate,
            type: 'percentage',
            tooltip: 'Total return as percentage of principal'
          },
          {
            label: 'Monthly Interest',
            value: calculation.monthlyInterest,
            type: 'currency',
            tooltip: 'Average interest earned per month'
          }
        ];

        return calculatorResults;
      }
    } catch (err) {
      console.error('Interest calculation error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Calculation failed. Please check your inputs.');
      }
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      if (name === 'compoundingFrequency') {
        setValues(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
        return;
      }

      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      // Input validation
      if (name === 'principal' && numValue < 0) {
        setError('Principal cannot be negative');
        return;
      }
      
      if (name === 'rate' && numValue < 0) {
        setError('Interest rate cannot be negative');
        return;
      }
      
      if (name === 'time' && numValue < 0) {
        setError('Time period cannot be negative');
        return;
      }

      // Check for extremely large values
      if (numValue > Number.MAX_SAFE_INTEGER / 1000) {
        setError('Value is too large');
        return;
      }

      // Specific warnings for compound interest
      if (name === 'rate' && numValue > 30) {
        setError('Very high interest rates may cause calculation issues');
        return;
      }

      if (name === 'time' && numValue > 30 && values.rate > 15) {
        setError('Long time period with high interest rate may cause overflow');
        return;
      }

      setValues(prev => ({ ...prev, [name]: value }));
      if (error) setError('');
    } catch (err) {
      console.error('Input change error:', err);
      setError('Invalid input format');
    }
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Compound Interest Calculator"
        description="Calculate compound interest with different compounding frequencies and compare with simple interest."
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
