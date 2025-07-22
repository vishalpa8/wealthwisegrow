"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';

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
  const {
    taxType,
    annualIncome,
    age,
    regime,
    deductions80C,
    deductions80D,
    hraReceived,
    hraExemption,
    otherDeductions,
    capitalGains,
    capitalGainsType,
    businessIncome,
    professionalTax,
    tdsDeducted
  } = inputs;

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
        } else if (taxableAmount <= 300000) {
          incomeTax += 300000 * 0.05 + (taxableAmount - 300000) * 0.10;
        } else if (taxableAmount <= 300000) {
          incomeTax += 300000 * 0.05 + 300000 * 0.10 + (taxableAmount - 600000) * 0.15;
        } else if (taxableAmount <= 300000) {
          incomeTax += 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + (taxableAmount - 900000) * 0.20;
        } else if (taxableAmount <= 300000) {
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
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
      required: true,
      tooltip: 'Type of tax calculation you need'
    },
    {
      label: 'Annual Income',
      name: 'annualIncome',
      type: 'number',
      placeholder: '10,00,000',
      min: 0,
      max: 100000000,
      required: true,
      tooltip: 'Your total annual income from salary/business'
    },
    {
      label: 'Age',
      name: 'age',
      type: 'number',
      placeholder: '30',
      min: 18,
      max: 100,
      required: true,
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
      required: true,
      tooltip: 'Choose between old and new tax regimes'
    },
    {
      label: 'Deductions under 80C',
      name: 'deductions80C',
      type: 'number',
      placeholder: '1,50,000',
      min: 0,
      max: 150000,
      tooltip: 'Investments in PPF, ELSS, life insurance, etc.'
    },
    {
      label: 'Deductions under 80D',
      name: 'deductions80D',
      type: 'number',
      placeholder: '25,000',
      min: 0,
      max: 100000,
      tooltip: 'Health insurance premiums'
    },
    {
      label: 'HRA Received',
      name: 'hraReceived',
      type: 'number',
      placeholder: '2,00,000',
      min: 0,
      max: 5000000,
      tooltip: 'House Rent Allowance received from employer'
    },
    {
      label: 'HRA Exemption',
      name: 'hraExemption',
      type: 'number',
      placeholder: '1,00,000',
      min: 0,
      max: 5000000,
      tooltip: 'Eligible HRA exemption amount'
    },
    {
      label: 'Other Deductions',
      name: 'otherDeductions',
      type: 'number',
      placeholder: '50,000',
      min: 0,
      max: 1000000,
      tooltip: 'Other eligible deductions (80E, 80G, etc.)'
    },
    {
      label: 'Capital Gains',
      name: 'capitalGains',
      type: 'number',
      placeholder: '0',
      min: 0,
      max: 50000000,
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
      min: 0,
      max: 50000000,
      tooltip: 'Income from business or profession'
    },
    {
      label: 'Professional Tax',
      name: 'professionalTax',
      type: 'number',
      placeholder: '2,400',
      min: 0,
      max: 30000,
      tooltip: 'Professional tax paid during the year'
    },
    {
      label: 'TDS Deducted',
      name: 'tdsDeducted',
      type: 'number',
      placeholder: '50,000',
      min: 0,
      max: 5000000,
      tooltip: 'Tax deducted at source by employer/others'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      
      // Validate inputs
      if (values.annualIncome < 0) {
        setError('Annual income cannot be negative');
        return [];
      }

      if (values.age < 18 || values.age > 100) {
        setError('Age must be between 18 and 100');
        return [];
      }

      const calculation = calculateTax(values);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Total Tax Payable',
          value: calculation.totalTax,
          type: 'currency',
          highlight: true,
          tooltip: 'Total income tax including cess'
        },
        {
          label: 'Gross Income',
          value: calculation.grossIncome,
          type: 'currency',
          tooltip: 'Total income before deductions'
        },
        {
          label: 'Total Deductions',
          value: calculation.totalDeductions,
          type: 'currency',
          tooltip: 'Total eligible deductions claimed'
        },
        {
          label: 'Taxable Income',
          value: calculation.taxableIncome,
          type: 'currency',
          tooltip: 'Income after deductions and exemptions'
        },
        {
          label: 'Income Tax',
          value: calculation.incomeTax,
          type: 'currency',
          tooltip: 'Tax before adding cess'
        },
        {
          label: 'Health & Education Cess',
          value: calculation.cess,
          type: 'currency',
          tooltip: '4% cess on income tax'
        },
        {
          label: 'Effective Tax Rate',
          value: calculation.effectiveTaxRate,
          type: 'percentage',
          tooltip: 'Tax as percentage of gross income'
        },
        {
          label: 'Marginal Tax Rate',
          value: calculation.marginalTaxRate,
          type: 'percentage',
          tooltip: 'Tax rate on next rupee of income'
        },
        {
          label: 'Net Income',
          value: calculation.netIncome,
          type: 'currency',
          tooltip: 'Income after paying taxes'
        },
        {
          label: 'Monthly Take-home',
          value: calculation.monthlyTakeHome,
          type: 'currency',
          tooltip: 'Average monthly income after tax'
        }
      ];

      // Add refund/additional tax information
      if (calculation.refundAmount > 0) {
        calculatorResults.push({
          label: 'Tax Refund',
          value: calculation.refundAmount,
          type: 'currency',
          tooltip: 'Refund due from excess TDS/advance tax'
        });
      } else if (calculation.additionalTaxDue > 0) {
        calculatorResults.push({
          label: 'Additional Tax Due',
          value: calculation.additionalTaxDue,
          type: 'currency',
          tooltip: 'Additional tax to be paid'
        });
      }

      return calculatorResults;
    } catch (err) {
      console.error('Tax calculation error:', err);
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      if ((name === 'annualIncome' || name === 'age') && numValue < 0) {
        setError(`${name} cannot be negative`);
        return;
      }

      setValues(prev => ({ ...prev, [name]: value }));
      if (error) setError('');
    } catch (err) {
      console.error('Input change error:', err);
      setError('Invalid input format');
    }
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Tax Calculator"
        description="Calculate your income tax liability under both old and new tax regimes. Get detailed breakdown of taxes, deductions, and take-home income."
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