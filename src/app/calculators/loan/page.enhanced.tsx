"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { EnhancedCalculatorField, EnhancedCalculatorForm, CalculatorResult } from "@/components/ui/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { SimplePieChart, AmortizationSchedule, InvestmentGrowthChart } from "@/components/ui/enhanced-charts";
import { ScenarioComparison } from "@/components/ui/scenario-comparison";
import { Tabs } from "@/components/ui/tabs";
import { parseRobustNumber } from "@/lib/utils/number";

interface LoanInputs {
  loanType: string;
  amount: number;
  rate: number;
  years: number;
}

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const initialValues: LoanInputs = {
  loanType: 'personal',
  amount: 500000,
  rate: 12,
  years: 5,
};

export default function EnhancedLoanCalculator() {
  const [values, setValues] = useState<LoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('calculator');
  const [comparisonScenarios, setComparisonScenarios] = useState<any[]>([]);

  const { addHistory } = useIndexedDBHistory();
  const { currency } = useCurrency();

  // Enhanced calculation with amortization schedule
  const calculationResults = useMemo(() => {
    setCalculationError(undefined);
    let monthly = 0;
    let totalPayment = 0;
    let totalInterest = 0;
    let interestPercentage = 0;
    let monthlyInterest = 0;
    let monthlyPrincipal = 0;
    let effectiveRate = 0;
    const amortizationSchedule: AmortizationEntry[] = [];

    try {
      // Use parseRobustNumber for flexible input handling
      const amount = Math.abs(parseRobustNumber(values.amount)) || 0;
      const rate = Math.abs(parseRobustNumber(values.rate)) || 0;
      const years = Math.max(1, Math.abs(parseRobustNumber(values.years)) || 1);

      if (amount > 0 && rate > 0 && years > 0) {
        const n = years * 12;
        const r = rate / 100 / 12;
        monthly = (amount * r) / (1 - Math.pow(1 + r, -n));
        totalPayment = monthly * n;
        totalInterest = totalPayment - amount;
        interestPercentage = amount > 0 ? (totalInterest / amount) * 100 : 0;
        monthlyInterest = totalInterest / n;
        monthlyPrincipal = monthly - monthlyInterest;
        effectiveRate = amount > 0 ? (totalInterest / amount / years) * 100 : 0;

        // Generate amortization schedule
        let remainingBalance = amount;
        for (let month = 1; month <= n; month++) {
          const interestPayment = remainingBalance * r;
          const principalPayment = monthly - interestPayment;
          remainingBalance -= principalPayment;

          amortizationSchedule.push({
            month,
            payment: monthly,
            principal: principalPayment,
            interest: interestPayment,
            balance: Math.max(0, remainingBalance)
          });
        }
      }
    } catch (error: any) {
      setCalculationError(error.message || "An error occurred during calculation.");
    }

    return { 
      monthly, 
      totalPayment, 
      totalInterest, 
      interestPercentage, 
      monthlyInterest, 
      monthlyPrincipal, 
      effectiveRate,
      amortizationSchedule
    };
  }, [values]);

  const handleInputChange = useCallback(
    (name: string, value: any) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const loanTypeConfig = {
    personal: { rateRange: "8-30%", termRange: "1-7 years", icon: "👤", color: "from-blue-500 to-blue-600" },
    home: { rateRange: "6-15%", termRange: "5-30 years", icon: "🏠", color: "from-green-500 to-green-600" },
    car: { rateRange: "7-20%", termRange: "1-8 years", icon: "🚗", color: "from-purple-500 to-purple-600" },
    business: { rateRange: "10-35%", termRange: "1-15 years", icon: "🏢", color: "from-orange-500 to-orange-600" },
    education: { rateRange: "7-15%", termRange: "1-15 years", icon: "🎓", color: "from-indigo-500 to-indigo-600" },
  };

  const currentConfig = loanTypeConfig[values.loanType as keyof typeof loanTypeConfig];

  const fields: EnhancedCalculatorField[] = [
    {
      label: "Loan Type",
      name: "loanType",
      type: "select",
      options: Object.entries(loanTypeConfig).map(([type, config]) => ({
        value: type,
        label: `${config.icon} ${type.charAt(0).toUpperCase() + type.slice(1)} Loan`,
      })),
      tooltip: "Select the type of loan you want to calculate"
    },
    {
      label: "Loan Amount",
      name: "amount",
      type: "number",
      placeholder: "500,000",
      unit: currency.symbol,
      tooltip: "Principal loan amount you want to borrow"
    },
    {
      label: "Interest Rate",
      name: "rate",
      type: "percentage",
      placeholder: "12",
      step: 0.1,
      tooltip: "Annual interest rate offered by the lender"
    },
    {
      label: "Loan Term",
      name: "years",
      type: "number",
      placeholder: "5",
      unit: "years",
      tooltip: "Duration of the loan in years"
    },
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (calculationResults.monthly <= 0) return [];

    return [
      {
        label: "Monthly EMI",
        value: calculationResults.monthly,
        type: "currency",
        highlight: true,
        tooltip: "Equated Monthly Installment (Principal + Interest)",
      },
      {
        label: "Total Payment",
        value: calculationResults.totalPayment,
        type: "currency",
        tooltip: "Total amount paid over the life of the loan (Principal + Interest)",
      },
      {
        label: "Total Interest",
        value: calculationResults.totalInterest,
        type: "currency",
        tooltip: `Total interest paid over ${values.years} years`,
      },
      {
        label: "Interest Burden",
        value: calculationResults.interestPercentage,
        type: "percentage",
        tooltip: "Percentage of principal amount that goes to interest.",
      },
      {
        label: "Effective Rate",
        value: calculationResults.effectiveRate,
        type: "percentage",
        tooltip: "Effective annual cost of borrowing.",
      },
      {
        label: "Monthly Principal",
        value: calculationResults.monthlyPrincipal,
        type: "currency",
        tooltip: "Portion of monthly EMI that goes towards principal.",
      },
      {
        label: "Monthly Interest",
        value: calculationResults.monthlyInterest,
        type: "currency",
        tooltip: "Portion of monthly EMI that goes towards interest.",
      },
    ];
  }, [calculationResults, values.years]);

  // Prepare data for visualizations
  const pieChartData = useMemo(() => {
    if (calculationResults.monthly <= 0) return [];
    return [
      {
        label: "Principal",
        value: values.amount,
        color: "#3b82f6"
      },
      {
        label: "Interest",
        value: calculationResults.totalInterest,
        color: "#ef4444"
      }
    ];
  }, [calculationResults, values.amount]);

  const yearlyGrowthData = useMemo(() => {
    if (calculationResults.amortizationSchedule.length === 0) return [];
    
    const yearlyData = [];
    for (let year = 1; year <= values.years; year++) {
      const endMonth = year * 12;
      const scheduleEntry = calculationResults.amortizationSchedule[Math.min(endMonth - 1, calculationResults.amortizationSchedule.length - 1)];
      let paidPrincipal = 0;
      let paidInterest = 0;

      if (scheduleEntry) {
        paidPrincipal = values.amount - scheduleEntry.balance;
        paidInterest = (calculationResults.monthly * endMonth) - paidPrincipal;
      }
      
      yearlyData.push({
        year,
        principal: paidPrincipal,
        interest: paidInterest,
        total: paidPrincipal + paidInterest
      });
    }
    return yearlyData;
  }, [calculationResults, values]);

  // Comparison functionality
  const addToComparison = () => {
    if (calculationResults.monthly <= 0) return;
    
    const scenario = {
      id: uuidv4(),
      name: `${values.loanType} - ${currency.symbol}${values.amount.toLocaleString()} @ ${values.rate}%`,
      inputs: { ...values },
      results: results.map(r => ({ label: r.label, value: r.value, type: r.type }))
    };
    
    setComparisonScenarios(prev => [...prev, scenario]);
  };

  const removeFromComparison = (id: string) => {
    setComparisonScenarios(prev => prev.filter(s => s.id !== id));
  };

  // Save to history when calculation changes
  useEffect(() => {
    if (calculationResults.monthly > 0) {
      addHistory({
        id: uuidv4(),
        type: "loan",
        inputs: values,
        results: results.map(r => ({ label: r.label, value: r.value, type: r.type })),
        timestamp: new Date(),
        title: `${values.loanType} Loan Calculator`,
        notes: "",
      });
    }
  }, [values, calculationResults.monthly, addHistory, results]);

  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: '🧮' },
    { id: 'breakdown', label: 'Payment Breakdown', icon: '📊' },
    { id: 'schedule', label: 'Payment Schedule', icon: '📅' },
    { id: 'comparison', label: 'Compare Scenarios', icon: '⚖️' }
  ];

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Loan Information</h3>
        <div className="space-y-3">
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 mb-1 text-sm">Current Type</h4>
            <p className="text-sm text-neutral-700 capitalize">{values.loanType} Loan</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 mb-1 text-sm">Rate Range</h4>
            <p className="text-sm text-neutral-700">{currentConfig.rateRange}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 mb-1 text-sm">Term Range</h4>
            <p className="text-sm text-neutral-700">{currentConfig.termRange}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare rates from multiple lenders</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider prepayment options</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Check for processing fees</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Maintain good credit score</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Enhanced Loan Calculator"
      description="Calculate EMI, total interest, and payment schedule for different types of loans with detailed visualizations."
      sidebar={sidebar}
    >
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <EnhancedCalculatorForm
            title="Loan Details"
            description="Enter the details of your loan."
            fields={fields}
            values={values}
            onChange={handleInputChange}
            onCalculate={handleCalculate}
            results={results}
            loading={loading}
            error={calculationError}
          />
          
          {calculationResults.monthly > 0 && (
            <div className="flex justify-center">
              <button
                onClick={addToComparison}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Comparison
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'breakdown' && calculationResults.monthly > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimplePieChart
            data={pieChartData}
            title="Total Payment Breakdown"
            showPercentages={true}
          />
          <InvestmentGrowthChart
            yearlyData={yearlyGrowthData}
            title="Cumulative Payments Over Time"
          />
        </div>
      )}

      {activeTab === 'schedule' && calculationResults.amortizationSchedule.length > 0 && (
        <AmortizationSchedule
          schedule={calculationResults.amortizationSchedule}
          title="Loan Amortization Schedule"
          maxRows={24}
        />
      )}

      {activeTab === 'comparison' && (
        <ScenarioComparison
          scenarios={comparisonScenarios}
          onAddScenario={addToComparison}
          onRemoveScenario={removeFromComparison}
          title="Loan Scenario Comparison"
          maxScenarios={4}
        />
      )}
    </CalculatorLayout>
  );
}