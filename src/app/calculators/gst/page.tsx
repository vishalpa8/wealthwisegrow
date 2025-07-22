"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateGST, GSTInputs } from '@/lib/calculations/tax';
import { gstSchema } from '@/lib/validations/calculator';

const initialValues = {
  amount: 10000,
  gstRate: 18,
  type: 'exclusive' as const,
};

export default function GSTCalculatorPage() {
  const [values, setValues] = useState<GSTInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const gstResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      const validation = gstSchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        throw new Error(errorMessage);
      }

      const calculation = calculateGST(values);

      return calculation;
    } catch (err: any) {
      console.error('GST calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Amount',
      name: 'amount',
      type: 'number',
      placeholder: '10,000',
      unit: currency.symbol,
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

  const results: CalculatorResult[] = useMemo(() => {
    if (!gstResults) return [];

    return [
      {
        label: 'Total Amount',
        value: gstResults.totalAmount,
        type: 'currency',
        highlight: true,
        tooltip: 'Total amount including GST'
      },
      {
        label: 'Original Amount',
        value: gstResults.originalAmount,
        type: 'currency',
        tooltip: 'Amount before GST'
      },
      {
        label: 'GST Amount',
        value: gstResults.gstAmount,
        type: 'currency',
        tooltip: 'Total GST amount'
      },
      {
        label: 'CGST',
        value: gstResults.cgst,
        type: 'currency',
        tooltip: 'Central GST (for intra-state transactions)'
      },
      {
        label: 'SGST',
        value: gstResults.sgst,
        type: 'currency',
        tooltip: 'State GST (for intra-state transactions)'
      },
      {
        label: 'IGST',
        value: gstResults.igst,
        type: 'currency',
        tooltip: 'Integrated GST (for inter-state transactions)'
      }
    ];
  }, [gstResults, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 500);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">GST Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Understand the different GST rates for goods and services.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">File your GST returns on time to avoid penalties.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Maintain proper records for GST compliance.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="GST Calculator"
      description="Calculate GST amount, CGST, SGST, and IGST for your business transactions."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="GST Details"
        description="Enter amount and GST rate to calculate."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={gstResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}