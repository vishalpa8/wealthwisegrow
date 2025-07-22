"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';

const initialValues = {
  loanAmount: 1000000,
  interestRate: 9,
  loanTerm: 5,
  balloonPayment: 300000,
  paymentFrequency: 'monthly'
};

interface BalloonLoanInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  balloonPayment: number;
  paymentFrequency: string;
}

function calculateBalloonLoan(inputs: BalloonLoanInputs) {
  const { loanAmount, interestRate, loanTerm, balloonPayment, paymentFrequency } = inputs;
  
  const periodsPerYear = paymentFrequency === 'monthly' ? 12 : 4;
  const totalPeriods = loanTerm * periodsPerYear;
  const periodRate = interestRate / 100 / periodsPerYear;
  
  // Calculate the present value of the balloon payment
  const pvBalloon = balloonPayment / Math.pow(1 + periodRate, totalPeriods);
  
  // Calculate the loan amount to be amortized (excluding balloon payment)
  const amortizedAmount = loanAmount - pvBalloon;
  
  // Calculate regular payment using PMT formula
  let regularPayment = 0;
  if (amortizedAmount > 0 && periodRate > 0) {
    regularPayment = (amortizedAmount * periodRate) / (1 - Math.pow(1 + periodRate, -totalPeriods));
  }
  
  // Calculate total payments
  const totalRegularPayments = regularPayment * totalPeriods;
  const totalPayments = totalRegularPayments + balloonPayment;
  const totalInterest = totalPayments - loanAmount;
  
  // Calculate amortization schedule for first few payments
  let balance = loanAmount;
  const schedule = [];
  
  for (let i = 1; i <= Math.min(12, totalPeriods); i++) {
    const interestPayment = balance * periodRate;
    const principalPayment = regularPayment - interestPayment;
    balance -= principalPayment;
    
    schedule.push({
      period: i,
      payment: regularPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: balance
    });
  }
  
  // Calculate what the payment would be for a traditional loan
  const traditionalPayment = (loanAmount * periodRate) / (1 - Math.pow(1 + periodRate, -totalPeriods));
  const paymentSavings = traditionalPayment - regularPayment;
  
  // Calculate interest rate as percentage of loan
  const interestPercentage = (totalInterest / loanAmount) * 100;
  
  return {
    regularPayment,
    balloonPayment,
    totalRegularPayments,
    totalPayments,
    totalInterest,
    interestPercentage,
    traditionalPayment,
    paymentSavings,
    finalBalance: balloonPayment,
    schedule,
    effectiveRate: ((totalPayments / loanAmount) ** (1 / loanTerm) - 1) * 100
  };
}

export default function BalloonLoanCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Loan Amount',
      name: 'loanAmount',
      type: 'number',
      placeholder: '10,00,000',
      min: 50000,
      max: 100000000,
      required: true,
      tooltip: 'Total amount you want to borrow'
    },
    {
      label: 'Annual Interest Rate',
      name: 'interestRate',
      type: 'percentage',
      placeholder: '9',
      min: 1,
      max: 25,
      step: 0.1,
      required: true,
      tooltip: 'Annual interest rate for the balloon loan'
    },
    {
      label: 'Loan Term',
      name: 'loanTerm',
      type: 'number',
      placeholder: '5',
      min: 1,
      max: 30,
      unit: 'years',
      required: true,
      tooltip: 'Duration of the loan before balloon payment is due'
    },
    {
      label: 'Balloon Payment',
      name: 'balloonPayment',
      type: 'number',
      placeholder: '3,00,000',
      min: 10000,
      max: 50000000,
      required: true,
      tooltip: 'Large final payment due at the end of the loan term'
    },
    {
      label: 'Payment Frequency',
      name: 'paymentFrequency',
      type: 'select',
      options: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' }
      ],
      required: true,
      tooltip: 'How often you will make regular payments'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      
      // Validate inputs
      if (values.loanAmount <= 0) {
        setError('Loan amount must be greater than zero');
        return [];
      }

      if (values.interestRate <= 0) {
        setError('Interest rate must be greater than zero');
        return [];
      }

      if (values.loanTerm <= 0) {
        setError('Loan term must be greater than zero');
        return [];
      }

      if (values.balloonPayment <= 0) {
        setError('Balloon payment must be greater than zero');
        return [];
      }

      if (values.balloonPayment >= values.loanAmount) {
        setError('Balloon payment should be less than the total loan amount');
        return [];
      }

      const calculation = calculateBalloonLoan(values);

      if (isNaN(calculation.regularPayment) || calculation.regularPayment <= 0) {
        setError('Unable to calculate payment. Please check your inputs.');
        return [];
      }

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Regular Payment',
          value: calculation.regularPayment,
          type: 'currency',
          highlight: true,
          tooltip: `${values.paymentFrequency === 'monthly' ? 'Monthly' : 'Quarterly'} payment amount`
        },
        {
          label: 'Balloon Payment',
          value: calculation.balloonPayment,
          type: 'currency',
          tooltip: 'Final large payment due at loan maturity'
        },
        {
          label: 'Total Regular Payments',
          value: calculation.totalRegularPayments,
          type: 'currency',
          tooltip: 'Sum of all regular payments over loan term'
        },
        {
          label: 'Total Amount Paid',
          value: calculation.totalPayments,
          type: 'currency',
          tooltip: 'Total amount including regular payments and balloon payment'
        },
        {
          label: 'Total Interest',
          value: calculation.totalInterest,
          type: 'currency',
          tooltip: 'Total interest paid over the life of the loan'
        },
        {
          label: 'Interest as % of Loan',
          value: calculation.interestPercentage,
          type: 'percentage',
          tooltip: 'Total interest as percentage of loan amount'
        },
        {
          label: 'Traditional Loan Payment',
          value: calculation.traditionalPayment,
          type: 'currency',
          tooltip: 'What the payment would be for a traditional amortizing loan'
        },
        {
          label: 'Payment Savings',
          value: calculation.paymentSavings,
          type: 'currency',
          tooltip: 'Amount saved per payment compared to traditional loan'
        },
        {
          label: 'Effective Annual Rate',
          value: calculation.effectiveRate,
          type: 'percentage',
          tooltip: 'Effective annual cost of the balloon loan'
        }
      ];

      return calculatorResults;
    } catch (err) {
      console.error('Balloon loan calculation error:', err);
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      if ((name === 'loanAmount' || name === 'interestRate' || name === 'loanTerm' || name === 'balloonPayment') && numValue < 0) {
        setError(`${name} cannot be negative`);
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
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Balloon Loan Calculator"
        description="Calculate payments for balloon loans with lower regular payments and a large final payment. Compare with traditional loan options."
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