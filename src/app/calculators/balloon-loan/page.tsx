"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";

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
  const [values, setValues] = useState<BalloonLoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const balloonLoanResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Validate inputs
      if (values.loanAmount <= 0) {
        throw new Error('Loan amount must be greater than zero');
      }

      if (values.interestRate <= 0) {
        throw new Error('Interest rate must be greater than zero');
      }

      if (values.loanTerm <= 0) {
        throw new Error('Loan term must be greater than zero');
      }

      if (values.balloonPayment <= 0) {
        throw new Error('Balloon payment must be greater than zero');
      }

      if (values.balloonPayment >= values.loanAmount) {
        throw new Error('Balloon payment should be less than the total loan amount');
      }

      const calculation = calculateBalloonLoan(values);

      if (isNaN(calculation.regularPayment) || calculation.regularPayment <= 0) {
        throw new Error('Unable to calculate payment. Please check your inputs.');
      }

      return calculation;
    } catch (err: any) {
      console.error('Balloon loan calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Loan Amount',
      name: 'loanAmount',
      type: 'number',
      placeholder: '10,00,000',
      unit: currency.symbol,
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
      unit: currency.symbol,
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

  const results: CalculatorResult[] = useMemo(() => {
    if (!balloonLoanResults) return [];

    return [
      {
        label: 'Regular Payment',
        value: balloonLoanResults.regularPayment,
        type: 'currency',
        highlight: true,
        tooltip: `${values.paymentFrequency === 'monthly' ? 'Monthly' : 'Quarterly'} payment amount`
      },
      {
        label: 'Balloon Payment',
        value: balloonLoanResults.balloonPayment,
        type: 'currency',
        tooltip: 'Final large payment due at loan maturity'
      },
      {
        label: 'Total Regular Payments',
        value: balloonLoanResults.totalRegularPayments,
        type: 'currency',
        tooltip: 'Sum of all regular payments over loan term'
      },
      {
        label: 'Total Amount Paid',
        value: balloonLoanResults.totalPayments,
        type: 'currency',
        tooltip: 'Total amount including regular payments and balloon payment'
      },
      {
        label: 'Total Interest',
        value: balloonLoanResults.totalInterest,
        type: 'currency',
        tooltip: 'Total interest paid over the life of the loan'
      },
      {
        label: 'Interest as % of Loan',
        value: balloonLoanResults.interestPercentage,
        type: 'percentage',
        tooltip: 'Total interest as percentage of loan amount'
      },
      {
        label: 'Traditional Loan Payment',
        value: balloonLoanResults.traditionalPayment,
        type: 'currency',
        tooltip: 'What the payment would be for a traditional amortizing loan'
      },
      {
        label: 'Payment Savings',
        value: balloonLoanResults.paymentSavings,
        type: 'currency',
        tooltip: 'Amount saved per payment compared to traditional loan'
      },
      {
        label: 'Effective Annual Rate',
        value: balloonLoanResults.effectiveRate,
        type: 'percentage',
        tooltip: 'Effective annual cost of the balloon loan'
      }
    ];
  }, [balloonLoanResults, values.paymentFrequency, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 600);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Balloon Loan Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Balloon loans have lower monthly payments but a large final payment.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Plan how you will pay the balloon amount at maturity.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Often used for real estate or business financing.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Balloon Loan Calculator"
      description="Calculate payments for balloon loans with lower regular payments and a large final payment. Compare with traditional loan options."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Balloon Loan Details"
        description="Enter your balloon loan details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={balloonLoanResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}
