"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from '@/lib/utils/number';

const initialValues = {
  taxType: 'income',
  annualIncome: 1000000,
  age: 30,
  regime: 'new',
  deductions80C: 150000,
  deductions80D: 25000,
  hraReceived: 200000,
  hraExemption: 100000,
  otherDeductions: 50000,
  capitalGains: 0,
  capitalGainsType: 'short-term',
  businessIncome: 0,
  professionalTax: 2400,
  tdsDeducted: 50000
};

interface TaxInputs {
  taxType: string;
  annualIncome: number;
  age: number;
  regime: string;
  deductions80C: number;
  deductions80D: number;
  hraReceived: number;
  hraExemption: number;
  otherDeductions: number;
  capitalGains: number;
  capitalGainsType: string;
  businessIncome: number;
  professionalTax: number;
  tdsDeducted: number;
}

function calculateTax(inputs: TaxInputs) {
  // Use parseRobustNumber for flexible input handling
  const taxType = inputs.taxType || 'income';
  const annualIncome = Math.abs(parseRobustNumber(inputs.annualIncome)) || 0;
  const age = Math.max(18, Math.min(100, Math.abs(parseRobustNumber(inputs.age)) || 30));
  const regime = inputs.regime || 'new';
  const deductions80C = Math.abs(parseRobustNumber(inputs.deductions80C)) || 0;
  const deductions80D = Math.abs(parseRobustNumber(inputs.deductions80D)) || 0;
  const hraReceived = Math.abs(parseRobustNumber(inputs.hraReceived)) || 0;
  const hraExemption = Math.abs(parseRobustNumber(inputs.hraExemption)) || 0;
  const otherDeductions = Math.abs(parseRobustNumber(inputs.otherDeductions)) || 0;
  const capitalGains = Math.abs(parseRobustNumber(inputs.capitalGains)) || 0;
  const capitalGainsType = inputs.capitalGainsType || 'short-term';
  const businessIncome = Math.abs(parseRobustNumber(inputs.businessIncome)) || 0;
  const professionalTax = Math.abs(parseRobustNumber(inputs.professionalTax)) || 0;
  const tdsDeducted = Math.abs(parseRobustNumber(inputs.tdsDeducted)) || 0;

  let taxableIncome = annualIncome + businessIncome;
  let totalDeductions = 0;
  let incomeTax = 0;
  let cess = 0;
  let totalTax = 0;

  // Basic exemption limit based on age
  let exemptionLimit = 250000; // Below 60
  if (age >= 60 && age < 80) exemptionLimit = 300000; // Senior citizen
  if (age >= 80) exemptionLimit = 500000; // Super senior citizen

  if (taxType === 'income') {
    // Calculate deductions based on regime
    if (regime === 'old') {
      totalDeductions = Math.min(deductions80C, 150000) + 
                       Math.min(deductions80D, age >= 60 ? 50000 : 25000) +
                       Math.min(hraExemption, hraReceived) +
                       otherDeductions;
      
      // Standard deduction for old regime
      totalDeductions += 50000;
    } else {
      // New regime - limited deductions
      totalDeductions = Math.min(deductions80C, 150000); // Only 80C allowed in new regime
      
      // Higher exemption limits in new regime
      exemptionLimit = 300000; // Standard exemption in new regime
    }

    taxableIncome = Math.max(0, taxableIncome - totalDeductions);

    // Calculate income tax based on slabs
    if (regime === 'old') {
      // Old regime tax slabs
      if (taxableIncome > exemptionLimit) {
        const taxableAmount = taxableIncome - exemptionLimit;
        
        if (taxableAmount <= 250000) {
          incomeTax += taxableAmount * 0.05;
        } else if (taxableAmount <= 500000) {
          incomeTax += 250000 * 0.05 + (taxableAmount - 250000) * 0.20;
        } else if (taxableAmount <= 1000000) {
          incomeTax += 250000 * 0.05 + 250000 * 0.20 + (taxableAmount - 500000) * 0.30;
        } else {
          incomeTax += 250000 * 0.05 + 250000 * 0.20 + 500000 * 0.30 + (taxableAmount - 1000000) * 0.30;
        }
      }
    } else {
      // New regime tax slabs (2023-24)
      if (taxableIncome > 300000) {
        const taxableAmount = taxableIncome - 300000;
        
        if (taxableAmount <= 300000) {
          incomeTax += taxableAmount * 0.05;
        } else if (taxableAmount <= 600000) {
          incomeTax += 300000 * 0.05 + (taxableAmount - 300000) * 0.10;
        } else if (taxableAmount <= 900000) {
          incomeTax += 300000 * 0.05 + 300000 * 0.10 + (taxableAmount - 600000) * 0.15;
        } else if (taxableAmount <= 1200000) {
          incomeTax += 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + (taxableAmount - 900000) * 0.20;
        } else if (taxableAmount <= 1500000) {
          incomeTax += 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + 300000 * 0.20 + (taxableAmount - 1200000) * 0.25;
        } else {
          incomeTax += 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + 300000 * 0.20 + 300000 * 0.25 + (taxableAmount - 1500000) * 0.30;
        }
      }
    }

    // Add capital gains tax
    if (capitalGains > 0) {
      if (capitalGainsType === 'short-term') {
        incomeTax += capitalGains * 0.15; // 15% for short-term capital gains
      } else {
        incomeTax += Math.max(0, capitalGains - 100000) * 0.10; // 10% for long-term (after 1L exemption)
      }
    }

    // Calculate cess (4% of income tax)
    cess = incomeTax * 0.04;
    totalTax = incomeTax + cess;

  } else if (taxType === 'gst') {
    // GST calculation (simplified)
    const gstRate = 0.18; // Assuming 18% GST
    totalTax = annualIncome * gstRate;
  }

  // Calculate refund/additional tax
  const netTaxPayable = totalTax - tdsDeducted - professionalTax;
  const refundAmount = Math.max(0, -netTaxPayable);
  const additionalTaxDue = Math.max(0, netTaxPayable);

  // Calculate effective tax rate
  const effectiveTaxRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
  const marginalTaxRate = calculateMarginalRate(taxableIncome, regime);

  return {
    grossIncome: annualIncome + businessIncome,
    totalDeductions,
    taxableIncome,
    exemptionLimit,
    incomeTax,
    cess,
    totalTax,
    tdsDeducted,
    professionalTax,
    netTaxPayable,
    refundAmount,
    additionalTaxDue,
    effectiveTaxRate,
    marginalTaxRate,
    netIncome: annualIncome + businessIncome - totalTax,
    monthlyTakeHome: (annualIncome + businessIncome - totalTax) / 12
  };
}

