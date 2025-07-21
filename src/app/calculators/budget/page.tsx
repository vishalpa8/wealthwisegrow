"use client";
import { useState } from "react";
import React from "react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorForm, CalculatorFormField } from "@/components/ui/calculator-form";

export default function BudgetCalculator() {
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState(3500);

  const savings = income - expenses;

  const { addHistory } = useIndexedDBHistory();

  // Save to history when calculation changes
  React.useEffect(() => {
    if (income > 0 && expenses >= 0 && savings !== undefined) {
      addHistory({
        id: uuidv4(),
        type: "budget",
        inputs: { income, expenses },
        results: { savings },
        timestamp: new Date(),
        title: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, expenses, savings]);

  const fields: CalculatorFormField[] = [
    {
      label: "Monthly Income ($)",
      name: "income",
      type: "number",
      placeholder: "Enter monthly income",
      min: 0,
      required: true,
    },
    {
      label: "Monthly Expenses ($)",
      name: "expenses",
      type: "number",
      placeholder: "Enter monthly expenses",
      min: 0,
      required: true,
    },
  ];

  const values = { income, expenses };
  const handleChange = (name: string, value: any) => {
    if (name === "income") setIncome(Number(value));
    if (name === "expenses") setExpenses(Number(value));
  };

  return (
    <section className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8 border border-gray-100 w-full">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Budget Calculator</h1>
      <CalculatorForm fields={fields} values={values} onChange={handleChange} />
      <AdsPlaceholder position="in-content" size="728x90" />
      <div className="bg-pink-50 rounded-xl p-6 text-center shadow-inner border border-pink-100 animate-fade-in">
        <div className="text-lg font-semibold text-pink-700 mb-1">Monthly Savings</div>
        <div className="text-4xl font-extrabold text-pink-700 mb-2">${savings ? savings.toLocaleString(undefined, {maximumFractionDigits: 2}) : "0.00"}</div>
        <div className="text-sm text-gray-500">Based on your inputs above</div>
      </div>
      <AdsPlaceholder position="below-results" size="336x280" />
      <div className="mt-8 text-base text-gray-600">
        <p>This calculator helps you estimate your monthly savings based on your income and expenses.</p>
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