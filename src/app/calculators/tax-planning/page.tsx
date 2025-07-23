"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { Button } from '@/components/ui/button';
import { PieChart, FileText, TrendingDown } from 'lucide-react';
import { parseRobustNumber } from '@/lib/utils/number';

interface TaxPlanningInputs {
  annualIncome: number;
  age: number;
  section80C: number;
  section80D: number;
  section24B: number;
  otherDeductions: number;
  regime: 'old' | 'new';
}

interface TaxCalculationResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  totalTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  taxSavings: number;
}

const initialValues: TaxPlanningInputs = {
  annualIncome: 1200000,
  age: 30,
  section80C: 150000,
  section80D: 25000,
  section24B: 200000,
  otherDeductions: 50000,
  regime: 'old'
};

// Tax slabs for FY 2023-24
const oldRegimeTaxSlabs = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 }
];

const newRegimeTaxSlabs = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 5 },
  { min: 600000, max: 900000, rate: 10 },
  { min: 900000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 }
];

function calculateTax(taxableIncome: number, regime: 'old' | 'new', age: number): { tax: number; marginalRate: number } {
  const slabs = regime === 'old' ? [...oldRegimeTaxSlabs] : [...newRegimeTaxSlabs];
  
  // Adjust for senior citizen benefits in old regime
  if (regime === 'old' && age >= 60 && slabs[0]) {
    slabs[0].max = age >= 80 ? 500000 : 300000;
  }
  
  let tax = 0;
  let marginalRate = 0;
  
  for (const slab of slabs) {
    if (taxableIncome > slab.min) {
      const taxableInThisSlab = Math.min(taxableIncome, slab.max) - slab.min;
      tax += (taxableInThisSlab * slab.rate) / 100;
      marginalRate = slab.rate;
    }
  }
  
  return { tax, marginalRate };
}

function calculateTaxPlanning(inputs: TaxPlanningInputs): TaxCalculationResult {
  // Use parseRobustNumber for flexible input handling
  const annualIncome = Math.abs(parseRobustNumber(inputs.annualIncome));
  const age = Math.max(18, Math.abs(parseRobustNumber(inputs.age)));
  const section80C = Math.abs(parseRobustNumber(inputs.section80C));
  const section80D = Math.abs(parseRobustNumber(inputs.section80D));
  const section24B = Math.abs(parseRobustNumber(inputs.section24B));
  const otherDeductions = Math.abs(parseRobustNumber(inputs.otherDeductions));
  const regime = inputs.regime || 'new';
  
  // Handle edge case of zero income gracefully
  if (annualIncome === 0) {
    return {
      grossIncome: 0,
      totalDeductions: 0,
      taxableIncome: 0,
      incomeTax: 0,
      cess: 0,
      totalTax: 0,
      netIncome: 0,
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      taxSavings: 0
    };
  }

  let totalDeductions = 0;
  
  if (regime === 'old') {
    // Old regime allows deductions
    totalDeductions = Math.min(section80C, 150000) + 
                     Math.min(section80D, age >= 60 ? 50000 : 25000) + 
                     section24B + 
                     otherDeductions;
  }
  // New regime doesn't allow most deductions
  
  const taxableIncome = Math.max(0, annualIncome - totalDeductions);
  const { tax: incomeTax, marginalRate } = calculateTax(taxableIncome, regime, age);
  
  // Add 4% cess on income tax
  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;
  const netIncome = annualIncome - totalTax;
  const effectiveTaxRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
  
  // Calculate tax savings compared to no deductions
  const { tax: taxWithoutDeductions } = calculateTax(annualIncome, regime, age);
  const taxSavings = (taxWithoutDeductions + taxWithoutDeductions * 0.04) - totalTax;

  return {
    grossIncome: annualIncome,
    totalDeductions,
    taxableIncome,
    incomeTax,
    cess,
    totalTax,
    netIncome,
    effectiveTaxRate,
    marginalTaxRate: marginalRate,
    taxSavings: Math.max(0, taxSavings)
  };
}

