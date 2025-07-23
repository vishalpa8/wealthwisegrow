"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateSalary, SalaryInputs } from '@/lib/calculations/tax';
import { parseRobustNumber } from '@/lib/utils/number';

const initialValues = {
  ctc: 1200000,
  basicPercent: 50,
  hraPercent: 40,
  pfContribution: 12,
  professionalTax: 2400,
  otherAllowances: 50000
};

export default function SalaryCalculatorPage() {
  const [values, setValues] = useState<SalaryInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const salaryResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Use flexible validation with graceful handling
      const validatedValues = {
        ctc: Math.abs(parseRobustNumber(values.ctc)) || 100000, // Default to minimum if zero
        basicPercent: Math.max(30, Math.min(70, Math.abs(parseRobustNumber(values.basicPercent)) || 50)), // Clamp between 30-70%
        hraPercent: Math.max(0, Math.min(50, Math.abs(parseRobustNumber(values.hraPercent)) || 40)), // Clamp between 0-50%
        pfContribution: Math.max(0, Math.min(12, Math.abs(parseRobustNumber(values.pfContribution)) || 12)), // Clamp between 0-12%
        professionalTax: Math.max(0, Math.min(30000, Math.abs(parseRobustNumber(values.professionalTax)) || 0)), // Clamp between 0-30000
        otherAllowances: Math.abs(parseRobustNumber(values.otherAllowances)) || 0
      };

      const calculation = calculateSalary(validatedValues);

      if (!calculation || isNaN(calculation.netSalary) || calculation.netSalary < 0) {
        // Return a default calculation instead of throwing error
        return {
          basicSalary: validatedValues.ctc * (validatedValues.basicPercent / 100) / 12,
          hra: validatedValues.ctc * (validatedValues.basicPercent / 100) * (validatedValues.hraPercent / 100) / 12,
          grossSalary: validatedValues.ctc / 12,
          pfDeduction: validatedValues.ctc * (validatedValues.basicPercent / 100) * (validatedValues.pfContribution / 100) / 12,
          incomeTax: 0,
          totalDeductions: validatedValues.ctc * (validatedValues.basicPercent / 100) * (validatedValues.pfContribution / 100) / 12 + validatedValues.professionalTax / 12,
          netSalary: validatedValues.ctc / 12 - (validatedValues.ctc * (validatedValues.basicPercent / 100) * (validatedValues.pfContribution / 100) / 12 + validatedValues.professionalTax / 12)
        };
      }

      return calculation;
    } catch (err: any) {
      console.error('Salary calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please verify your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Annual CTC',
      name: 'ctc',
      type: 'number',
      placeholder: '12,00,000',
      unit: currency.symbol,
      tooltip: 'Cost to Company - Total annual salary package'
    },
    {
      label: 'Basic Salary %',
      name: 'basicPercent',
      type: 'percentage',
      placeholder: '50',
      tooltip: 'Basic salary as percentage of CTC (typically 40-60%)'
    },
    {
      label: 'HRA %',
      name: 'hraPercent',
      type: 'percentage',
      placeholder: '40',
      tooltip: 'House Rent Allowance as percentage of basic salary'
    },
    {
      label: 'PF Contribution %',
      name: 'pfContribution',
      type: 'percentage',
      placeholder: '12',
      tooltip: 'Provident Fund contribution (maximum 12%)'
    },
    {
      label: 'Annual Professional Tax',
      name: 'professionalTax',
      type: 'number',
      placeholder: '2,400',
      unit: currency.symbol,
      tooltip: 'Annual professional tax (varies by state, max ₹2,500)'
    },
    {
      label: 'Other Allowances (Annual)',
      name: 'otherAllowances',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      tooltip: 'Medical, transport, and other annual allowances'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!salaryResults) return [];

    const yearlyNetSalary = salaryResults.netSalary * 12;
    const takeHomePercentage = (yearlyNetSalary / values.ctc) * 100;

    return [
      {
        label: 'Monthly Net Salary',
        value: salaryResults.netSalary,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly take-home salary after all deductions'
      },
      {
        label: 'Annual Net Salary',
        value: yearlyNetSalary,
        type: 'currency',
        tooltip: 'Annual take-home salary'
      },
      {
        label: 'Monthly Basic Salary',
        value: salaryResults.basicSalary,
        type: 'currency',
        tooltip: 'Monthly basic salary component'
      },
      {
        label: 'Monthly HRA',
        value: salaryResults.hra,
        type: 'currency',
        tooltip: 'House Rent Allowance per month'
      },
      {
        label: 'Monthly Gross Salary',
        value: salaryResults.grossSalary,
        type: 'currency',
        tooltip: 'Gross salary before deductions'
      },
      {
        label: 'Monthly PF Deduction',
        value: salaryResults.pfDeduction,
        type: 'currency',
        tooltip: 'Provident Fund deduction per month'
      },
      {
        label: 'Monthly Income Tax',
        value: salaryResults.incomeTax,
        type: 'currency',
        tooltip: 'Estimated income tax deduction per month'
      },
      {
        label: 'Total Monthly Deductions',
        value: salaryResults.totalDeductions,
        type: 'currency',
        tooltip: 'All deductions per month'
      },
      {
        label: 'Take-home %',
        value: takeHomePercentage,
        type: 'percentage',
        tooltip: 'Net salary as percentage of CTC'
      }
    ];
  }, [salaryResults, values.ctc, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 800);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Salary Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Understand all components of your CTC.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Optimize your tax deductions to maximize take-home pay.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Review your payslip regularly for accuracy.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Salary Calculator"
      description="Convert your CTC to in-hand salary with detailed breakdown of all components and deductions."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Salary Details"
        description="Enter your salary details to calculate your take-home pay."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={salaryResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}