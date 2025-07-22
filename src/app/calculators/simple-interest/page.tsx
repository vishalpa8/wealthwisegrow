"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { 
  parseRobustNumber, 
  safeDivide, 
  safeMultiply, 
  safeAdd, 
  roundToPrecision,
  isEffectivelyZero
} from '@/lib/utils/number';

const initialValues = {
  principal: 100000,
  rate: 8,
  time: 3
};

interface SimpleInterestInputs {
  principal: number;
  rate: number;
  time: number;
}

function calculateSimpleInterest(inputs: SimpleInterestInputs) {
  const principal = parseRobustNumber(inputs.principal);
  const rate = parseRobustNumber(inputs.rate);
  const time = parseRobustNumber(inputs.time);

  // Validate inputs
  if (principal <= 0) throw new Error('Principal must be positive');
  if (rate < 0) throw new Error('Interest rate cannot be negative');
  if (time <= 0) throw new Error('Time period must be positive');

  // Simple Interest formula: SI = P * R * T / 100
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

export default function SimpleInterestCalculatorPage() {
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
      tooltip: 'The initial amount of money'
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
      tooltip: 'Annual interest rate (simple interest rate)'
    },
    {
      label: 'Time Period',
      name: 'time',
      type: 'number',
      placeholder: '3',
      min: 0.1,
      max: 50,
      step: 0.1,
      unit: 'years',
      required: true,
      tooltip: 'Duration for which money is invested or borrowed'
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

      const calculation = calculateSimpleInterest(values);

      // Validate calculation results
      if (!isFinite(calculation.simpleInterest) || !isFinite(calculation.totalAmount)) {
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
    } catch (err) {
      console.error('Simple interest calculation error:', err);
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

      setValues(prev => ({ ...prev, [name]: value }));
      if (error) setError(''); // Clear error on valid input
    } catch (err) {
      console.error('Input change error:', err);
      setError('Invalid input format');
    }
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Simple Interest Calculator"
        description="Calculate simple interest earned on investments or loans using the formula: SI = P × R × T ÷ 100"
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
