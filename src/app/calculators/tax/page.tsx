"use client";

import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";

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
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Tax Type', name: 'taxType', type: 'select', options: [{ value: 'income', label: 'Income Tax' }, { value: 'gst', label: 'GST Calculator' }, { value: 'capital-gains', label: 'Capital Gains Tax' }] },
    { label: 'Annual Income', name: 'annualIncome', type: 'number', placeholder: '10,00,000', unit: currency.symbol },
    { label: 'Age', name: 'age', type: 'number', placeholder: '30' },
    { label: 'Tax Regime', name: 'regime', type: 'select', options: [{ value: 'new', label: 'New Tax Regime' }, { value: 'old', label: 'Old Tax Regime' }] },
    { label: 'Deductions under 80C', name: 'deductions80C', type: 'number', placeholder: '1,50,000', unit: currency.symbol },
    { label: 'Deductions under 80D', name: 'deductions80D', type: 'number', placeholder: '25,000', unit: currency.symbol },
    { label: 'HRA Received', name: 'hraReceived', type: 'number', placeholder: '2,00,000', unit: currency.symbol },
    { label: 'HRA Exemption', name: 'hraExemption', type: 'number', placeholder: '1,00,000', unit: currency.symbol },
    { label: 'Other Deductions', name: 'otherDeductions', type: 'number', placeholder: '50,000', unit: currency.symbol },
    { label: 'Capital Gains', name: 'capitalGains', type: 'number', placeholder: '0', unit: currency.symbol },
    { label: 'Capital Gains Type', name: 'capitalGainsType', type: 'select', options: [{ value: 'short-term', label: 'Short-term (< 1 year)' }, { value: 'long-term', label: 'Long-term (> 1 year)' }] },
    { label: 'Business Income', name: 'businessIncome', type: 'number', placeholder: '0', unit: currency.symbol },
    { label: 'Professional Tax', name: 'professionalTax', type: 'number', placeholder: '2,400', unit: currency.symbol },
    { label: 'TDS Deducted', name: 'tdsDeducted', type: 'number', placeholder: '50,000', unit: currency.symbol }
  ];

  const calculate = (inputs: TaxInputs) => {
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

    let exemptionLimit = 250000;
    if (age >= 60 && age < 80) exemptionLimit = 300000;
    if (age >= 80) exemptionLimit = 500000;

    if (taxType === 'income') {
      if (regime === 'old') {
        totalDeductions = Math.min(deductions80C, 150000) + 
                         Math.min(deductions80D, age >= 60 ? 50000 : 25000) +
                         Math.min(hraExemption, hraReceived) +
                         otherDeductions + 50000;
      } else {
        totalDeductions = Math.min(deductions80C, 150000);
        exemptionLimit = 300000;
      }

      taxableIncome = Math.max(0, taxableIncome - totalDeductions);

      if (regime === 'old') {
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

      if (capitalGains > 0) {
        if (capitalGainsType === 'short-term') {
          incomeTax += capitalGains * 0.15;
        } else {
          incomeTax += Math.max(0, capitalGains - 100000) * 0.10;
        }
      }

      cess = incomeTax * 0.04;
      totalTax = incomeTax + cess;

    } else if (taxType === 'gst') {
      const gstRate = 0.18;
      totalTax = annualIncome * gstRate;
    }

    const netTaxPayable = totalTax - tdsDeducted - professionalTax;
    const refundAmount = Math.max(0, -netTaxPayable);
    const additionalTaxDue = Math.max(0, netTaxPayable);

    const effectiveTaxRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
    const marginalTaxRate = calculateMarginalRate(taxableIncome, regime);

    const grossIncomeResult = annualIncome + businessIncome;
    const netIncomeResult = annualIncome + businessIncome - totalTax;

    const results: CalculatorResult[] = [
      { label: 'Total Tax Payable', value: totalTax, type: 'currency', highlight: true },
      { label: 'Gross Income', value: grossIncomeResult, type: 'currency' },
      { label: 'Total Deductions', value: totalDeductions, type: 'currency' },
      { label: 'Taxable Income', value: taxableIncome, type: 'currency' },
      { label: 'Income Tax', value: incomeTax, type: 'currency' },
      { label: 'Health & Education Cess', value: cess, type: 'currency' },
      { label: 'Effective Tax Rate', value: effectiveTaxRate, type: 'percentage' },
      { label: 'Marginal Tax Rate', value: marginalTaxRate, type: 'percentage' },
      { label: 'Net Income', value: netIncomeResult, type: 'currency' },
      { label: 'Monthly Take-home', value: netIncomeResult / 12, type: 'currency' }
    ];

    if (refundAmount > 0) {
      results.push({ label: 'Tax Refund', value: refundAmount, type: 'currency' });
    } else if (additionalTaxDue > 0) {
      results.push({ label: 'Additional Tax Due', value: additionalTaxDue, type: 'currency' });
    }

    return { results };
  };

  return (
    <BaseCalculatorTemplate<TaxInputs>
      title="Personal Income Tax Liability Calculator"
      description="Calculate your income tax liability under both old and new tax regimes. Get detailed breakdown of taxes, deductions, and take-home income."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
