"use client";
import { useState, useMemo, useCallback } from "react";
import { parseRobustNumber, safeMultiply, safeAdd, safePower, safeDivide, safeSubtract } from "@/lib/utils/number";

import { GoalProgressChart } from "@/components/ui/goal-progress-chart";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from "@/components/ui/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";

interface InvestmentInputs {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturnRate: number;
  years: number;
  goal: number;
}

const initialValues: InvestmentInputs = {
  initialInvestment: 10000,
  monthlyContribution: 500,
  annualReturnRate: 7,
  years: 20,
  goal: 0, // This will be dynamically set or user-defined
};

function calculateInvestment(inputs: InvestmentInputs) {
  const initial = Math.abs(parseRobustNumber(inputs.initialInvestment) || 0);
  const monthly = Math.abs(parseRobustNumber(inputs.monthlyContribution) || 0);
  const rate = Math.abs(parseRobustNumber(inputs.annualReturnRate) || 0);
  const years = Math.max(parseRobustNumber(inputs.years) || 1, 1);

  // Handle edge cases gracefully without throwing errors

  const n = years * 12; // Total months
  const r = safeDivide(safeDivide(rate, 12), 100); // Monthly rate

  // Future value of initial investment
  const fvInitial = safeMultiply(initial, safePower(safeAdd(1, r), n));

  // Future value of a series of monthly contributions (annuity)
  let fvMonthly = 0;
  if (!isFinite(r) || r === 0) { // Handle zero interest rate
    fvMonthly = safeMultiply(monthly, n);
  } else {
    fvMonthly = safeMultiply(monthly, safeDivide(safeSubtract(safePower(safeAdd(1, r), n), 1), r));
  }

  const totalFutureValue = safeAdd(fvInitial, fvMonthly);
  const totalContributions = safeAdd(initial, safeMultiply(monthly, n));
  const totalInterestEarned = safeSubtract(totalFutureValue, totalContributions);

  // Calculate additional metrics
  const annualizedReturn = totalContributions > 0 
    ? (Math.pow(totalFutureValue / totalContributions, 1 / years) - 1) * 100
    : 0;

  const returnMultiple = totalContributions > 0 ? totalFutureValue / totalContributions : 0;

  return {
    totalFutureValue,
    totalContributions,
    totalInterestEarned,
    annualizedReturn,
    returnMultiple,
  };
}

export default function InvestmentCalculatorPage() {
  const [values, setValues] = useState<InvestmentInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const investmentResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      return calculateInvestment(values);
    } catch (err: any) {
      console.error("Investment calculation error:", err);
      setCalculationError(err.message || "An error occurred during calculation.");
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: "Initial Investment",
      name: "initialInvestment",
      type: "number",
      placeholder: "10,000",
      unit: currency.symbol,
      tooltip: "One-time initial investment amount"
    },
    {
      label: "Monthly Contribution",
      name: "monthlyContribution",
      type: "number",
      placeholder: "500",
      unit: currency.symbol,
      tooltip: "Amount you plan to invest every month"
    },
    {
      label: "Annual Return Rate",
      name: "annualReturnRate",
      type: "percentage",
      placeholder: "7",
      step: 0.1,
      tooltip: "Expected annual return rate from your investments"
    },
    {
      label: "Investment Period",
      name: "years",
      type: "number",
      placeholder: "20",
      unit: "years",
      tooltip: "Number of years you plan to invest"
    },
    {
      label: "Investment Goal",
      name: "goal",
      type: "number",
      placeholder: "1,000,000",
      unit: currency.symbol,
      tooltip: "Set a target for your investment growth."
    },
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!investmentResults) return [];

    return [
      {
        label: "Final Amount",
        value: investmentResults.totalFutureValue,
        type: "currency",
        highlight: true,
        tooltip: "Total value of your investment at maturity",
      },
      {
        label: "Total Contributions",
        value: investmentResults.totalContributions,
        type: "currency",
        tooltip: "Total amount you will invest over the period",
      },
      {
        label: "Total Growth",
        value: investmentResults.totalInterestEarned,
        type: "currency",
        tooltip: "Total returns earned from your investments",
      },
      {
        label: "Annualized Return",
        value: investmentResults.annualizedReturn,
        type: "percentage",
        tooltip: "Effective annual return rate achieved",
      },
      {
        label: "Return Multiple",
        value: investmentResults.returnMultiple,
        type: "number",
        tooltip: "How many times your investment will grow",
      },
    ];
  }, [investmentResults]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 400);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Investment Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Start investing early to leverage compounding.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Regular contributions can significantly boost returns.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Diversify your portfolio to manage risk.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Review and rebalance periodically.</p>
          </div>
        </div>
      </div>

      {investmentResults && (
        <div className="card">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Total Investment</h4>
              <p className="text-sm text-neutral-700">{currency.symbol}{investmentResults.totalContributions.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Expected Growth</h4>
              <p className="text-sm text-success-600 font-medium">{currency.symbol}{investmentResults.totalInterestEarned.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="font-medium text-neutral-900 mb-1 text-sm">Growth Multiple</h4>
              <p className="text-sm text-blue-600 font-medium">{investmentResults.returnMultiple.toFixed(2)}x</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CalculatorLayout
      title="Investment Calculator"
      description="Estimate the future value of your investments with our comprehensive calculator. Plan your financial goals and see the power of compounding."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Investment Details"
        description="Enter your investment details to project future growth."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={investmentResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
      {investmentResults && values.goal > 0 && (
        <div className="mt-6 card p-6">
          <GoalProgressChart 
            currentValue={investmentResults.totalFutureValue} 
            goalValue={values.goal} 
            label="Investment Growth Progress" 
            unit={currency.symbol} 
          />
        </div>
      )}
    </CalculatorLayout>
  );
}