function calculateMarginalRate(taxableIncome: number, regime: string): number {
  if (regime === 'old') {
    if (taxableIncome <= 250000) return 0;
    if (taxableIncome <= 500000) return 5;
    if (taxableIncome <= 1000000) return 20;
    return 30;
  } else {
    if (taxableIncome <= 300000) return 0;
    if (taxableIncome <= 600000) return 5;
    if (taxableIncome <= 900000) return 10;
    if (taxableIncome <= 1200000) return 15;
    if (taxableIncome <= 1500000) return 20;
    return 30;
  }
}

export default function TaxCalculatorPage() {
  const [values, setValues] = useState<TaxInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const taxResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases gracefully
      const calculation = calculateTax(values);
      return calculation;
    } catch (err: any) {
      console.error('Tax calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Tax Type',
      name: 'taxType',
      type: 'select',
      options: [
        { value: 'income', label: 'Income Tax' },
        { value: 'gst', label: 'GST Calculator' },
        { value: 'capital-gains', label: 'Capital Gains Tax' }
      ],
      tooltip: 'Type of tax calculation you need'
    },
    {
      label: 'Annual Income',
      name: 'annualIncome',
      type: 'number',
      placeholder: '10,00,000',
      unit: currency.symbol,
      tooltip: 'Your total annual income from salary/business'
    },
    {
      label: 'Age',
      name: 'age',
      type: 'number',
      placeholder: '30',
      tooltip: 'Your age (affects exemption limits)'
    },
    {
      label: 'Tax Regime',
      name: 'regime',
      type: 'select',
      options: [
        { value: 'new', label: 'New Tax Regime' },
        { value: 'old', label: 'Old Tax Regime' }
      ],
      tooltip: 'Choose between old and new tax regimes'
    },
    {
      label: 'Deductions under 80C',
      name: 'deductions80C',
      type: 'number',
      placeholder: '1,50,000',
      unit: currency.symbol,
      tooltip: 'Investments in PPF, ELSS, life insurance, etc.'
    },
    {
      label: 'Deductions under 80D',
      name: 'deductions80D',
      type: 'number',
      placeholder: '25,000',
      unit: currency.symbol,
      tooltip: 'Health insurance premiums'
    },
    {
      label: 'HRA Received',
      name: 'hraReceived',
      type: 'number',
      placeholder: '2,00,000',
      unit: currency.symbol,
      tooltip: 'House Rent Allowance received from employer'
    },
    {
      label: 'HRA Exemption',
      name: 'hraExemption',
      type: 'number',
      placeholder: '1,00,000',
      unit: currency.symbol,
      tooltip: 'Eligible HRA exemption amount'
    },
    {
      label: 'Other Deductions',
      name: 'otherDeductions',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      tooltip: 'Other eligible deductions (80E, 80G, etc.)'
    },
    {
      label: 'Capital Gains',
      name: 'capitalGains',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      tooltip: 'Capital gains from investments'
    },
    {
      label: 'Capital Gains Type',
      name: 'capitalGainsType',
      type: 'select',
      options: [
        { value: 'short-term', label: 'Short-term (< 1 year)' },
        { value: 'long-term', label: 'Long-term (> 1 year)' }
      ],
      tooltip: 'Duration of investment holding'
    },
    {
      label: 'Business Income',
      name: 'businessIncome',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      tooltip: 'Income from business or profession'
    },
    {
      label: 'Professional Tax',
      name: 'professionalTax',
      type: 'number',
      placeholder: '2,400',
      unit: currency.symbol,
      tooltip: 'Professional tax paid during the year'
    },
    {
      label: 'TDS Deducted',
      name: 'tdsDeducted',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      tooltip: 'Tax deducted at source by employer/others'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!taxResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Total Tax Payable',
        value: taxResults.totalTax,
        type: 'currency',
        highlight: true,
        tooltip: 'Total income tax including cess'
      },
      {
        label: 'Gross Income',
        value: taxResults.grossIncome,
        type: 'currency',
        tooltip: 'Total income before deductions'
      },
      {
        label: 'Total Deductions',
        value: taxResults.totalDeductions,
        type: 'currency',
        tooltip: 'Total eligible deductions claimed'
      },
      {
        label: 'Taxable Income',
        value: taxResults.taxableIncome,
        type: 'currency',
        tooltip: 'Income after deductions and exemptions'
      },
      {
        label: 'Income Tax',
        value: taxResults.incomeTax,
        type: 'currency',
        tooltip: 'Tax before adding cess'
      },
      {
        label: 'Health & Education Cess',
        value: taxResults.cess,
        type: 'currency',
        tooltip: '4% cess on income tax'
      },
      {
        label: 'Effective Tax Rate',
        value: taxResults.effectiveTaxRate,
        type: 'percentage',
        tooltip: 'Tax as percentage of gross income'
      },
      {
        label: 'Marginal Tax Rate',
        value: taxResults.marginalTaxRate,
        type: 'percentage',
        tooltip: 'Tax rate on next rupee of income'
      },
      {
        label: 'Net Income',
        value: taxResults.netIncome,
        type: 'currency',
        tooltip: 'Income after paying taxes'
      },
      {
        label: 'Monthly Take-home',
        value: taxResults.monthlyTakeHome,
        type: 'currency',
        tooltip: 'Average monthly income after tax'
      }
    ];

    // Add refund/additional tax information
    if (taxResults.refundAmount > 0) {
      calculatorResults.push({
        label: 'Tax Refund',
        value: taxResults.refundAmount,
        type: 'currency',
        tooltip: 'Refund due from excess TDS/advance tax'
      });
    } else if (taxResults.additionalTaxDue > 0) {
      calculatorResults.push({
        label: 'Additional Tax Due',
        value: taxResults.additionalTaxDue,
        type: 'currency',
        tooltip: 'Additional tax to be paid'
      });
    }

    return calculatorResults;
  }, [taxResults, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 700);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Tax Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Understand both tax regimes before choosing.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Maximize eligible deductions like 80C and 80D.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Keep track of all income sources and TDS.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Tax Calculator"
      description="Calculate your income tax liability under both old and new tax regimes. Get detailed breakdown of taxes, deductions, and take-home income."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Tax Details"
        description="Enter your financial details to calculate your tax."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={taxResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}