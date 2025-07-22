"use client";

import { useMemo, useState, useCallback } from "react";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateMortgage } from "@/lib/calculations/mortgage";
import type { MortgageInputs } from "@/lib/validations/calculator";

import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { EnhancedCalculatorField, EnhancedCalculatorForm, CalculatorResult } from "@/components/ui/enhanced-calculator-form";

const initialValues: MortgageInputs = {
  principal: 500000,
  downPayment: 100000,
  rate: 7.5,
  years: 30,
  propertyTax: 6000,
  insurance: 1500,
  pmi: 0,
};

export function MortgageCalculator() {
  const [values, setValues] = useState<MortgageInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { formatCurrency, formatNumber, currency } = useCurrency();

  const mortgageResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      if (values.principal > 0 && values.rate > 0 && values.years > 0) {
        return calculateMortgage(values);
      }
    } catch (error: any) {
      setCalculationError(error.message || "An error occurred during calculation.");
    }
    return null;
  }, [values]);

  const handleInputChange = useCallback(
    (name: string, value: any) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (validationErrors[name]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  const handleCalculate = () => {
    setLoading(true);
    setValidationErrors({});
    setCalculationError(undefined);

    const errors: Record<string, string> = {};

    if (values.principal <= 0) {
      errors.principal = "Home price must be greater than 0";
    }
    if (values.downPayment < 0) {
      errors.downPayment = "Down payment can't be negative";
    } else if (values.downPayment >= values.principal) {
      errors.downPayment = "Down payment can't exceed home price";
    }
    if (values.rate <= 0) {
      errors.rate = "Interest rate must be greater than 0";
    }
    if (values.years <= 0) {
      errors.years = "Loan term must be at least 1 year";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const fields: EnhancedCalculatorField[] = [
    {
      label: "Home Price",
      name: "principal",
      type: "number",
      placeholder: "500,000",
      unit: currency.symbol,
      required: true,
    },
    {
      label: "Down Payment",
      name: "downPayment",
      type: "number",
      placeholder: "100,000",
      unit: currency.symbol,
      required: true,
    },
    {
      label: "Interest Rate",
      name: "rate",
      type: "percentage",
      placeholder: "7.5",
      step: 0.001,
      required: true,
    },
    {
      label: "Loan Term",
      name: "years",
      type: "number",
      placeholder: "30",
      unit: "years",
      min: 1,
      required: true,
    },
    {
      label: "Annual Property Tax",
      name: "propertyTax",
      type: "number",
      placeholder: "6,000",
      unit: currency.symbol,
    },
    {
      label: "Annual Home Insurance",
      name: "insurance",
      type: "number",
      placeholder: "1,500",
      unit: currency.symbol,
    },
    {
      label: "PMI (Private Mortgage Insurance)",
      name: "pmi",
      type: "number",
      placeholder: "0",
      unit: currency.symbol,
      tooltip: "Required if your down payment is less than 20% of the home's purchase price."
    },
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!mortgageResults) return [];

    return [
      {
        label: "Monthly Payment",
        value: mortgageResults.monthlyPayment,
        type: "currency",
        highlight: true,
        tooltip: "Principal, Interest, Property Tax, and Insurance (PITI)",
      },
      {
        label: "Total Interest",
        value: mortgageResults.totalInterest,
        type: "currency",
        tooltip: `Total interest paid over ${values.years} years`,
      },
      {
        label: "Total Payment",
        value: mortgageResults.totalPayment,
        type: "currency",
        tooltip: "Total amount paid over the life of the loan (Principal + Interest + Taxes + Insurance + PMI)",
      },
      {
        label: "Loan Amount",
        value: values.principal - values.downPayment,
        type: "currency",
        tooltip: "The actual amount borrowed after down payment.",
      },
      {
        label: "Loan-to-Value (LTV)",
        value: mortgageResults.loanToValue,
        type: "percentage",
        tooltip: `Loan amount divided by home value. ${mortgageResults.loanToValue > 80 ? "PMI may be required." : "No PMI required."}`,
      },
      {
        label: "Interest vs Principal",
        value: (mortgageResults.totalInterest / mortgageResults.totalPayment) * 100,
        type: "percentage",
        tooltip: "Percentage of total payments that go towards interest.",
      },
    ];
  }, [mortgageResults, values, formatCurrency, formatNumber]);

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>

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
    <CalculatorLayout
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Mortgage Details"
        description="Enter the details of your potential home loan."
        fields={fields}
        values={values}
        onChange={handleInputChange}
        onCalculate={handleCalculate}
        results={mortgageResults ? results : []}
        loading={loading}
        error={calculationError}
      />
    </CalculatorLayout>
  );
}
