"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculateSalary, SalaryInputs } from "@/lib/calculations/tax";
import { parseRobustNumber } from "@/lib/utils/number";

const initialValues: SalaryInputs = {
  ctc: 1200000,
  basicPercent: 50,
  hraPercent: 40,
  pfContribution: 12,
  professionalTax: 2400,
  otherAllowances: 50000
};

export default function SalaryCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Annual CTC', name: 'ctc', type: 'number', placeholder: '12,00,000', unit: currency.symbol },
    { label: 'Basic Salary %', name: 'basicPercent', type: 'percentage', placeholder: '50' },
    { label: 'HRA %', name: 'hraPercent', type: 'percentage', placeholder: '40' },
    { label: 'PF Contribution %', name: 'pfContribution', type: 'percentage', placeholder: '12' },
    { label: 'Annual Professional Tax', name: 'professionalTax', type: 'number', placeholder: '2,400', unit: currency.symbol },
    { label: 'Other Allowances (Annual)', name: 'otherAllowances', type: 'number', placeholder: '50,000', unit: currency.symbol }
  ];

  const calculate = (inputs: SalaryInputs) => {
    const validatedValues = {
      ctc: Math.abs(parseRobustNumber(inputs.ctc)) || 100000,
      basicPercent: Math.max(30, Math.min(70, Math.abs(parseRobustNumber(inputs.basicPercent)) || 50)),
      hraPercent: Math.max(0, Math.min(50, Math.abs(parseRobustNumber(inputs.hraPercent)) || 40)),
      pfContribution: Math.max(0, Math.min(12, Math.abs(parseRobustNumber(inputs.pfContribution)) || 12)),
      professionalTax: Math.max(0, Math.min(30000, Math.abs(parseRobustNumber(inputs.professionalTax)) || 0)),
      otherAllowances: Math.abs(parseRobustNumber(inputs.otherAllowances)) || 0
    };

    let salaryResults = calculateSalary(validatedValues);
    if (!salaryResults || isNaN(salaryResults.netSalary) || salaryResults.netSalary < 0) {
      salaryResults = {
        basicSalary: validatedValues.ctc * (validatedValues.basicPercent / 100) / 12,
        hra: validatedValues.ctc * (validatedValues.basicPercent / 100) * (validatedValues.hraPercent / 100) / 12,
        grossSalary: validatedValues.ctc / 12,
        pfDeduction: validatedValues.ctc * (validatedValues.basicPercent / 100) * (validatedValues.pfContribution / 100) / 12,
        incomeTax: 0,
        totalDeductions: validatedValues.ctc * (validatedValues.basicPercent / 100) * (validatedValues.pfContribution / 100) / 12 + validatedValues.professionalTax / 12,
        netSalary: validatedValues.ctc / 12 - (validatedValues.ctc * (validatedValues.basicPercent / 100) * (validatedValues.pfContribution / 100) / 12 + validatedValues.professionalTax / 12),
        ctc: validatedValues.ctc,
        otherAllowances: validatedValues.otherAllowances,
        professionalTax: validatedValues.professionalTax,
        monthlySalary: validatedValues.ctc / 12
      };
    }

    const yearlyNetSalary = salaryResults.netSalary * 12;
    const takeHomePercentage = (yearlyNetSalary / validatedValues.ctc) * 100;

    const results: CalculatorResult[] = [
      { label: 'Monthly Net Salary', value: salaryResults.netSalary, type: 'currency', highlight: true },
      { label: 'Annual Net Salary', value: yearlyNetSalary, type: 'currency' },
      { label: 'Monthly Basic Salary', value: salaryResults.basicSalary, type: 'currency' },
      { label: 'Monthly HRA', value: salaryResults.hra, type: 'currency' },
      { label: 'Monthly Gross Salary', value: salaryResults.grossSalary, type: 'currency' },
      { label: 'Monthly PF Deduction', value: salaryResults.pfDeduction, type: 'currency' },
      { label: 'Monthly Income Tax', value: salaryResults.incomeTax, type: 'currency' },
      { label: 'Total Monthly Deductions', value: salaryResults.totalDeductions, type: 'currency' },
      { label: 'Take-home %', value: takeHomePercentage, type: 'percentage' }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<SalaryInputs>
      title="Salary Calculator"
      description="Convert your CTC to in-hand salary with detailed breakdown of all components and deductions."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
