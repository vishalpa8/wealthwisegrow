"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { EnhancedCalculatorField, EnhancedCalculatorForm, CalculatorResult } from "@/components/ui/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";

interface LoanInputs {
  loanType: string;
  amount: number;
  rate: number;
  years: number;
}

const initialValues: LoanInputs = {
  loanType: 'personal',
  amount: 500000,
  rate: 12,
  years: 5,
};

export default function LoanCalculator() {
  const [values, setValues] = useState<LoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { addHistory } = useIndexedDBHistory();
  const { currency } = useCurrency();

  const { monthly, totalPayment, totalInterest, interestPercentage, monthlyInterest, monthlyPrincipal, effectiveRate } = useMemo(() => {
    setCalculationError(undefined);
    let monthly = 0;
    let totalPayment = 0;
    let totalInterest = 0;
    let interestPercentage = 0;
    let monthlyInterest = 0;
    let monthlyPrincipal = 0;
    let effectiveRate = 0;

    try {
      if (values.amount > 0 && values.rate > 0 && values.years > 0) {
        const n = values.years * 12;
        const r = values.rate / 100 / 12;
        monthly = (values.amount * r) / (1 - Math.pow(1 + r, -n));
        totalPayment = monthly * n;
        totalInterest = totalPayment - values.amount;
        interestPercentage = values.amount > 0 ? (totalInterest / values.amount) * 100 : 0;
        monthlyInterest = totalInterest / n;
        monthlyPrincipal = monthly - monthlyInterest;
        effectiveRate = values.amount > 0 ? (totalInterest / values.amount / values.years) * 100 : 0;
      }
    } catch (error: any) {
      setCalculationError(error.message || "An error occurred during calculation.");
    }

    return { monthly, totalPayment, totalInterest, interestPercentage, monthlyInterest, monthlyPrincipal, effectiveRate };
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

    if (values.amount <= 0) {
      errors.amount = "Loan amount must be greater than 0";
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

  const loanTypeConfig = {
    personal: { min: 10000, max: 5000000, rateRange: "8-30%", termRange: "1-7 years", icon: "👤", color: "from-blue-500 to-blue-600" },
    home: { min: 100000, max: 100000000, rateRange: "6-15%", termRange: "5-30 years", icon: "🏠", color: "from-green-500 to-green-600" },
    car: { min: 50000, max: 10000000, rateRange: "7-20%", termRange: "1-8 years", icon: "🚗", color: "from-purple-500 to-purple-600" },
    business: { min: 100000, max: 50000000, rateRange: "10-35%", termRange: "1-15 years", icon: "🏢", color: "from-orange-500 to-orange-600" },
    education: { min: 50000, max: 20000000, rateRange: "7-15%", termRange: "1-15 years", icon: "🎓", color: "from-indigo-500 to-indigo-600" },
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
      required: true,
    },
    {
      label: "Loan Amount",
      name: "amount",
      type: "number",
      placeholder: "500,000",
      unit: currency.symbol,
      min: currentConfig.min,
      max: currentConfig.max,
      required: true,
    },
    {
      label: "Interest Rate",
      name: "rate",
      type: "percentage",
      placeholder: "12",
      step: 0.1,
      required: true,
    },
    {
      label: "Loan Term",
      name: "years",
      type: "number",
      placeholder: "5",
      unit: "years",
      min: 1,
      required: true,
    },
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (monthly <= 0) return [];

    return [
      {
        label: "Monthly EMI",
        value: monthly,
        type: "currency",
        highlight: true,
        tooltip: "Equated Monthly Installment (Principal + Interest)",
      },
      {
        label: "Total Payment",
        value: totalPayment,
        type: "currency",
        tooltip: "Total amount paid over the life of the loan (Principal + Interest)",
      },
      {
        label: "Total Interest",
        value: totalInterest,
        type: "currency",
        tooltip: `Total interest paid over ${values.years} years`,
      },
      {
        label: "Interest Burden",
        value: interestPercentage,
        type: "percentage",
        tooltip: "Percentage of principal amount that goes to interest.",
      },
      {
        label: "Effective Rate",
        value: effectiveRate,
        type: "percentage",
        tooltip: "Effective annual cost of borrowing.",
      },
      {
        label: "Monthly Principal",
        value: monthlyPrincipal,
        type: "currency",
        tooltip: "Portion of monthly EMI that goes towards principal.",
      },
      {
        label: "Monthly Interest",
        value: monthlyInterest,
        type: "currency",
        tooltip: "Portion of monthly EMI that goes towards interest.",
      },
    ];
  }, [monthly, totalPayment, totalInterest, interestPercentage, effectiveRate, monthlyPrincipal, monthlyInterest, values.years]);

  // Save to history when calculation changes
  useEffect(() => {
    if (monthly > 0) {
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
  }, [values, monthly, addHistory, results]);

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
      title="Loan Calculator"
      description="Calculate EMI, total interest, and payment schedule for different types of loans."
      sidebar={sidebar}
    >
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
    </CalculatorLayout>
  );
}
