"use client";
import { useState, useMemo, useCallback } from "react";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from "@/components/ui/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { SimplePieChart } from "@/components/ui/enhanced-charts";
import { Tabs } from "@/components/ui/tabs";
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

function calculateBudget(inputs: BudgetInputs) {
  // Use parseRobustNumber for flexible input handling
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

  // Calculate category percentages
  const categoryPercentages = {
    housing: monthlyIncome > 0 ? (housing / monthlyIncome) * 100 : 0,
    transportation: monthlyIncome > 0 ? (transportation / monthlyIncome) * 100 : 0,
    food: monthlyIncome > 0 ? (food / monthlyIncome) * 100 : 0,
    utilities: monthlyIncome > 0 ? (utilities / monthlyIncome) * 100 : 0,
    insurance: monthlyIncome > 0 ? (insurance / monthlyIncome) * 100 : 0,
    healthcare: monthlyIncome > 0 ? (healthcare / monthlyIncome) * 100 : 0,
    savings: savingsRate,
    entertainment: monthlyIncome > 0 ? (entertainment / monthlyIncome) * 100 : 0,
    other: monthlyIncome > 0 ? (other / monthlyIncome) * 100 : 0,
  };

  // Budget health assessment
  let budgetHealth = "Good";
  let healthColor = "#10b981";
  
  if (savingsRate < 10) {
    budgetHealth = "Poor";
    healthColor = "#ef4444";
  } else if (savingsRate < 20) {
    budgetHealth = "Fair";
    healthColor = "#f59e0b";
  } else if (savingsRate >= 30) {
    budgetHealth = "Excellent";
    healthColor = "#059669";
  }

  // Recommendations
  const recommendations = [];
  if (categoryPercentages.housing > 30) {
    recommendations.push("Housing costs exceed 30% of income. Consider reducing housing expenses.");
  }
  if (savingsRate < 20) {
    recommendations.push("Aim to save at least 20% of your income for financial security.");
  }
  if (categoryPercentages.transportation > 15) {
    recommendations.push("Transportation costs are high. Consider carpooling or public transport.");
  }
  if (remainingIncome < 0) {
    recommendations.push("You're overspending! Reduce expenses or increase income.");
  }

  return {
    totalExpenses,
    totalAllocated,
    remainingIncome,
    savingsRate,
    expenseRatio,
    categoryPercentages,
    budgetHealth,
    healthColor,
    recommendations,
  };
}

