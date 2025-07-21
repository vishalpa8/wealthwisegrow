"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateGST, GSTInputs } from '@/lib/calculations/tax';
import { gstSchema } from '@/lib/validations/calculator';

const initialValues = {
  amount: 10000,
  gstRate: 18,
  type: 'exclusive'
};

export default function GSTCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Amount',
      name: 'amount',
      type: 'number',
      placeholder: '10,000',
      min: 1,
      max: 100000000,
      required: true,
      tooltip: 'Enter the base amount (exclusive) or total amount (inclusive)'
    },
    {
      label: 'GST Rate',
      name: 'gstRate',
      type: 'percentage',
      placeholder: '18',
      min: 0,
      max: 28,
      step: 0.1,
      required: true,
      tooltip: 'GST rate applicable (0%, 5%, 12%, 18%, 28%)'
    },
    {
      label: 'Amount Type',
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { value: 'exclusive', label: 'GST Exclusive (Add GST)' },
        { value: 'inclusive', label: 'GST Inclusive (Extract GST)' }
      ],
      tooltip: 'Whether the amount includes GST or not'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      const validation = gstSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || 'Invalid input');
        return [];
      }

      const calculation = calculateGST(validation.data as GSTInputs);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Total Amount',
          value: calculation.totalAmount,
          type: 'currency',
          highlight: true,
          tooltip: 'Total amount including GST'
        },
        {
          label: 'Original Amount',
          value: calculation.originalAmount,
          type: 'currency',
          tooltip: 'Amount before GST'
        },
        {
          label: 'GST Amount',
          value: calculation.gstAmount,
          type: 'currency',
          tooltip: 'Total GST amount'
        },
        {
          label: 'CGST',
          value: calculation.cgst,
          type: 'currency',
          tooltip: 'Central GST (for intra-state transactions)'
        },
        {
          label: 'SGST',
          value: calculation.sgst,
          type: 'currency',
          tooltip: 'State GST (for intra-state transactions)'
        },
        {
          label: 'IGST',
          value: calculation.igst,
          type: 'currency',
          tooltip: 'Integrated GST (for inter-state transactions)'
        }
      ];

      return calculatorResults;
    } catch (err) {
      console.error('GST calculation error:', err);
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    const parsedValue = (name === 'amount' || name === 'gstRate') ? parseFloat(value) : value;
    setValues(prev => ({ ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="GST Calculator"
        description="Calculate GST amount, CGST, SGST, and IGST for your business transactions."
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
