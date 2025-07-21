"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateLoan } from '@/lib/calculations/loan';
import { loanSchema } from '@/lib/validations/calculator';

const initialValues = {
  principal: 1500000,
  rate: 8.5,
  years: 10,
  extraPayment: 0
};

export default function EducationLoanCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Education Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '15,00,000',
      min: 50000,
      max: 100000000,
      required: true,
      tooltip: 'Total loan amount for educational expenses'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '8.5',
      min: 6,
      max: 16,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate (typically 7-12% for education loans in India)'
    },
    {
      label: 'Repayment Period',
      name: 'years',
      type: 'number',
      placeholder: '10',
      min: 5,
      max: 20,
      unit: 'years',
      required: true,
      tooltip: 'Duration to repay the education loan (typically 5-15 years)'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      min: 0,
      max: 50000,
      tooltip: 'Additional payment to reduce loan burden faster'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      
      // Custom validation for education loans
      if (values.principal < 50000) {
        setError('Education loan amount should be at least ₹50,000');
        return [];
      }

      if (values.principal > 100000000) {
        setError('Education loan amount is too high (max ₹10 crores)');
        return [];
      }

      if (values.rate < 6 || values.rate > 16) {
        setError('Education loan interest rate should be between 6% and 16%');
        return [];
      }

      if (values.years < 5 || values.years > 20) {
        setError('Education loan tenure should be between 5 and 20 years');
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

      // Education loan specific calculations
      const totalInterest = calculation.totalInterest;
      const principal = values.principal;
      
      // Tax benefits on education loan interest (Section 80E in India)
      // const maxTaxBenefit = 8; // Assume full interest is tax deductible
      const annualInterest = totalInterest / values.years;
      const taxBracket = 0.30; // Assume 30% tax bracket
      const annualTaxSaving = Math.min(annualInterest, 50000) * taxBracket; // Assuming some limit
      const totalTaxSaving = annualTaxSaving * values.years;
      
      // Career impact calculations
      const educationROI = principal * 0.15; // Assume education increases earning by 15% of loan amount annually
      const totalCareerBenefit = educationROI * 20; // Over 20 year career
      
      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Monthly EMI',
          value: calculation.monthlyPayment,
          type: 'currency',
          highlight: true,
          tooltip: 'Monthly installment for your education loan'
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
          tooltip: 'Total interest paid on the education loan'
        },
        {
          label: 'Interest as % of Loan',
          value: (calculation.totalInterest / values.principal) * 100,
          type: 'percentage',
          tooltip: 'Interest as percentage of loan amount'
        },
        {
          label: 'Estimated Tax Savings',
          value: totalTaxSaving,
          type: 'currency',
          tooltip: 'Tax benefits on education loan interest (Section 80E)'
        },
        {
          label: 'Net Cost After Tax Benefits',
          value: calculation.totalPayment - totalTaxSaving,
          type: 'currency',
          tooltip: 'Effective cost after considering tax benefits'
        },
        {
          label: 'Estimated Career ROI',
          value: totalCareerBenefit,
          type: 'currency',
          tooltip: 'Estimated additional earnings over 20 years due to education'
        }
      ];

      // Add prepayment benefits if applicable
      if (values.extraPayment && values.extraPayment > 0) {
        const payoffTimeMonths = calculation.payoffTime;
        const monthsReduced = Math.max(0, (values.years * 12) - payoffTimeMonths);
        
        calculatorResults.push(
          {
            label: 'Interest Saved with Prepayment',
            value: calculation.interestSaved,
            type: 'currency',
            tooltip: 'Interest saved with extra payments'
          },
          {
            label: 'Time Saved',
            value: Math.round(monthsReduced / 12),
            type: 'number',
            tooltip: 'Years reduced from loan tenure'
          }
        );
      }

      return calculatorResults;
    } catch (err) {
      console.error('Education loan calculation error:', err);
      setError('Calculation failed. Please verify your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      // Real-time validation for education loans
      if (name === 'principal') {
        if (numValue < 0) {
          setError('Loan amount cannot be negative');
          return;
        }
        if (numValue > 100000000) {
          setError('Education loan amount is too high');
          return;
        }
      }
      
      if (name === 'rate') {
        if (numValue < 0) {
          setError('Interest rate cannot be negative');
          return;
        }
        if (numValue > 20) {
          setError('Interest rate seems too high for education loans');
          return;
        }
      }
      
      if (name === 'years') {
        if (numValue < 0) {
          setError('Loan tenure cannot be negative');
          return;
        }
        if (numValue > 25) {
          setError('Education loan tenure is typically not more than 20 years');
          return;
        }
      }

      if (name === 'extraPayment') {
        if (numValue < 0) {
          setError('Extra payment cannot be negative');
          return;
        }
        if (numValue > values.principal / 24) { // More reasonable check for education loans
          setError('Extra payment seems very high compared to loan amount');
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
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Education Loan Calculator"
        description="Calculate education loan EMI with tax benefits and career ROI analysis. Plan your educational investment wisely."
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
