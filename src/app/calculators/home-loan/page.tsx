"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateLoan } from '@/lib/calculations/loan';
import { loanSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 3000000,
  rate: 8.5,
  years: 20,
  extraPayment: 0
};

export default function HomeLoanCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Home Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '30,00,000',
      min: 100000,
      max: 500000000,
      required: true,
      tooltip: 'Total amount you need to borrow for your home'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '8.5',
      min: 1,
      max: 20,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate offered by the bank'
    },
    {
      label: 'Loan Tenure',
      name: 'years',
      type: 'number',
      placeholder: '20',
      min: 1,
      max: 30,
      unit: 'years',
      required: true,
      tooltip: 'Number of years to repay the loan'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      min: 0,
      max: 100000,
      tooltip: 'Additional amount you can pay monthly to reduce tenure'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      const validation = loanSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        setError(errorMessage);
        return [];
      }

      // Additional validation for home loan specifics
      if (values.principal < 100000) {
        setError('Home loan amount should be at least ₹1,00,000');
        return [];
      }

      if (values.rate <= 0 || values.rate > 20) {
        setError('Interest rate should be between 1% and 20%');
        return [];
      }

      if (values.years <= 0 || values.years > 30) {
        setError('Loan tenure should be between 1 and 30 years');
        return [];
      }

      const calculation = calculateLoan(validation.data);

      // Check for calculation errors
      if (!calculation || isNaN(calculation.monthlyPayment) || calculation.monthlyPayment <= 0) {
        setError('Unable to calculate EMI. Please check your inputs.');
        return [];
      }

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Monthly EMI',
          value: calculation.monthlyPayment,
          type: 'currency',
          highlight: true,
          tooltip: 'Monthly installment you need to pay'
        },
        {
          label: 'Total Payment',
          value: calculation.totalPayment,
          type: 'currency',
          tooltip: 'Total amount you will pay over the loan tenure'
        },
        {
          label: 'Total Interest',
          value: calculation.totalInterest,
          type: 'currency',
          tooltip: 'Total interest paid over the loan tenure'
        },
        {
          label: 'Interest as % of Principal',
          value: (calculation.totalInterest / values.principal) * 100,
          type: 'percentage',
          tooltip: 'Interest as percentage of loan amount'
        }
      ];

      // Add extra payment benefits if applicable
      if (values.extraPayment && values.extraPayment > 0) {
        const payoffTimeMonths = calculation.payoffTime;
        const yearsReduced = Math.max(0, (values.years * 12) - payoffTimeMonths);
        
        calculatorResults.push(
          {
            label: 'Interest Saved',
            value: calculation.interestSaved,
            type: 'currency',
            tooltip: 'Interest saved with extra payments'
          },
          {
            label: 'Time Reduced',
            value: Math.round(yearsReduced / 12),
            type: 'number',
            tooltip: 'Years reduced from original tenure'
          }
        );
      }

      return calculatorResults;
    } catch (err) {
      console.error('Home loan calculation error:', err);
      setError('Calculation failed. Please verify your inputs and try again.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      // Validate input before setting
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      
      if (name === 'principal' && numValue > 500000000) {
        setError('Home loan amount cannot exceed ₹50 crores');
        return;
      }
      
      if (name === 'rate' && (numValue < 0 || numValue > 50)) {
        setError('Interest rate must be between 0% and 50%');
        return;
      }
      
      if (name === 'years' && (numValue < 0 || numValue > 50)) {
        setError('Loan tenure must be between 0 and 50 years');
        return;
      }

      setValues(prev => ({ ...prev, [name]: value }));
      setError(''); // Clear error when input is valid
    } catch (err) {
      console.error('Input validation error:', err);
      setError('Invalid input value');
    }
  };

  const handleCalculate = () => {
    setLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Home Loan EMI Calculator"
        description="Calculate your home loan EMI, total payment, and interest. Plan your home purchase with confidence."
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
