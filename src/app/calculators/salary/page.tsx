"use client";

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
  otherAllowances: 0
};

export default function SalaryCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Annual CTC', name: 'ctc', type: 'number', placeholder: '12,00,000', unit: currency.symbol },
    { label: 'Basic Salary %', name: 'basicPercent', type: 'percentage', placeholder: '50' },
    { label: 'HRA %', name: 'hraPercent', type: 'percentage', placeholder: '40' },
    { label: 'PF Contribution %', name: 'pfContribution', type: 'percentage', placeholder: '12' },
    { label: 'Annual Professional Tax', name: 'professionalTax', type: 'number', placeholder: '2,400', unit: currency.symbol }
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

    const salaryResults = calculateSalary(validatedValues);
    const yearlyNetSalary = salaryResults.netSalary;
    const takeHomePercentage = (yearlyNetSalary / validatedValues.ctc) * 100;

    const results: CalculatorResult[] = [
      { label: 'Monthly Net Salary', value: salaryResults.monthlySalary, type: 'currency', highlight: true },
      { label: 'Annual Net Salary', value: yearlyNetSalary, type: 'currency' },
      { label: 'Monthly Basic Salary', value: salaryResults.basicSalary / 12, type: 'currency' },
      { label: 'Monthly HRA', value: salaryResults.hra / 12, type: 'currency' },
      { label: 'Monthly Gross Salary', value: salaryResults.grossSalary / 12, type: 'currency' },
      { label: 'Monthly PF Deduction', value: salaryResults.pfDeduction / 12, type: 'currency' },
      { label: 'Monthly Income Tax', value: salaryResults.incomeTax / 12, type: 'currency' },
      { label: 'Total Monthly Deductions', value: salaryResults.totalDeductions / 12, type: 'currency' },
      { label: 'Take-home %', value: takeHomePercentage, type: 'percentage' }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<SalaryInputs>
      title="In-Hand Salary & CTC Breakdown Calculator"
      description="Convert your CTC to in-hand salary with detailed breakdown of all components and deductions."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
