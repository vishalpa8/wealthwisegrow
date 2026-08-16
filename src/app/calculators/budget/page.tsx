"use client";
import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { SimplePieChart } from "@/components/molecules/enhanced-charts";
import { parseRobustNumber } from "@/lib/utils/number";

interface BudgetInputs {
  monthlyIncome: number;
  housing: number;
  transportation: number;
  food: number;
  utilities: number;
  insurance: number;
  healthcare: number;
  savings: number;
  entertainment: number;
  other: number;
}

const initialValues: BudgetInputs = {
  monthlyIncome: 100000,
  housing: 30000,
  transportation: 8000,
  food: 15000,
  utilities: 5000,
  insurance: 3000,
  healthcare: 2000,
  savings: 20000,
  entertainment: 8000,
  other: 5000,
};

export default function BudgetCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: "Monthly Income", name: "monthlyIncome", type: "number", placeholder: "100,000", unit: currency.symbol },
    { label: "Housing (Rent/EMI)", name: "housing", type: "number", placeholder: "30,000", unit: currency.symbol },
    { label: "Transportation", name: "transportation", type: "number", placeholder: "8,000", unit: currency.symbol },
    { label: "Food & Groceries", name: "food", type: "number", placeholder: "15,000", unit: currency.symbol },
    { label: "Utilities", name: "utilities", type: "number", placeholder: "5,000", unit: currency.symbol },
    { label: "Insurance", name: "insurance", type: "number", placeholder: "3,000", unit: currency.symbol },
    { label: "Healthcare", name: "healthcare", type: "number", placeholder: "2,000", unit: currency.symbol },
    { label: "Savings & Investments", name: "savings", type: "number", placeholder: "20,000", unit: currency.symbol },
    { label: "Entertainment", name: "entertainment", type: "number", placeholder: "8,000", unit: currency.symbol },
    { label: "Other Expenses", name: "other", type: "number", placeholder: "5,000", unit: currency.symbol },
  ];

  const calculate = (inputs: BudgetInputs) => {
    const monthlyIncome = Math.abs(parseRobustNumber(inputs.monthlyIncome)) || 100000;
    const housing = Math.abs(parseRobustNumber(inputs.housing)) || 0;
    const transportation = Math.abs(parseRobustNumber(inputs.transportation)) || 0;
    const food = Math.abs(parseRobustNumber(inputs.food)) || 0;
    const utilities = Math.abs(parseRobustNumber(inputs.utilities)) || 0;
    const insurance = Math.abs(parseRobustNumber(inputs.insurance)) || 0;
    const healthcare = Math.abs(parseRobustNumber(inputs.healthcare)) || 0;
    const savings = Math.abs(parseRobustNumber(inputs.savings)) || 0;
    const entertainment = Math.abs(parseRobustNumber(inputs.entertainment)) || 0;
    const other = Math.abs(parseRobustNumber(inputs.other)) || 0;

    const totalExpenses = housing + transportation + food + utilities + insurance + healthcare + entertainment + other;
    const totalAllocated = totalExpenses + savings;
    const remainingIncome = monthlyIncome - totalAllocated;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
    const expenseRatio = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;

    const budgetHealth = savingsRate >= 30 ? "Excellent" : savingsRate >= 20 ? "Good" : savingsRate >= 10 ? "Fair" : "Poor";
    const healthColor = savingsRate >= 30 ? "#059669" : savingsRate >= 20 ? "#10b981" : savingsRate >= 10 ? "#f59e0b" : "#ef4444";

    const results: CalculatorResult[] = [
      { label: "Remaining Income", value: remainingIncome, type: "currency", highlight: true },
      { label: "Total Expenses", value: totalExpenses, type: "currency" },
      { label: "Savings Rate", value: savingsRate, type: "percentage" },
      { label: "Expense Ratio", value: expenseRatio, type: "percentage" },
      { label: "Budget Health", value: budgetHealth, type: "number" },
    ];

    const chartData = {
      pie: [
        { label: "Housing", value: housing, color: "#3b82f6" },
        { label: "Food", value: food, color: "#10b981" },
        { label: "Transport", value: transportation, color: "#f59e0b" },
        { label: "Savings", value: savings, color: "#8b5cf6" },
        { label: "Other", value: utilities + insurance + healthcare + entertainment + other, color: "#6b7280" },
      ].filter(d => d.value > 0),
      health: { status: budgetHealth, color: healthColor, savingsRate }
    };

    return { results, chartData };
  };

  const charts = [
    {
      id: "budget-pie",
      render: (results: any, chartData: any) => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimplePieChart data={chartData.pie} title="Monthly Budget Breakdown" showPercentages={true} />
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-center text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Health Score</h3>
            <div className="text-5xl font-bold mb-2" style={{ color: chartData.health.color }}>
              {chartData.health.status}
            </div>
            <div className="text-gray-600">
              Savings Rate: {chartData.health.savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <BaseCalculatorTemplate<BudgetInputs>
      title="Monthly Household Budget & Expense Calculator"
      description="Create a comprehensive monthly budget to track income, expenses, and savings."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      charts={charts}
    />
  );
}
