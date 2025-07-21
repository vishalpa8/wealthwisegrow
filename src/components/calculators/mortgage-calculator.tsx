"use client";

import React, { useMemo } from "react";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { FormField } from "@/components/ui/form-field";
import { ResultCard } from "@/components/ui/result-card";
import { Button } from "@/components/ui/button";
import { useCalculatorForm } from "@/hooks/use-calculator-form";
import { mortgageSchema, type MortgageInputs } from "@/lib/validations/calculator";
import { calculateMortgage } from "@/lib/calculations/mortgage";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import { Calculator, Home, TrendingUp, PieChart } from "lucide-react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";

const initialValues: MortgageInputs = {
  principal: 300000,
  rate: 6.5,
  years: 30,
  downPayment: 60000,
  propertyTax: 3600,
  insurance: 1200,
  pmi: 0,
};

export function MortgageCalculator() {
  const {
    values,
    setValue,
    setFieldTouched,
    getFieldError,
    isValid,
  } = useCalculatorForm({
    schema: mortgageSchema,
    initialValues,
    validateOnChange: true,
  });

  const results = useMemo(() => {
    if (isValid) {
      return calculateMortgage(values);
    }
    return null;
  }, [values, isValid]);

  const { addHistory } = useIndexedDBHistory();

  // Save to history when results change and are valid
  React.useEffect(() => {
    if (isValid && results) {
      addHistory({
        id: uuidv4(),
        type: "mortgage",
        inputs: { ...values },
        results: { ...results },
        timestamp: new Date(),
        title: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  const sidebar = (
    <div className="space-y-6">
      <div className="text-center">
        <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Mortgage Calculator
        </h3>
        <p className="text-sm text-gray-600">
          Calculate your monthly mortgage payment including principal, interest, taxes, and insurance.
        </p>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Payment Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal & Interest:</span>
                <span className="font-medium">{formatCurrency(results.monthlyPrincipalAndInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Property Tax:</span>
                <span className="font-medium">{formatCurrency(results.monthlyPropertyTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Insurance:</span>
                <span className="font-medium">{formatCurrency(results.monthlyInsurance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PMI:</span>
                <span className="font-medium">{formatCurrency(results.monthlyPMI)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Monthly:</span>
                <span>{formatCurrency(results.monthlyPayment)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Loan Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Loan Amount:</span>
                <span className="font-medium text-blue-900">
                  {formatCurrency(values.principal - (values.downPayment || 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Total Interest:</span>
                <span className="font-medium text-blue-900">{formatCurrency(results.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">LTV Ratio:</span>
                <span className="font-medium text-blue-900">{formatPercentage(results.loanToValue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CalculatorLayout
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Get detailed payment breakdowns and loan summaries."
      sidebar={sidebar}
    >
      <form className="space-y-6" role="form" aria-label="Mortgage calculation form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Home Price"
            name="principal"
            type="number"
            prefix="$"
            placeholder="300,000"
            value={values.principal}
            onChange={(value) => setValue("principal", value)}
            onBlur={() => setFieldTouched("principal")}
            error={getFieldError("principal")}
            helpText="The total purchase price of the home"
            required
          />

          <FormField
            label="Down Payment"
            name="downPayment"
            type="number"
            prefix="$"
            placeholder="60,000"
            value={values.downPayment || 0}
            onChange={(value) => setValue("downPayment", value)}
            onBlur={() => setFieldTouched("downPayment")}
            error={getFieldError("downPayment")}
            helpText="Amount you'll pay upfront (typically 10-20%)"
          />

          <FormField
            label="Interest Rate"
            name="rate"
            type="number"
            suffix="%"
            step={0.01}
            placeholder="6.5"
            value={values.rate}
            onChange={(value) => setValue("rate", value)}
            onBlur={() => setFieldTouched("rate")}
            error={getFieldError("rate")}
            helpText="Annual interest rate for the loan"
            required
          />

          <FormField
            label="Loan Term"
            name="years"
            type="number"
            suffix="years"
            placeholder="30"
            value={values.years}
            onChange={(value) => setValue("years", value)}
            onBlur={() => setFieldTouched("years")}
            error={getFieldError("years")}
            helpText="Length of the mortgage in years"
            required
          />

          <FormField
            label="Annual Property Tax"
            name="propertyTax"
            type="number"
            prefix="$"
            placeholder="3,600"
            value={values.propertyTax || 0}
            onChange={(value) => setValue("propertyTax", value)}
            onBlur={() => setFieldTouched("propertyTax")}
            error={getFieldError("propertyTax")}
            helpText="Yearly property tax amount"
          />

          <FormField
            label="Annual Home Insurance"
            name="insurance"
            type="number"
            prefix="$"
            placeholder="1,200"
            value={values.insurance || 0}
            onChange={(value) => setValue("insurance", value)}
            onBlur={() => setFieldTouched("insurance")}
            error={getFieldError("insurance")}
            helpText="Yearly homeowner's insurance premium"
          />
        </div>

        {results && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResultCard
                title="Monthly Payment"
                value={results.monthlyPayment}
                subtitle="Principal, Interest, Taxes & Insurance"
                variant="default"
              />

              <ResultCard
                title="Total Interest"
                value={results.totalInterest}
                subtitle={`Over ${values.years} years`}
                variant="warning"
              />

              <ResultCard
                title="Total Payment"
                value={results.totalPayment}
                subtitle="Principal + Interest only"
                variant="success"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="h-5 w-5" />
                Key Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Loan-to-Value Ratio:</p>
                  <p className="font-semibold text-lg">{formatPercentage(results.loanToValue)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {results.loanToValue > 80 ? "PMI may be required" : "No PMI required"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Interest vs Principal:</p>
                  <p className="font-semibold text-lg">
                    {formatPercentage((results.totalInterest / results.totalPayment) * 100)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of total payments go to interest
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </CalculatorLayout>
  );
}