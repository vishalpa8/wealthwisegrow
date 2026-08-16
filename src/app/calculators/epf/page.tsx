"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculateEPF, EPFInputs } from '@/lib/calculations/savings';

const initialValues: EPFInputs = {
  basicSalary: 50000,
  employeeContribution: 12,
  employerContribution: 12,
  years: 30
};

export default function EPFCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Basic Salary (Monthly)', name: 'basicSalary', type: 'number', placeholder: '50,000', unit: currency.symbol, tooltip: 'Your monthly basic salary' },
    { label: 'Employee Contribution', name: 'employeeContribution', type: 'percentage', placeholder: '12', tooltip: 'Percentage of basic salary contributed by employee' },
    { label: 'Employer Contribution', name: 'employerContribution', type: 'percentage', placeholder: '12', tooltip: 'Percentage of basic salary contributed by employer' },
    { label: 'Service Period', name: 'years', type: 'number', placeholder: '30', unit: 'years', tooltip: 'Number of years you plan to work' }
  ];

  const calculate = (values: EPFInputs) => {
    const calculation = calculateEPF(values);
    
    const results: CalculatorResult[] = [
      { label: 'Maturity Amount', value: calculation.maturityAmount, type: 'currency', highlight: true, tooltip: 'Total EPF corpus at retirement' },
      { label: 'Employee Contribution', value: calculation.totalEmployeeContribution, type: 'currency', tooltip: 'Total amount contributed by employee' },
      { label: 'Employer Contribution', value: calculation.totalEmployerContribution, type: 'currency', tooltip: 'Total amount contributed by employer' },
      { label: 'Interest Earned', value: calculation.totalInterest, type: 'currency', tooltip: 'Interest earned on EPF corpus' }
    ];

    return { results };
  };

  const seoContent = (
      <SEOContent title="EPF Tips"
      description="Calculate your Employee Provident Fund corpus and plan your retirement savings."
      sections={[
        { title: "Mandatory Savings", content: "EPF is a mandatory savings scheme for salaried employees." },
        { title: "Tax Benefits", content: "It provides tax benefits under Section 80C." },
        { title: "Tax-Exempt Maturity", content: "Interest earned on EPF is tax-exempt on maturity." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<EPFInputs>
      title="EPF Maturity & Pension Fund Calculator"
      description="Calculate your Employee Provident Fund corpus and plan your retirement savings."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      seoContent={seoContent}
    />
  );
}
