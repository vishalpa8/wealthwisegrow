"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { calculateEMI } from "@/lib/calculations/financial-math";
import { parseRobustNumber } from "@/lib/utils/number";
import type { MortgageInputs } from "@/lib/validations/calculator";

const initialValues: MortgageInputs = {
  principal: 500000,
  downPayment: 100000,
  rate: 7.5,
  years: 30,
  propertyTax: 6000,
  insurance: 1500,
  pmi: 0,
};

export function MortgageCalculatorPageContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    { label: "Home Price", name: "principal", type: "number", placeholder: "500,000", unit: currency.symbol },
    { label: "Down Payment", name: "downPayment", type: "number", placeholder: "100,000", unit: currency.symbol },
    { label: "Interest Rate", name: "rate", type: "percentage", placeholder: "7.5", step: 0.001 },
    { label: "Loan Term", name: "years", type: "number", placeholder: "30", unit: "years" },
    { label: "Annual Property Tax", name: "propertyTax", type: "number", placeholder: "6,000", unit: currency.symbol },
    { label: "Annual Home Insurance", name: "insurance", type: "number", placeholder: "1,500", unit: currency.symbol },
    {
      label: "PMI (Private Mortgage Insurance)",
      name: "pmi",
      type: "number",
      placeholder: "0",
      unit: currency.symbol,
      tooltip: "Required if your down payment is less than 20% of the home's purchase price."
    },
  ], [currency.symbol]);

  const calculate = (values: MortgageInputs) => {
    try {
      const homePrice = Math.abs(parseRobustNumber(values.principal)) || 0;
      const downPayment = Math.abs(parseRobustNumber(values.downPayment)) || 0;
      const rate = Math.abs(parseRobustNumber(values.rate)) || 0;
      const years = Math.max(1, Math.abs(parseRobustNumber(values.years)) || 1);
      const propertyTax = Math.abs(parseRobustNumber(values.propertyTax)) || 0;
      const homeInsurance = Math.abs(parseRobustNumber(values.insurance)) || 0;
      const pmi = Math.abs(parseRobustNumber(values.pmi)) || 0;

      const loanAmount = Math.max(0, homePrice - downPayment);
      const months = years * 12;
      const baseEmi = calculateEMI(loanAmount, rate, months);
      
      const monthlyPropertyTax = propertyTax / 12;
      const monthlyHomeInsurance = homeInsurance / 12;
      const monthlyPayment = baseEmi + monthlyPropertyTax + monthlyHomeInsurance + pmi;
      
      const totalInterest = (baseEmi * months) - loanAmount;
      const totalPayment = monthlyPayment * months + downPayment;
      const loanToValue = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;

      const results: CalculatorResult[] = [
        {
          label: "Monthly Payment",
          value: monthlyPayment,
          type: "currency",
          highlight: true,
          tooltip: "Principal, Interest, Property Tax, and Insurance (PITI)",
        },
        {
          label: "Total Interest",
          value: totalInterest,
          type: "currency",
        },
        {
          label: "Total Payment",
          value: totalPayment,
          type: "currency",
        },
        {
          label: "Loan Amount",
          value: loanAmount,
          type: "currency",
        },
        {
          label: "Loan-to-Value (LTV)",
          value: loanToValue,
          type: "percentage",
        },
      ];
      return { results };
    } catch (err) {
      console.error(err);
      return { results: [] };
    }
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Mortgage Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">20% down payment avoids PMI</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare rates from multiple lenders</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider 15-year vs 30-year terms</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseCalculatorTemplate<MortgageInputs>
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      sidebar={sidebar}
    />
  );
}
