"use client";

import { BaseCalculatorTemplate, ChartConfig } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";
import { PieChart, FileText, TrendingDown } from "lucide-react";

interface TaxPlanningInputs {
  annualIncome: number;
  age: number;
  section80C: number;
  section80D: number;
  section24B: number;
  otherDeductions: number;
  regime: 'old' | 'new';
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

function calculateTaxVal(taxableIncome: number, regime: 'old' | 'new', age: number): { tax: number; marginalRate: number } {
  const slabs = regime === 'old' ? [...oldRegimeTaxSlabs] : [...newRegimeTaxSlabs];
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

function calculateTaxPlanningCore(inputs: TaxPlanningInputs) {
  const annualIncome = Math.abs(parseRobustNumber(inputs.annualIncome));
  const age = Math.max(18, Math.abs(parseRobustNumber(inputs.age)));
  const section80C = Math.abs(parseRobustNumber(inputs.section80C));
  const section80D = Math.abs(parseRobustNumber(inputs.section80D));
  const section24B = Math.abs(parseRobustNumber(inputs.section24B));
  const otherDeductions = Math.abs(parseRobustNumber(inputs.otherDeductions));
  const regime = inputs.regime || 'new';

  if (annualIncome === 0) {
    return { grossIncome: 0, totalDeductions: 0, taxableIncome: 0, incomeTax: 0, cess: 0, totalTax: 0, netIncome: 0, effectiveTaxRate: 0, marginalTaxRate: 0, taxSavings: 0 };
  }

  let totalDeductions = 0;
  if (regime === 'old') {
    totalDeductions = Math.min(section80C, 150000) + Math.min(section80D, age >= 60 ? 50000 : 25000) + section24B + otherDeductions;
  }

  const taxableIncome = Math.max(0, annualIncome - totalDeductions);
  const { tax: incomeTax, marginalRate } = calculateTaxVal(taxableIncome, regime, age);
  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;
  const netIncome = annualIncome - totalTax;
  const effectiveTaxRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
  
  const { tax: taxWithoutDeductions } = calculateTaxVal(annualIncome, regime, age);
  const taxSavings = Math.max(0, (taxWithoutDeductions + taxWithoutDeductions * 0.04) - totalTax);

  return { grossIncome: annualIncome, totalDeductions, taxableIncome, incomeTax, cess, totalTax, netIncome, effectiveTaxRate, marginalTaxRate: marginalRate, taxSavings };
}

export default function TaxPlanningCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Annual Gross Income', name: 'annualIncome', type: 'number', placeholder: '12,00,000', unit: currency.symbol },
    { label: 'Age', name: 'age', type: 'number', placeholder: '30' },
    { label: 'Tax Regime', name: 'regime', type: 'select', options: [{ value: 'old', label: 'Old Tax Regime (with deductions)' }, { value: 'new', label: 'New Tax Regime (lower rates, no deductions)' }] },
    { label: 'Section 80C Deductions', name: 'section80C', type: 'number', placeholder: '1,50,000', unit: currency.symbol },
    { label: 'Section 80D (Health Insurance)', name: 'section80D', type: 'number', placeholder: '25,000', unit: currency.symbol },
    { label: 'Section 24B (Home Loan Interest)', name: 'section24B', type: 'number', placeholder: '2,00,000', unit: currency.symbol },
    { label: 'Other Deductions', name: 'otherDeductions', type: 'number', placeholder: '50,000', unit: currency.symbol }
  ];

  const calculate = (inputs: TaxPlanningInputs) => {
    const taxResults = calculateTaxPlanningCore(inputs);
    const oldRegimeResult = calculateTaxPlanningCore({ ...inputs, regime: 'old' });
    const newRegimeResult = calculateTaxPlanningCore({ ...inputs, regime: 'new' });

    const regimeComparison = {
      old: oldRegimeResult,
      new: newRegimeResult,
      savings: oldRegimeResult.totalTax - newRegimeResult.totalTax,
      betterRegime: oldRegimeResult.netIncome > newRegimeResult.netIncome ? 'old' : 'new'
    };

    const results: CalculatorResult[] = [
      { label: 'Net Take-Home Income', value: taxResults.netIncome, type: 'currency', highlight: true },
      { label: 'Total Tax Liability', value: taxResults.totalTax, type: 'currency' },
      { label: 'Taxable Income', value: taxResults.taxableIncome, type: 'currency' },
      { label: 'Total Deductions', value: taxResults.totalDeductions, type: 'currency' },
      { label: 'Effective Tax Rate', value: taxResults.effectiveTaxRate, type: 'percentage' },
      { label: 'Marginal Tax Rate', value: taxResults.marginalTaxRate, type: 'percentage' },
      { label: 'Tax Savings', value: taxResults.taxSavings, type: 'currency' }
    ];

    return { results, chartData: regimeComparison };
  };

  const charts: ChartConfig[] = [
    {
      id: "regime-comparison",
      render: (results, chartData: any) => {
        if (!chartData) return null;
        const formatAmt = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
        return (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Tax Regime Comparison
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center"><FileText className="w-4 h-4 mr-2" />Old Tax Regime</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Gross Income:</span><span className="font-medium">{formatAmt(chartData.old.grossIncome)}</span></div>
                  <div className="flex justify-between"><span>Total Deductions:</span><span className="font-medium">{formatAmt(chartData.old.totalDeductions)}</span></div>
                  <div className="flex justify-between"><span>Taxable Income:</span><span className="font-medium">{formatAmt(chartData.old.taxableIncome)}</span></div>
                  <div className="flex justify-between border-t border-blue-200 pt-2"><span>Total Tax:</span><span className="font-bold">{formatAmt(chartData.old.totalTax)}</span></div>
                  <div className="flex justify-between"><span>Net Income:</span><span className="font-bold text-blue-700">{formatAmt(chartData.old.netIncome)}</span></div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center"><TrendingDown className="w-4 h-4 mr-2" />New Tax Regime</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Gross Income:</span><span className="font-medium">{formatAmt(chartData.new.grossIncome)}</span></div>
                  <div className="flex justify-between"><span>Total Deductions:</span><span className="font-medium">{formatAmt(chartData.new.totalDeductions)}</span></div>
                  <div className="flex justify-between"><span>Taxable Income:</span><span className="font-medium">{formatAmt(chartData.new.taxableIncome)}</span></div>
                  <div className="flex justify-between border-t border-green-200 pt-2"><span>Total Tax:</span><span className="font-bold">{formatAmt(chartData.new.totalTax)}</span></div>
                  <div className="flex justify-between"><span>Net Income:</span><span className="font-bold text-green-700">{formatAmt(chartData.new.netIncome)}</span></div>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${chartData.betterRegime === 'old' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
              <h4 className="font-semibold mb-2">Recommendation: {chartData.betterRegime === 'old' ? 'Old Tax Regime' : 'New Tax Regime'}</h4>
              <p className="text-sm">The {chartData.betterRegime === 'old' ? 'old' : 'new'} tax regime gives you <span className="font-bold">{formatAmt(Math.abs(chartData.old.netIncome - chartData.new.netIncome))}</span> more in take-home income annually.</p>
              {chartData.savings !== 0 && (
                <p className="text-sm mt-1">Tax savings difference: <span className="font-bold">{formatAmt(Math.abs(chartData.savings))}</span></p>
              )}
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <BaseCalculatorTemplate<TaxPlanningInputs>
      title="Tax Planning Calculator"
      description="Compare old vs new tax regime, calculate tax liability, and optimize your tax savings with detailed analysis."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      charts={charts}
    />
  );
}
