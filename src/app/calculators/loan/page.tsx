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
  // Removed validationErrors state for more flexible user experience
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { addHistory } = useIndexedDBHistory();
  const { currency } = useCurrency();

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

    // No validation errors - let the calculation handle edge cases gracefully
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
      required: true
    },
    {
      label: 'Loan Amount',
      name: 'amount',
      type: 'number',
      placeholder: '5,00,000',
      unit: currency.symbol,
      tooltip: 'Total amount you want to borrow'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '10',
      step: 0.1,
      tooltip: 'Annual interest rate offered by the lender'
    },
    {
      label: 'Loan Term',
      name: 'years',
      type: 'number',
      placeholder: '20',
      unit: 'years',
      tooltip: 'Duration of the loan in years'
    },
    {
      label: 'Extra Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      tooltip: 'Additional monthly payment towards principal'
    }
  ];

  const calculateLoan = (values: LoanInputs) => {
    const principal = Math.abs(values.amount || 0);
    const annualRate = Math.abs(values.rate || 0);
    const years = Math.abs(values.years || 1);
    
    // Handle edge cases gracefully
    if (principal === 0) {
      return {
        monthly: 0,
        totalPayment: 0,
        totalInterest: 0,
        interestPercentage: 0,
        effectiveRate: annualRate,
        monthlyPrincipal: 0,
        monthlyInterest: 0
      };
    }
    
    const rate = annualRate / 100 / 12; // Monthly interest rate
    const months = years * 12;

    let monthly = 0;
    if (rate === 0) {
      // Handle zero interest rate
      monthly = principal / months;
    } else {
      monthly = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    }
    
    const totalPayment = monthly * months;
    const totalInterest = totalPayment - principal;
    const interestPercentage = principal > 0 ? (totalInterest / principal) * 100 : 0;
    const effectiveRate = rate > 0 ? ((Math.pow(1 + rate, 12) - 1) * 100) : 0;
    const monthlyPrincipal = principal / months;
    const monthlyInterest = monthly - monthlyPrincipal;

    return {
      monthly: isFinite(monthly) ? monthly : 0,
      totalPayment: isFinite(totalPayment) ? totalPayment : 0,
      totalInterest: isFinite(totalInterest) ? totalInterest : 0,
      interestPercentage: isFinite(interestPercentage) ? interestPercentage : 0,
      effectiveRate: isFinite(effectiveRate) ? effectiveRate : 0,
      monthlyPrincipal: isFinite(monthlyPrincipal) ? monthlyPrincipal : 0,
      monthlyInterest: isFinite(monthlyInterest) ? monthlyInterest : 0
    };
  };

  

  const { 
    monthly,
    totalPayment,
    totalInterest,
    interestPercentage,
    effectiveRate,
    monthlyPrincipal,
    monthlyInterest
  } = useMemo(() => {
    try {
      return calculateLoan(values);
    } catch (error) {
      console.error('Error calculating loan:', error);
      return {
        monthly: 0,
        totalPayment: 0,
        totalInterest: 0,
        interestPercentage: 0,
        effectiveRate: 0,
        monthlyPrincipal: 0,
        monthlyInterest: 0,
      };
    }
  }, [values]);

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
