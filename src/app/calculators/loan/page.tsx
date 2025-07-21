"use client";
import { useState } from "react";
import React from "react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";
import { GoalProgressChart } from "@/components/ui/goal-progress-chart";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorForm, CalculatorFormField } from "@/components/ui/calculator-form";

export default function LoanCalculator() {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);
  const [goal, setGoal] = React.useState(amount);

  const n = years * 12;
  const r = rate / 100 / 12;
  const monthly = amount && rate && years
    ? (amount * r) / (1 - Math.pow(1 + r, -n))
    : 0;

  const { addHistory } = useIndexedDBHistory();

  // Save to history when calculation changes
  React.useEffect(() => {
    if (amount > 0 && rate > 0 && years > 0 && monthly > 0) {
      addHistory({
        id: uuidv4(),
        type: "loan",
        inputs: { amount, rate, years },
        results: { monthly },
        timestamp: new Date(),
        title: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, rate, years, monthly]);

  const fields: CalculatorFormField[] = [
    {
      label: "Loan Amount ($)",
      name: "amount",
      type: "number",
      placeholder: "Enter loan amount",
      min: 0,
      required: true,
    },
    {
      label: "Interest Rate (%)",
      name: "rate",
      type: "number",
      placeholder: "e.g. 8.5",
      min: 0,
      step: 0.01,
      required: true,
    },
    {
      label: "Loan Term (years)",
      name: "years",
      type: "number",
      placeholder: "e.g. 5",
      min: 1,
      required: true,
    },
  ];

  const values = { amount, rate, years };
  const handleChange = (name: string, value: any) => {
    if (name === "amount") setAmount(Number(value));
    if (name === "rate") setRate(Number(value));
    if (name === "years") setYears(Number(value));
  };

  return (
    <section className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8 border border-gray-100 w-full">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Loan Calculator</h1>
      <CalculatorForm fields={fields} values={values} onChange={handleChange} />
      <AdsPlaceholder position="in-content" size="728x90" />
      <div className="bg-green-50 rounded-xl p-6 text-center shadow-inner border border-green-100 animate-fade-in">
        <div className="text-lg font-semibold text-green-700 mb-1">Monthly Payment</div>
        <div className="text-4xl font-extrabold text-green-700 mb-2">${monthly ? monthly.toLocaleString(undefined, {maximumFractionDigits: 2}) : "0.00"}</div>
        <div className="text-sm text-gray-500">Based on your inputs above</div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Set Payoff Goal ($)</label>
        <input
          type="number"
          min={1}
          value={goal}
          onChange={e => setGoal(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-2"
        />
        <GoalProgressChart currentValue={amount} goalValue={goal || 1} label="Loan Payoff Progress" unit="$" />
      </div>
      <AdsPlaceholder position="below-results" size="336x280" />
      <div className="mt-8 text-base text-gray-600">
        <p>This calculator estimates your monthly loan payment based on the amount, interest rate, and term. For a detailed breakdown, consult your lender.</p>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </section>
  );
} 