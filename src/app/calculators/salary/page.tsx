"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { calculateSalary, SalaryInputs } from '@/lib/calculations/tax';
import { salarySchema } from '@/lib/validations/calculator';

const initialValues = {
  ctc: 1200000,
  basicPercent: 50,
  hraPercent: 40,
  pfContribution: 12,
  professionalTax: 2400,
  otherAllowances: 50000
};

export default function SalaryCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Annual CTC',
      name: 'ctc',
      type: 'number',
      placeholder: '12,00,000',
      min: 100000,
      max: 100000000,
      required: true,
      tooltip: 'Cost to Company - Total annual salary package'
    },
    {
      label: 'Basic Salary %',
      name: 'basicPercent',
      type: 'percentage',
      placeholder: '50',
      min: 40,
      max: 70,
      required: true,
      tooltip: 'Basic salary as percentage of CTC (typically 40-60%)'
    },
    {
      label: 'HRA %',
      name: 'hraPercent',
      type: 'percentage',
      placeholder: '40',
      min: 0,
      max: 50,
      required: true,
      tooltip: 'House Rent Allowance as percentage of basic salary'
    },
    {
      label: 'PF Contribution %',
      name: 'pfContribution',
      type: 'percentage',
      placeholder: '12',
      min: 0,
      max: 12,
      required: true,
      tooltip: 'Provident Fund contribution (maximum 12%)'
    },
    {
      label: 'Annual Professional Tax',
      name: 'professionalTax',
      type: 'number',
      placeholder: '2,400',
      min: 0,
      max: 2500,
      tooltip: 'Annual professional tax (varies by state, max ₹2,500)'
    },
    {
      label: 'Other Allowances (Annual)',
      name: 'otherAllowances',
      type: 'number',
      placeholder: '50,000',
      min: 0,
      max: 1000000,
      tooltip: 'Medical, transport, and other annual allowances'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');
      
      // Custom validation for salary calculations
      if (values.ctc < 100000) {
        setError('CTC should be at least ₹1,00,000');
        return [];
      }

      if (values.ctc > 100000000) {
        setError('CTC amount is too high (max ₹10 crores)');
        return [];
      }

      if (values.basicPercent < 40 || values.basicPercent > 70) {
        setError('Basic salary should be between 40% and 70% of CTC');
        return [];
      }

      if (values.hraPercent > 50) {
        setError('HRA cannot exceed 50% of basic salary');
        return [];
      }

      if (values.pfContribution > 12) {
        setError('PF contribution cannot exceed 12%');
        return [];
      }

      if (values.professionalTax > 2500) {
        setError('Professional tax cannot exceed ₹2,500 per month');
        return [];
      }

      const validation = salarySchema.safeParse(values);
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
        setError(errorMessage);
        return [];
      }

      // Ensure the data is correctly typed
      const salaryInputs: SalaryInputs = {
        ctc: Number(validation.data.ctc),
        basicPercent: Number(validation.data.basicPercent),
        hraPercent: Number(validation.data.hraPercent),
        pfContribution: Number(validation.data.pfContribution),
        professionalTax: Number(validation.data.professionalTax),
        otherAllowances: Number(validation.data.otherAllowances)
      };
      
      const calculation = calculateSalary(salaryInputs);

      // Validate calculation results
      if (!calculation || isNaN(calculation.netSalary) || calculation.netSalary <= 0) {
        setError('Unable to calculate salary. Please check your inputs.');
        return [];
      }

      // Additional calculations
      const yearlyNetSalary = calculation.netSalary * 12;
      // const totalDeductionsAnnual = calculation.totalDeductions * 12; // Not currently used
      const takeHomePercentage = (yearlyNetSalary / values.ctc) * 100;
      
      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Monthly Net Salary',
          value: calculation.netSalary,
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
          value: calculation.basicSalary,
          type: 'currency',
          tooltip: 'Monthly basic salary component'
        },
        {
          label: 'Monthly HRA',
          value: calculation.hra,
          type: 'currency',
          tooltip: 'House Rent Allowance per month'
        },
        {
          label: 'Monthly Gross Salary',
          value: calculation.grossSalary,
          type: 'currency',
          tooltip: 'Gross salary before deductions'
        },
        {
          label: 'Monthly PF Deduction',
          value: calculation.pfDeduction,
          type: 'currency',
          tooltip: 'Provident Fund deduction per month'
        },
        {
          label: 'Monthly Income Tax',
          value: calculation.incomeTax,
          type: 'currency',
          tooltip: 'Estimated income tax deduction per month'
        },
        {
          label: 'Total Monthly Deductions',
          value: calculation.totalDeductions,
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

      return calculatorResults;
    } catch (err) {
      console.error('Salary calculation error:', err);
      setError('Calculation failed. Please verify your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      // Real-time validation
      if (name === 'ctc') {
        if (numValue < 0) {
          setError('CTC cannot be negative');
          return;
        }
        if (numValue > 100000000) {
          setError('CTC amount is too high');
          return;
        }
      }
      
      if (name === 'basicPercent') {
        if (numValue < 0 || numValue > 100) {
          setError('Basic salary percentage should be between 0% and 100%');
          return;
        }
        if (numValue < 40) {
          setError('Basic salary is typically at least 40% of CTC');
          return;
        }
      }
      
      if (name === 'hraPercent') {
        if (numValue < 0 || numValue > 100) {
          setError('HRA percentage should be between 0% and 100%');
          return;
        }
        if (numValue > 50) {
          setError('HRA typically does not exceed 50% of basic salary');
          return;
        }
      }
      
      if (name === 'pfContribution') {
        if (numValue < 0 || numValue > 12) {
          setError('PF contribution should be between 0% and 12%');
          return;
        }
      }
      
      if (name === 'professionalTax') {
        if (numValue < 0) {
          setError('Professional tax cannot be negative');
          return;
        }
        if (numValue > 30000) { // Annual limit
          setError('Professional tax seems too high');
          return;
        }
      }
      
      if (name === 'otherAllowances') {
        if (numValue < 0) {
          setError('Other allowances cannot be negative');
          return;
        }
        if (numValue > values.ctc / 2) {
          setError('Other allowances seem too high compared to CTC');
          return;
        }
      }

      // Cross-validation
      if (name === 'basicPercent' || name === 'ctc') {
        const basicPercent = name === 'basicPercent' ? numValue : values.basicPercent;
        const ctc = name === 'ctc' ? numValue : values.ctc;
        const basicAmount = (ctc * basicPercent) / 100;
        
        if (basicAmount < 21000) { // Minimum wage consideration
          setError('Basic salary seems too low. Consider increasing basic %');
          return;
        }
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
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Salary Calculator"
        description="Convert your CTC to in-hand salary with detailed breakdown of all components and deductions."
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
