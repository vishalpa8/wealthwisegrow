"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  EnhancedCalculatorForm,
  EnhancedCalculatorField,
  CalculatorResult,
} from "@/components/ui/enhanced-calculator-form";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { Button } from "@/components/ui/button";
import { PieChart, BarChart3 } from "lucide-react";
import { parseRobustNumber } from "@/lib/utils/number";

interface EMIInputs {
  loanAmount: number;
  interestRate: number;
  loanTenure: number;
  tenureType: "years" | "months";
  prepaymentAmount: number;
  prepaymentFrequency: "none" | "yearly" | "monthly";
}

interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
  interestToLoanRatio: number;
  amortizationSchedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

const initialValues: EMIInputs = {
  loanAmount: 2500000,
  interestRate: 8.5,
  loanTenure: 20,
  tenureType: "years",
  prepaymentAmount: 0,
  prepaymentFrequency: "none",
};

function calculateAdvancedEMI(inputs: EMIInputs): EMIResult {
  // Use parseRobustNumber for flexible input handling
  const loanAmount = Math.abs(parseRobustNumber(inputs.loanAmount)) || 0;
  const interestRate = Math.abs(parseRobustNumber(inputs.interestRate)) || 0;
  const loanTenure = Math.max(parseRobustNumber(inputs.loanTenure) || 1, 1);
  const tenureType = inputs.tenureType || "years";
  const prepaymentAmount = Math.abs(parseRobustNumber(inputs.prepaymentAmount)) || 0;
  const prepaymentFrequency = inputs.prepaymentFrequency || "none";

  // Handle zero loan amount gracefully
  if (loanAmount === 0) {
    return {
      monthlyEMI: 0,
      totalInterest: 0,
      totalAmount: 0,
      interestToLoanRatio: 0,
      amortizationSchedule: [],
    };
  }

  const totalMonths = tenureType === "years" ? loanTenure * 12 : loanTenure;
  const monthlyRate = interestRate / 100 / 12;

  // Calculate EMI using the standard formula with zero interest handling
  let emi = 0;
  if (monthlyRate === 0) {
    emi = loanAmount / totalMonths;
  } else {
    emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  let balance = loanAmount;
  let totalInterestPaid = 0;
  const amortizationSchedule = [];

  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = emi - interestPayment;

    // Apply prepayment if applicable
    let prepayment = 0;
    if (prepaymentAmount > 0) {
      if (prepaymentFrequency === "monthly") {
        prepayment = prepaymentAmount;
      } else if (prepaymentFrequency === "yearly" && month % 12 === 0) {
        prepayment = prepaymentAmount;
      }
    }

    principalPayment += prepayment;

    if (principalPayment > balance) {
      principalPayment = balance;
    }

    balance -= principalPayment;
    totalInterestPaid += interestPayment;

    amortizationSchedule.push({
      month,
      emi: emi + prepayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });

    if (balance <= 0) break;
  }

  const totalAmount = loanAmount + totalInterestPaid;
  const interestToLoanRatio =
    loanAmount > 0 ? (totalInterestPaid / loanAmount) * 100 : 0;

  return {
    monthlyEMI: isFinite(emi) ? emi : 0,
    totalInterest: isFinite(totalInterestPaid) ? totalInterestPaid : 0,
    totalAmount: isFinite(totalAmount) ? totalAmount : 0,
    interestToLoanRatio: isFinite(interestToLoanRatio)
      ? interestToLoanRatio
      : 0,
    amortizationSchedule,
  };
}

