"use client";
import { useState, useMemo, useCallback } from "react";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from "@/components/ui/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";

interface BudgetInputs {
  monthlyIncome: number;
  monthlyExpenses: number;
}

const initialValues: BudgetInputs = {
  monthlyIncome: 5000,
  monthlyExpenses: 3500,
};

function calculateBudget(inputs: BudgetInputs) {
  const { monthlyIncome, monthlyExpenses } = inputs;

  if (monthlyIncome < 0 || monthlyExpenses < 0) {
    throw new Error("Income and expenses cannot be negative.");
  }

  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  return {
    monthlySavings,
    savingsRate,
  };
}

export default function BudgetCalculatorPage() {
  const [values, setValues] = useState<BudgetInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const budgetResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      return calculateBudget(values);
    } catch (err: any) {
      console.error("Budget calculation error:", err);
      setCalculationError(err.message || "An error occurred during calculation.");
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: "Monthly Income",
      name: "monthlyIncome",
      type: "number",
      placeholder: "5,000",
      unit: currency.symbol,
      min: 0,
      required: true,
      tooltip: "Your total income after taxes each month."
    },
    {
      label: "Monthly Expenses",
      name: "monthlyExpenses",
      type: "number",
      placeholder: "3,500",
      unit: currency.symbol,
      min: 0,
      required: true,
      tooltip: "Your total expenses each month (rent, food, bills, etc.)."
    },
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!budgetResults) return [];

    return [
      {
        label: "Monthly Savings",
        value: budgetResults.monthlySavings,
        type: "currency",
        highlight: true,
        tooltip: "The amount of money you save each month.",
      },
      {
        label: "Savings Rate",
        value: budgetResults.savingsRate,
        type: "percentage",
        tooltip: "The percentage of your income that you save.",
      },
    ];
  }, [budgetResults, currency.symbol]);

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
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Budgeting Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Track all your income and expenses diligently.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Aim for a 50/30/20 budget rule (Needs/Wants/Savings).</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Automate your savings to stay consistent.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Budget Calculator"
      description="Easily track your monthly income and expenses to understand your savings potential and manage your finances effectively."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Budget Details"
        description="Enter your monthly income and expenses."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={budgetResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}