"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateLoan } from '@/lib/calculations/loan';
import { loanSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 800000,
  rate: 9.5,
  years: 7,
  extraPayment: 0
};

export default function CarLoanCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Car Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '8,00,000',
      min: 50000,
      max: 50000000,
      required: true,
      tooltip: 'Total loan amount for the car purchase'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '9.5',
      min: 5,
      max: 25,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate offered by the bank (typically 7-15% for car loans)'
    },
    {
      label: 'Loan Tenure',
      name: 'years',
      type: 'number',
      placeholder: '7',
      min: 1,
      max: 10,
      unit: 'years',
      required: true,
      tooltip: 'Duration to repay the car loan (typically 1-7 years)'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      min: 0,
      max: 100000,
      tooltip: 'Additional payment to reduce loan tenure and save interest'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      
      // Custom validation for car loans
      if (values.principal < 50000) {
        setError('Car loan amount should be at least ₹50,000');
        return [];
      }

      if (values.principal > 50000000) {
        setError('Car loan amount seems too high (max ₹5 crores)');
        return [];
      }

      if (values.rate < 5 || values.rate > 25) {
        setError('Car loan interest rate should be between 5% and 25%');
        return [];
      }

      if (values.years < 1 || values.years > 10) {
        setError('Car loan tenure should be between 1 and 10 years');
        return [];
      }

      const validation = loanSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        setError(errorMessage);
        return [];
      }

      const calculation = calculateLoan(validation.data);

      // Validate calculation results
      if (!calculation || isNaN(calculation.monthlyPayment) || calculation.monthlyPayment <= 0) {
        setError('Unable to calculate EMI. Please check your inputs.');
        return [];
      }

      // Car-specific calculations
      const carValue = values.principal; // Assuming loan amount is car value
      const depreciationRate = 0.15; // Assume 15% annual depreciation
      const currentCarValue = carValue * Math.pow(1 - depreciationRate, values.years);
      const totalDepreciation = carValue - currentCarValue;
      
      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Monthly EMI',
          value: calculation.monthlyPayment,
          type: 'currency',
          highlight: true,
          tooltip: 'Monthly installment for your car loan'
        },
        {
          label: 'Total Payment',
          value: calculation.totalPayment,
          type: 'currency',
          tooltip: 'Total amount to be paid over loan tenure'
        },
        {
          label: 'Total Interest',
          value: calculation.totalInterest,
          type: 'currency',
          tooltip: 'Total interest paid on the car loan'
        },
        {
          label: 'Interest as % of Loan',
          value: (calculation.totalInterest / values.principal) * 100,
          type: 'percentage',
          tooltip: 'Interest as percentage of loan amount'
        },
        {
          label: 'Car Value After ' + values.years + ' Years',
          value: currentCarValue,
          type: 'currency',
          tooltip: 'Estimated car value considering depreciation (15% p.a.)'
        },
        {
          label: 'Total Cost of Ownership',
          value: calculation.totalInterest + totalDepreciation,
          type: 'currency',
          tooltip: 'Interest paid + Depreciation = Total cost beyond car price'
        }
      ];

      // Add prepayment benefits if applicable
      if (values.extraPayment && values.extraPayment > 0) {
        const payoffTimeMonths = calculation.payoffTime;
        const monthsReduced = Math.max(0, (values.years * 12) - payoffTimeMonths);
        
        calculatorResults.push(
          {
            label: 'Interest Saved',
            value: calculation.interestSaved,
            type: 'currency',
            tooltip: 'Interest saved with extra payments'
          },
          {
            label: 'Time Saved',
            value: Math.round(monthsReduced),
            type: 'number',
            tooltip: 'Months reduced from loan tenure'
          }
        );
      }

      return calculatorResults;
    } catch (err) {
      console.error('Car loan calculation error:', err);
      setError('Calculation failed. Please verify your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      // Real-time validation for car loans
      if (name === 'principal') {
        if (numValue < 0) {
          setError('Loan amount cannot be negative');
          return;
        }
        if (numValue > 50000000) {
          setError('Car loan amount is too high');
          return;
        }
      }
      
      if (name === 'rate') {
        if (numValue < 0) {
          setError('Interest rate cannot be negative');
          return;
        }
        if (numValue > 50) {
          setError('Interest rate seems unreasonably high for car loans');
          return;
        }
      }
      
      if (name === 'years') {
        if (numValue < 0) {
          setError('Loan tenure cannot be negative');
          return;
        }
        if (numValue > 15) {
          setError('Car loan tenure is typically not more than 10 years');
          return;
        }
      }

      if (name === 'extraPayment') {
        if (numValue < 0) {
          setError('Extra payment cannot be negative');
          return;
        }
        if (numValue > values.principal / 12) {
          setError('Extra payment seems too high compared to loan amount');
          return;
        }
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
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Car Loan EMI Calculator"
        description="Calculate car loan EMI, total interest, and understand the true cost of car ownership including depreciation."
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