export default function AdvancedEMICalculatorPage() {
  const [values, setValues] = useState<EMIInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(
    undefined
  );
  const [showAmortization, setShowAmortization] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonScenarios, setComparisonScenarios] = useState<
    Array<{ id: string; name: string; inputs: EMIInputs; results: EMIResult }>
  >([]);

  const { currency, formatCurrency, formatNumber } = useCurrency();

  const emiResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      return calculateAdvancedEMI(values);
    } catch (err: any) {
      console.error("EMI calculation error:", err);
      setCalculationError(
        err.message || "Calculation failed. Please check your inputs."
      );
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: "Loan Amount",
      name: "loanAmount",
      type: "number",
      placeholder: "25,00,000",
      unit: currency.symbol,
      tooltip: "Principal loan amount you want to borrow",
    },
    {
      label: "Interest Rate",
      name: "interestRate",
      type: "percentage",
      placeholder: "8.5",
      step: 0.1,
      tooltip: "Annual interest rate offered by the lender",
    },
    {
      label: "Loan Tenure",
      name: "loanTenure",
      type: "number",
      placeholder: "20",
      tooltip: "Duration of the loan",
    },
    {
      label: "Tenure Type",
      name: "tenureType",
      type: "select",
      options: [
        { value: "years", label: "Years" },
        { value: "months", label: "Months" },
      ],
      tooltip: "Whether tenure is in years or months",
    },
    {
      label: "Prepayment Amount",
      name: "prepaymentAmount",
      type: "number",
      placeholder: "0",
      unit: currency.symbol,
      tooltip: "Additional amount you plan to pay towards principal",
    },
    {
      label: "Prepayment Frequency",
      name: "prepaymentFrequency",
      type: "select",
      options: [
        { value: "none", label: "No Prepayment" },
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" },
      ],
      tooltip: "How often you plan to make prepayments",
    },
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!emiResults) return [];

    const actualTenure = emiResults.amortizationSchedule.length;
    const timeSaved =
      (values.tenureType === "years"
        ? values.loanTenure * 12
        : values.loanTenure) - actualTenure;

    return [
      {
        label: "Monthly EMI",
        value: emiResults.monthlyEMI,
        type: "currency",
        highlight: true,
        tooltip: "Equated Monthly Installment amount",
      } as CalculatorResult,
      {
        label: "Total Interest",
        value: emiResults.totalInterest,
        type: "currency",
        tooltip: "Total interest paid over the loan tenure",
      } as CalculatorResult,
      {
        label: "Total Amount",
        value: emiResults.totalAmount,
        type: "currency",
        tooltip: "Total amount paid (Principal + Interest)",
      } as CalculatorResult,
      {
        label: "Interest to Loan Ratio",
        value: emiResults.interestToLoanRatio,
        type: "percentage",
        tooltip: "Interest as percentage of loan amount",
      } as CalculatorResult,
      {
        label: "Actual Tenure",
        value: actualTenure,
        type: "number",
        tooltip: "Actual loan tenure in months (considering prepayments)",
      } as CalculatorResult,
      ...(timeSaved > 0
        ? [
            {
              label: "Time Saved",
              value: timeSaved,
              type: "number",
              tooltip: "Months saved due to prepayments",
            } as CalculatorResult,
          ]
        : []),
    ];
  }, [emiResults, values.loanTenure, values.tenureType]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 600);
  };

  const addToComparison = () => {
    if (emiResults) {
      const newScenario = {
        id: Date.now().toString(),
        name: `Scenario ${comparisonScenarios.length + 1}`,
        inputs: { ...values },
        results: emiResults,
      };
      setComparisonScenarios((prev) => [...prev, newScenario]);
      setShowComparison(true);
    }
  };

  const removeFromComparison = (id: string) => {
    setComparisonScenarios((prev) =>
      prev.filter((scenario) => scenario.id !== id)
    );
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">
          Advanced Features
        </h3>
        <div className="space-y-3">
          <Button
            onClick={() => setShowAmortization(!showAmortization)}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showAmortization ? "Hide" : "Show"} Amortization
          </Button>

          {emiResults && (
            <Button
              onClick={addToComparison}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center"
            >
              <PieChart className="w-4 h-4 mr-2" />
              Add to Comparison
            </Button>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">
          EMI Tips
        </h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">
              Prepayments can significantly reduce total interest.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">
              Compare different loan offers before deciding.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">
              Consider your monthly budget while choosing tenure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Advanced EMI Calculator"
      description="Calculate EMI with prepayment options, amortization schedule, and scenario comparisons."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Loan Details"
        description="Enter your loan details to calculate EMI with advanced features."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={emiResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />

      {/* Amortization Schedule */}
      {showAmortization && emiResults && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Amortization Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3">Month</th>
                  <th className="text-right py-2 px-3">EMI</th>
                  <th className="text-right py-2 px-3">Principal</th>
                  <th className="text-right py-2 px-3">Interest</th>
                  <th className="text-right py-2 px-3">Balance</th>
                </tr>
              </thead>
              <tbody>
                {emiResults.amortizationSchedule
                  .slice(0, 12)
                  .map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3">{row.month}</td>
                      <td className="text-right py-2 px-3">
                        {formatCurrency(row.emi)}
                      </td>
                      <td className="text-right py-2 px-3">
                        {formatCurrency(row.principal)}
                      </td>
                      <td className="text-right py-2 px-3">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="text-right py-2 px-3">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {emiResults.amortizationSchedule.length > 12 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Showing first 12 months of{" "}
                {emiResults.amortizationSchedule.length} total months
              </p>
            )}
          </div>
        </div>
      )}

      {/* Scenario Comparison */}
      {showComparison && comparisonScenarios.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Scenario Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3">Scenario</th>
                  <th className="text-right py-2 px-3">Loan Amount</th>
                  <th className="text-right py-2 px-3">Interest Rate</th>
                  <th className="text-right py-2 px-3">Monthly EMI</th>
                  <th className="text-right py-2 px-3">Total Interest</th>
                  <th className="text-center py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {comparisonScenarios.map((scenario) => (
                  <tr key={scenario.id} className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">{scenario.name}</td>
                    <td className="text-right py-2 px-3">
                      {formatCurrency(scenario.inputs.loanAmount)}
                    </td>
                    <td className="text-right py-2 px-3">
                      {formatNumber(scenario.inputs.interestRate)}%
                    </td>
                    <td className="text-right py-2 px-3">
                      {formatCurrency(scenario.results.monthlyEMI)}
                    </td>
                    <td className="text-right py-2 px-3">
                      {formatCurrency(scenario.results.totalInterest)}
                    </td>
                    <td className="text-center py-2 px-3">
                      <button
                        onClick={() => removeFromComparison(scenario.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}