export default function TaxPlanningCalculatorPage() {
  const [values, setValues] = useState<TaxPlanningInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);
  const [showComparison, setShowComparison] = useState(false);

  const { currency, formatCurrency } = useCurrency();

  const taxResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases gracefully
      const calculation = calculateTaxPlanning(values);
      return calculation;
    } catch (err: any) {
      console.error('Tax calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  // Calculate comparison between old and new regime
  const regimeComparison = useMemo(() => {
    if (!taxResults) return null;
    
    try {
      const oldRegimeResult = calculateTaxPlanning({ ...values, regime: 'old' });
      const newRegimeResult = calculateTaxPlanning({ ...values, regime: 'new' });
      
      return {
        old: oldRegimeResult,
        new: newRegimeResult,
        savings: oldRegimeResult.totalTax - newRegimeResult.totalTax,
        betterRegime: oldRegimeResult.netIncome > newRegimeResult.netIncome ? 'old' : 'new'
      };
    } catch {
      return null;
    }
  }, [values, taxResults]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Annual Gross Income',
      name: 'annualIncome',
      type: 'number',
      placeholder: '12,00,000',
      unit: currency.symbol,
      tooltip: 'Your total annual income before any deductions'
    },
    {
      label: 'Age',
      name: 'age',
      type: 'number',
      placeholder: '30',
      tooltip: 'Your age (affects senior citizen tax benefits)'
    },
    {
      label: 'Tax Regime',
      name: 'regime',
      type: 'select',
      options: [
        { value: 'old', label: 'Old Tax Regime (with deductions)' },
        { value: 'new', label: 'New Tax Regime (lower rates, no deductions)' }
      ],
      tooltip: 'Choose between old regime with deductions or new regime with lower tax rates'
    },
    {
      label: 'Section 80C Deductions',
      name: 'section80C',
      type: 'number',
      placeholder: '1,50,000',
      unit: currency.symbol,
      tooltip: 'PPF, ELSS, Life Insurance, etc. (Max: ₹1,50,000)'
    },
    {
      label: 'Section 80D (Health Insurance)',
      name: 'section80D',
      type: 'number',
      placeholder: '25,000',
      unit: currency.symbol,
      tooltip: 'Health insurance premiums (Max: ₹25,000 for <60 years, ₹50,000 for 60+ years)'
    },
    {
      label: 'Section 24B (Home Loan Interest)',
      name: 'section24B',
      type: 'number',
      placeholder: '2,00,000',
      unit: currency.symbol,
      tooltip: 'Home loan interest deduction (Max: ₹2,00,000 for self-occupied property)'
    },
    {
      label: 'Other Deductions',
      name: 'otherDeductions',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      tooltip: 'Other eligible deductions (80E, 80G, etc.)'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!taxResults) return [];

    return [
      {
        label: 'Net Take-Home Income',
        value: taxResults.netIncome,
        type: 'currency',
        highlight: true,
        tooltip: 'Annual income after tax deductions'
      },
      {
        label: 'Total Tax Liability',
        value: taxResults.totalTax,
        type: 'currency',
        tooltip: 'Total income tax + cess to be paid'
      },
      {
        label: 'Taxable Income',
        value: taxResults.taxableIncome,
        type: 'currency',
        tooltip: 'Income after all eligible deductions'
      },
      {
        label: 'Total Deductions',
        value: taxResults.totalDeductions,
        type: 'currency',
        tooltip: 'Sum of all tax deductions claimed'
      },
      {
        label: 'Effective Tax Rate',
        value: taxResults.effectiveTaxRate,
        type: 'percentage',
        tooltip: 'Actual tax rate on your total income'
      },
      {
        label: 'Marginal Tax Rate',
        value: taxResults.marginalTaxRate,
        type: 'percentage',
        tooltip: 'Tax rate on your next rupee of income'
      },
      {
        label: 'Tax Savings',
        value: taxResults.taxSavings,
        type: 'currency',
        tooltip: 'Tax saved due to deductions and investments'
      }
    ];
  }, [taxResults]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Tax Planning Tools</h3>
        <div className="space-y-3">
          <Button
            onClick={() => setShowComparison(!showComparison)}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center"
          >
            <PieChart className="w-4 h-4 mr-2" />
            {showComparison ? 'Hide' : 'Show'} Regime Comparison
          </Button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Tax Saving Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Maximize Section 80C investments early in the year.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider health insurance for 80D benefits.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare both tax regimes annually.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Plan investments for long-term tax efficiency.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Tax Planning Calculator"
      description="Compare old vs new tax regime, calculate tax liability, and optimize your tax savings with detailed analysis."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Tax Planning Details"
        description="Enter your income and deduction details for comprehensive tax planning."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={taxResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />

      {/* Regime Comparison */}
      {showComparison && regimeComparison && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Tax Regime Comparison
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Old Regime */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Old Tax Regime
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Income:</span>
                  <span className="font-medium">{formatCurrency(regimeComparison.old.grossIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deductions:</span>
                  <span className="font-medium">{formatCurrency(regimeComparison.old.totalDeductions)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Income:</span>
                  <span className="font-medium">{formatCurrency(regimeComparison.old.taxableIncome)}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span>Total Tax:</span>
                  <span className="font-bold">{formatCurrency(regimeComparison.old.totalTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Income:</span>
                  <span className="font-bold text-blue-700">{formatCurrency(regimeComparison.old.netIncome)}</span>
                </div>
              </div>
            </div>

            {/* New Regime */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <TrendingDown className="w-4 h-4 mr-2" />
                New Tax Regime
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Income:</span>
                  <span className="font-medium">{formatCurrency(regimeComparison.new.grossIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deductions:</span>
                  <span className="font-medium">{formatCurrency(regimeComparison.new.totalDeductions)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Income:</span>
                  <span className="font-medium">{formatCurrency(regimeComparison.new.taxableIncome)}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2">
                  <span>Total Tax:</span>
                  <span className="font-bold">{formatCurrency(regimeComparison.new.totalTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Income:</span>
                  <span className="font-bold text-green-700">{formatCurrency(regimeComparison.new.netIncome)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`p-4 rounded-lg border ${
            regimeComparison.betterRegime === 'old' 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <h4 className="font-semibold mb-2">
              💡 Recommendation: {regimeComparison.betterRegime === 'old' ? 'Old Tax Regime' : 'New Tax Regime'}
            </h4>
            <p className="text-sm">
              The {regimeComparison.betterRegime === 'old' ? 'old' : 'new'} tax regime gives you{' '}
              <span className="font-bold">
                {formatCurrency(Math.abs(regimeComparison.old.netIncome - regimeComparison.new.netIncome))}
              </span>{' '}
              more in take-home income annually.
            </p>
            {regimeComparison.savings !== 0 && (
              <p className="text-sm mt-1">
                Tax savings: <span className="font-bold">{formatCurrency(Math.abs(regimeComparison.savings))}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}