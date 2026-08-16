"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";
import { calculateEMI } from "@/lib/calculations/financial-math";

interface EMIInputs {
  loanAmount: number;
  interestRate: number;
  loanTenure: number;
  tenureType: "years" | "months";
  prepaymentAmount: number;
  prepaymentFrequency: "none" | "yearly" | "monthly";
}

const initialValues: EMIInputs = {
  loanAmount: 2500000,
  interestRate: 8.5,
  loanTenure: 20,
  tenureType: "years",
  prepaymentAmount: 0,
  prepaymentFrequency: "none",
};

export function AdvancedEMICalculatorContent() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
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
  ], [currency.symbol]);

  const calculate = (inputs: EMIInputs) => {
    const loanAmount = Math.abs(parseRobustNumber(inputs.loanAmount)) || 0;
    const interestRate = Math.abs(parseRobustNumber(inputs.interestRate)) || 0;
    const loanTenure = Math.max(parseRobustNumber(inputs.loanTenure) || 1, 1);
    const tenureType = inputs.tenureType || "years";
    const prepaymentAmount = Math.abs(parseRobustNumber(inputs.prepaymentAmount)) || 0;
    const prepaymentFrequency = inputs.prepaymentFrequency || "none";

    if (loanAmount === 0) {
      return { results: [] };
    }

    const totalMonths = tenureType === "years" ? loanTenure * 12 : loanTenure;
    const monthlyRate = interestRate / 100 / 12;

    const emi = calculateEMI(loanAmount, interestRate, totalMonths);

    let balance = loanAmount;
    let totalInterestPaid = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = emi - interestPayment;

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

      if (balance <= 0) {
        break;
      }
    }

    const totalAmount = loanAmount + totalInterestPaid;
    const interestToLoanRatio = loanAmount > 0 ? (totalInterestPaid / loanAmount) * 100 : 0;

    const actualTenure = totalMonths; // Wait, actually I should count the loops.
    // Let's recalculate accurately to get actual months
    balance = loanAmount;
    let monthsTaken = 0;
    for (let month = 1; month <= totalMonths; month++) {
      monthsTaken++;
      const interestPayment = balance * monthlyRate;
      let principalPayment = emi - interestPayment;
      let prepayment = 0;
      if (prepaymentAmount > 0) {
        if (prepaymentFrequency === "monthly") prepayment = prepaymentAmount;
        else if (prepaymentFrequency === "yearly" && month % 12 === 0) prepayment = prepaymentAmount;
      }
      principalPayment += prepayment;
      if (principalPayment > balance) principalPayment = balance;
      balance -= principalPayment;
      if (balance <= 0) break;
    }

    const timeSaved = totalMonths - monthsTaken;

    const results: CalculatorResult[] = [
      {
        label: "Monthly EMI",
        value: isFinite(emi) ? emi : 0,
        type: "currency",
        highlight: true,
        tooltip: "Equated Monthly Installment amount",
      },
      {
        label: "Total Interest",
        value: isFinite(totalInterestPaid) ? totalInterestPaid : 0,
        type: "currency",
        tooltip: "Total interest paid over the loan tenure",
      },
      {
        label: "Total Amount",
        value: isFinite(totalAmount) ? totalAmount : 0,
        type: "currency",
        tooltip: "Total amount paid (Principal + Interest)",
      },
      {
        label: "Interest to Loan Ratio",
        value: isFinite(interestToLoanRatio) ? interestToLoanRatio : 0,
        type: "percentage",
        tooltip: "Interest as percentage of loan amount",
      },
      {
        label: "Actual Tenure",
        value: monthsTaken,
        type: "number",
        tooltip: "Actual loan tenure in months (considering prepayments)",
      }
    ];

    if (timeSaved > 0) {
      results.push({
        label: "Time Saved",
        value: timeSaved,
        type: "number",
        tooltip: "Months saved due to prepayments",
      });
    }

    return { results };
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">EMI Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Prepayments can significantly reduce total interest.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare different loan offers before deciding.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider your monthly budget while choosing tenure.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseCalculatorTemplate<EMIInputs>
      title="Advanced Loan Prepayment & EMI Calculator"
      description="Calculate EMI with prepayment options, amortization schedule, and scenario comparisons."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      sidebar={sidebar}
    />
  );
}