export default function BudgetCalculatorPage() {
  const [values, setValues] = useState<BudgetInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('calculator');

  const { currency } = useCurrency();

  const budgetResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Always attempt calculation - let the function handle edge cases gracefully
      const calculation = calculateBudget(values);
      return calculation;
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
      placeholder: "100,000",
      unit: currency.symbol,
      tooltip: "Your total monthly income after taxes"
    },
    {
      label: "Housing (Rent/EMI)",
      name: "housing",
      type: "number",
      placeholder: "30,000",
      unit: currency.symbol,
      tooltip: "Rent, mortgage payments, property taxes, maintenance"
    },
    {
      label: "Transportation",
      name: "transportation",
      type: "number",
      placeholder: "8,000",
      unit: currency.symbol,
      tooltip: "Car payments, fuel, public transport, maintenance"
    },
    {
      label: "Food & Groceries",
      name: "food",
      type: "number",
      placeholder: "15,000",
      unit: currency.symbol,
      tooltip: "Groceries, dining out, food delivery"
    },
    {
      label: "Utilities",
      name: "utilities",
      type: "number",
      placeholder: "5,000",
      unit: currency.symbol,
      tooltip: "Electricity, water, gas, internet, phone"
    },
    {
      label: "Insurance",
      name: "insurance",
      type: "number",
      placeholder: "3,000",
      unit: currency.symbol,
      tooltip: "Health, life, car, home insurance premiums"
    },
    {
      label: "Healthcare",
      name: "healthcare",
      type: "number",
      placeholder: "2,000",
      unit: currency.symbol,
      tooltip: "Medical expenses, medicines, checkups"
    },
    {
      label: "Savings & Investments",
      name: "savings",
      type: "number",
      placeholder: "20,000",
      unit: currency.symbol,
      tooltip: "Emergency fund, investments, retirement savings"
    },
    {
      label: "Entertainment",
      name: "entertainment",
      type: "number",
      placeholder: "8,000",
      unit: currency.symbol,
      tooltip: "Movies, subscriptions, hobbies, travel"
    },
    {
      label: "Other Expenses",
      name: "other",
      type: "number",
      placeholder: "5,000",
      unit: currency.symbol,
      tooltip: "Miscellaneous expenses not covered above"
    },
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!budgetResults) return [];

    return [
      {
        label: "Remaining Income",
        value: budgetResults.remainingIncome,
        type: "currency",
        highlight: true,
        tooltip: "Money left after all expenses and savings",
      },
      {
        label: "Total Expenses",
        value: budgetResults.totalExpenses,
        type: "currency",
        tooltip: "Sum of all monthly expenses",
      },
      {
        label: "Savings Rate",
        value: budgetResults.savingsRate,
        type: "percentage",
        tooltip: "Percentage of income saved",
      },
      {
        label: "Expense Ratio",
        value: budgetResults.expenseRatio,
        type: "percentage",
        tooltip: "Percentage of income spent on expenses",
      },
      {
        label: "Budget Health",
        value: budgetResults.budgetHealth,
        type: "number",
        tooltip: "Overall assessment of your budget health",
      },
    ];
  }, [budgetResults]);

  // Prepare data for pie chart
  const pieChartData = useMemo(() => {
    if (!budgetResults) return [];
    
    const data = [
      { label: "Housing", value: values.housing, color: "#3b82f6" },
      { label: "Food", value: values.food, color: "#ef4444" },
      { label: "Savings", value: values.savings, color: "#10b981" },
      { label: "Transportation", value: values.transportation, color: "#f59e0b" },
      { label: "Entertainment", value: values.entertainment, color: "#8b5cf6" },
      { label: "Utilities", value: values.utilities, color: "#06b6d4" },
      { label: "Healthcare", value: values.healthcare, color: "#84cc16" },
      { label: "Insurance", value: values.insurance, color: "#f97316" },
      { label: "Other", value: values.other, color: "#6b7280" },
    ].filter(item => item.value > 0);

    if (budgetResults.remainingIncome > 0) {
      data.push({ 
        label: "Unallocated", 
        value: budgetResults.remainingIncome, 
        color: "#d1d5db" 
      });
    }

    return data;
  }, [budgetResults, values]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 400);
  };

  const tabs = [
    { id: 'calculator', label: 'Budget Calculator', icon: '💰' },
    { id: 'breakdown', label: 'Expense Breakdown', icon: '📊' },
    { id: 'analysis', label: 'Budget Analysis', icon: '📈' }
  ];

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Budget Guidelines</h3>
        <div className="space-y-3">
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 mb-1 text-sm">50/30/20 Rule</h4>
            <p className="text-xs text-neutral-600">50% Needs, 30% Wants, 20% Savings</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 mb-1 text-sm">Housing</h4>
            <p className="text-xs text-neutral-600">Should not exceed 30% of income</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 mb-1 text-sm">Savings</h4>
            <p className="text-xs text-neutral-600">Aim for at least 20% of income</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Budgeting Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Track expenses for at least a month</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Automate savings and bill payments</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Review and adjust monthly</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Build an emergency fund first</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Budget Calculator"
      description="Create a comprehensive monthly budget to track income, expenses, and savings. Get insights into your spending patterns and financial health."
      sidebar={sidebar}
    >
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {activeTab === 'calculator' && (
        <EnhancedCalculatorForm
          title="Monthly Budget Details"
          description="Enter your monthly income and expenses by category."
          fields={fields}
          values={values}
          onChange={handleChange}
          onCalculate={handleCalculate}
          results={budgetResults ? results : []}
          loading={loading}
          error={calculationError}
          showComparison={false}
        />
      )}

      {activeTab === 'breakdown' && budgetResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimplePieChart
            data={pieChartData}
            title="Monthly Budget Breakdown"
            showPercentages={true}
          />
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Analysis</h3>
            <div className="space-y-3">
              {Object.entries(budgetResults.categoryPercentages).map(([category, percentage]) => {
                const amount = values[category as keyof BudgetInputs];
                if (amount <= 0) return null;
                
                let status = "Good";
                let statusColor = "text-green-600";
                
                if (category === 'housing' && percentage > 30) {
                  status = "High";
                  statusColor = "text-red-600";
                } else if (category === 'savings' && percentage < 20) {
                  status = "Low";
                  statusColor = "text-red-600";
                } else if (category === 'transportation' && percentage > 15) {
                  status = "High";
                  statusColor = "text-orange-600";
                }
                
                return (
                  <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="text-sm text-gray-600">
                        {currency.symbol}{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && budgetResults && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Health Score</h3>
            <div 
              className="text-4xl font-bold mb-2"
              style={{ color: budgetResults.healthColor }}
            >
              {budgetResults.budgetHealth}
            </div>
            <div className="text-gray-600">
              Savings Rate: {budgetResults.savingsRate.toFixed(1)}%
            </div>
          </div>

          {budgetResults.recommendations.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {budgetResults.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-600 font-bold">{index + 1}.</span>
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-green-900 mb-2">Monthly Savings</h4>
              <p className="text-2xl font-bold text-green-700">
                {currency.symbol}{values.savings.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">
                {budgetResults.savingsRate.toFixed(1)}% of income
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-blue-900 mb-2">Total Expenses</h4>
              <p className="text-2xl font-bold text-blue-700">
                {currency.symbol}{budgetResults.totalExpenses.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">
                {budgetResults.expenseRatio.toFixed(1)}% of income
              </p>
            </div>
            
            <div className={`border rounded-lg p-4 text-center ${
              budgetResults.remainingIncome >= 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                budgetResults.remainingIncome >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                Remaining Income
              </h4>
              <p className={`text-2xl font-bold ${
                budgetResults.remainingIncome >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {currency.symbol}{budgetResults.remainingIncome.toLocaleString()}
              </p>
              <p className={`text-sm ${
                budgetResults.remainingIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {budgetResults.remainingIncome >= 0 ? 'Surplus' : 'Deficit'}
              </p>
            </div>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}