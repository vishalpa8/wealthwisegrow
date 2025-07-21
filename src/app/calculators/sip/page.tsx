"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateSIP, SIPInputs } from '@/lib/calculations/savings';
import { sipSchema } from '@/lib/validations/calculator';

const initialValues = {
  monthlyInvestment: 5000,
  annualReturn: 12,
  years: 10
};

export default function SIPCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Monthly Investment',
      name: 'monthlyInvestment',
      type: 'number',
      placeholder: '5,000',
      min: 100,
      max: 1000000,
      required: true,
      tooltip: 'Amount you plan to invest every month through SIP'
    },
    {
      label: 'Expected Annual Return',
      name: 'annualReturn',
      type: 'percentage',
      placeholder: '12',
      min: 1,
      max: 50,
      required: true,
      tooltip: 'Expected annual return rate from your investments'
    },
    {
      label: 'Investment Period',
      name: 'years',
      type: 'number',
      placeholder: '10',
      min: 1,
      max: 50,
      unit: 'years',
      required: true,
      tooltip: 'Number of years you plan to continue the SIP'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      const validation = sipSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || 'Invalid input');
        return [];
      }

      // Ensure the data is correctly typed
      const sipInputs: SIPInputs = {
        monthlyInvestment: Number(validation.data.monthlyInvestment),
        annualReturn: Number(validation.data.annualReturn),
        years: Number(validation.data.years)
      };
      
      const calculation = calculateSIP(sipInputs);
      
      if (calculation.error) {
        setError(calculation.error);
        return [];
      }

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Maturity Amount',
          value: calculation.maturityAmount,
          type: 'currency',
          highlight: true,
          tooltip: 'Total amount you will receive at maturity'
        },
        {
          label: 'Total Investment',
          value: calculation.totalInvestment,
          type: 'currency',
          tooltip: 'Total amount you will invest over the period'
        },
        {
          label: 'Total Returns',
          value: calculation.totalGains,
          type: 'currency',
          tooltip: 'Profit earned from your investments'
        },
        {
          label: 'Effective Annual Return',
          value: ((calculation.maturityAmount / calculation.totalInvestment) ** (1 / values.years) - 1) * 100,
          type: 'percentage',
          tooltip: 'Annualized return rate considering compounding'
        }
      ];

      return calculatorResults;
    } catch {
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="SIP Calculator"
        description="Calculate the future value of your Systematic Investment Plan (SIP) investments with the power of compounding."
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
