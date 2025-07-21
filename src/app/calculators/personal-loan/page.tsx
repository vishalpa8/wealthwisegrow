"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateLoan } from '@/lib/calculations/loan';
import { loanSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 500000,
  rate: 12,
  years: 5,
  extraPayment: 0
};

export default function PersonalLoanCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '5,00,000',
      min: 10000,
      max: 50000000,
      required: true,
      tooltip: 'Amount you need for personal expenses'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '12',
      min: 8,
      max: 30,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate (typically 10-24% for personal loans)'
    },
    {
      label: 'Loan Tenure',
      name: 'years',
      type: 'number',
      placeholder: '5',
      min: 1,
      max: 10,
      unit: 'years',
      required: true,
      tooltip: 'Duration to repay the loan (usually 1-7 years)'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      min: 0,
      max: 100000,
      tooltip: 'Additional payment to reduce loan tenure and interest'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      
      // Custom validation for personal loans
      if (values.principal < 10000) {
        setError('Personal loan amount should be at least ₹10,000');
        return [];
      }

      if (values.principal > 50000000) {
        setError('Personal loan amount cannot exceed ₹5 crores');
        return [];
      }

      if (values.rate < 8 || values.rate > 30) {
        setError('Interest rate should be between 8% and 30% for personal loans');
        return [];
      }

      if (values.years < 1 || values.years > 10) {
        setError('Personal loan tenure should be between 1 and 10 years');
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

      // Check if EMI is reasonable (not more than loan amount)
      if (calculation.monthlyPayment > values.principal) {
        setError('EMI calculation seems incorrect. Please verify inputs.');
        return [];
      }

      const monthlyIncome = values.principal / (values.years * 12) * 3; // Assume 3x EMI as minimum income

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Monthly EMI',
          value: calculation.monthlyPayment,
          type: 'currency',
          highlight: true,
          tooltip: 'Monthly installment amount'
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
          tooltip: 'Total interest payable'
        },
        {
          label: 'Interest Rate (Effective)',
          value: (calculation.totalInterest / values.principal) * 100,
          type: 'percentage',
          tooltip: 'Effective interest rate over loan tenure'
        },
        {
          label: 'Suggested Min. Income',
          value: monthlyIncome,
          type: 'currency',
          tooltip: 'Minimum monthly income recommended (3x EMI)'
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
            tooltip: 'Interest saved with prepayments'
          },
          {
            label: 'Time Saved',
            value: Math.round(monthsReduced),
            type: 'number',
            tooltip: 'Months reduced from tenure'
          }
        );
      }

      return calculatorResults;
    } catch (err) {
      console.error('Personal loan calculation error:', err);
      setError('Calculation failed. Please verify your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      // Real-time validation
      if (name === 'principal') {
        if (numValue < 0) {
          setError('Loan amount cannot be negative');
          return;
        }
        if (numValue > 50000000) {
          setError('Personal loan amount too high');
          return;
        }
      }
      
      if (name === 'rate') {
        if (numValue < 0) {
          setError('Interest rate cannot be negative');
          return;
        }
        if (numValue > 50) {
          setError('Interest rate seems too high');
          return;
        }
      }
      
      if (name === 'years') {
        if (numValue < 0) {
          setError('Loan tenure cannot be negative');
          return;
        }
        if (numValue > 15) {
          setError('Personal loan tenure too long');
          return;
        }
      }

      setValues(prev => ({ ...prev, [name]: value }));
      if (error) setError(''); // Clear previous errors
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
        title="Personal Loan EMI Calculator"
        description="Calculate EMI for personal loans with detailed breakdown and prepayment options."
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
