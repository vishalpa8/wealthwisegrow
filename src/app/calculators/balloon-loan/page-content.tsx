"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";
import { calculatePresentValue, calculateEMI } from "@/lib/calculations/financial-math";

interface BalloonLoanInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  balloonPayment: number;
  paymentFrequency: string;
}

const initialValues: BalloonLoanInputs = {
  loanAmount: 1000000,
  interestRate: 9,
  loanTerm: 5,
  balloonPayment: 300000,
  paymentFrequency: 'monthly'
};

export function BalloonLoanCalculatorContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Loan Amount',
      name: 'loanAmount',
      type: 'number',
      placeholder: '10,00,000',
      unit: currency.symbol,
      tooltip: 'Total amount you want to borrow'
    },
    {
      label: 'Annual Interest Rate',
      name: 'interestRate',
      type: 'percentage',
      placeholder: '9',
      step: 0.1,
      tooltip: 'Annual interest rate for the balloon loan'
    },
    {
      label: 'Loan Term',
      name: 'loanTerm',
      type: 'number',
      placeholder: '5',
      unit: 'years',
      tooltip: 'Duration of the loan before balloon payment is due'
    },
    {
      label: 'Balloon Payment',
      name: 'balloonPayment',
      type: 'number',
      placeholder: '3,00,000',
      unit: currency.symbol,
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
      tooltip: 'How often you will make regular payments'
    }
  ], [currency.symbol]);

  const calculate = (inputs: BalloonLoanInputs) => {
    const loanAmount = Math.abs(parseRobustNumber(inputs.loanAmount)) || 100000;
    const interestRate = Math.abs(parseRobustNumber(inputs.interestRate)) || 9;
    const loanTerm = Math.max(1, Math.abs(parseRobustNumber(inputs.loanTerm)) || 5);
    const balloonPayment = Math.abs(parseRobustNumber(inputs.balloonPayment)) || 10000;
    const paymentFrequency = inputs.paymentFrequency || 'monthly';
    
    const periodsPerYear = paymentFrequency === 'monthly' ? 12 : 4;
    const totalPeriods = loanTerm * periodsPerYear;
    const periodRate = interestRate / 100 / periodsPerYear;
    
    const pvBalloon = calculatePresentValue(balloonPayment, interestRate, totalPeriods, periodsPerYear);
    const amortizedAmount = Math.max(0, loanAmount - pvBalloon);
    
    // We can use calculateEMI since it handles the exact same formula (amortization)
    // We just pass the periodRate as if it were an annual rate divided by 12, so we scale it.
    // Wait, calculateEMI divides by 12 internally! Since paymentFrequency can be quarterly, calculateEMI is hardcoded to 12.
    // Instead of using calculateEMI, let's keep the inline math for the quarterly edge case or add a periodsPerYear param to calculateEMI.
    // Actually, I can just use calculateEMI and pass an adjusted annual rate: `interestRate * (12 / periodsPerYear)` so that when calculateEMI divides by 12, it gets the true periodRate.
    const effectiveAnnualRateForEMI = interestRate * (12 / periodsPerYear);
    
    const regularPayment = calculateEMI(amortizedAmount, effectiveAnnualRateForEMI, totalPeriods);
    
    const totalRegularPayments = regularPayment * totalPeriods;
    const totalPayments = totalRegularPayments + balloonPayment;
    const totalInterest = Math.max(0, totalPayments - loanAmount);
    
    const traditionalPayment = calculateEMI(loanAmount, effectiveAnnualRateForEMI, totalPeriods);
    const paymentSavings = Math.max(0, traditionalPayment - regularPayment);
    const interestPercentage = loanAmount > 0 ? (totalInterest / loanAmount) * 100 : 0;
    const effectiveRate = loanAmount > 0 ? ((totalPayments / loanAmount) ** (1 / loanTerm) - 1) * 100 : 0;
    
    const results: CalculatorResult[] = [
      {
        label: 'Regular Payment',
        value: regularPayment,
        type: 'currency',
        highlight: true,
        tooltip: `${paymentFrequency === 'monthly' ? 'Monthly' : 'Quarterly'} payment amount`
      },
      {
        label: 'Balloon Payment',
        value: balloonPayment,
        type: 'currency',
        tooltip: 'Final large payment due at loan maturity'
      },
      {
        label: 'Total Regular Payments',
        value: totalRegularPayments,
        type: 'currency',
        tooltip: 'Sum of all regular payments over loan term'
      },
      {
        label: 'Total Amount Paid',
        value: totalPayments,
        type: 'currency',
        tooltip: 'Total amount including regular payments and balloon payment'
      },
      {
        label: 'Total Interest',
        value: totalInterest,
        type: 'currency',
        tooltip: 'Total interest paid over the life of the loan'
      },
      {
        label: 'Interest as % of Loan',
        value: interestPercentage,
        type: 'percentage',
        tooltip: 'Total interest as percentage of loan amount'
      },
      {
        label: 'Traditional Loan Payment',
        value: traditionalPayment,
        type: 'currency',
        tooltip: 'What the payment would be for a traditional amortizing loan'
      },
      {
        label: 'Payment Savings',
        value: paymentSavings,
        type: 'currency',
        tooltip: 'Amount saved per payment compared to traditional loan'
      },
      {
        label: 'Effective Annual Rate',
        value: effectiveRate,
        type: 'percentage',
        tooltip: 'Effective annual cost of the balloon loan'
      }
    ];

    return { results };
  };

  const sidebar = (
    <div className="space-y-4">
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
    <BaseCalculatorTemplate<BalloonLoanInputs>
      title="Free Balloon Payment Loan Calculator"
      description="Calculate payments for balloon loans with lower regular payments and a large final payment. Compare with traditional loan options."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      sidebar={sidebar}
    />
  );
}
