"use client";
import { useState } from "react";
import React from "react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";
import { GoalProgressChart } from "@/components/ui/goal-progress-chart";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorForm, CalculatorFormField } from "@/components/ui/calculator-form";

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(20000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(7);
  const years = retirementAge - currentAge;
  const n = years * 12;
  const r = rate / 100 / 12;
  // Future value of a series formula
  const fv = currentSavings * Math.pow(1 + r, n) +
    (monthly * (Math.pow(1 + r, n) - 1)) / r;
  const [goal, setGoal] = React.useState(fv);

  const { addHistory } = useIndexedDBHistory();

  // Save to history when calculation changes
  React.useEffect(() => {
    if (currentAge > 0 && retirementAge > currentAge && currentSavings >= 0 && monthly >= 0 && rate > 0 && fv > 0) {
      addHistory({
        id: uuidv4(),
        type: "retirement",
        inputs: { currentAge, retirementAge, currentSavings, monthly, rate },
        results: { fv },
        timestamp: new Date(),
        title: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAge, retirementAge, currentSavings, monthly, rate, fv]);

  const fields: CalculatorFormField[] = [
    {
      label: "Current Age",
      name: "currentAge",
      type: "number",
      placeholder: "e.g. 30",
      min: 0,
      required: true,
    },
    {
      label: "Retirement Age",
      name: "retirementAge",
      type: "number",
      placeholder: "e.g. 65",
      min: currentAge + 1,
      required: true,
    },
    {
      label: "Current Savings ($)",
      name: "currentSavings",
      type: "number",
      placeholder: "Enter current savings",
      min: 0,
      required: true,
    },
    {
      label: "Monthly Contribution ($)",
      name: "monthly",
      type: "number",
      placeholder: "Enter monthly contribution",
      min: 0,
      required: true,
    },
    {
      label: "Expected Return Rate (%)",
      name: "rate",
      type: "number",
      placeholder: "e.g. 7",
      min: 0,
      step: 0.01,
      required: true,
    },
  ];

  const values = { currentAge, retirementAge, currentSavings, monthly, rate };
  const handleChange = (name: string, value: any) => {
    if (name === "currentAge") setCurrentAge(Number(value));
    if (name === "retirementAge") setRetirementAge(Number(value));
    if (name === "currentSavings") setCurrentSavings(Number(value));
    if (name === "monthly") setMonthly(Number(value));
    if (name === "rate") setRate(Number(value));
  };

  return (
    <section className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8 border border-gray-100 w-full">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Retirement Calculator</h1>
      <CalculatorForm fields={fields} values={values} onChange={handleChange} />
      <AdsPlaceholder position="in-content" size="728x90" />
      <div className="bg-yellow-50 rounded-xl p-6 text-center shadow-inner border border-yellow-100 animate-fade-in">
        <div className="text-lg font-semibold text-yellow-700 mb-1">Projected Retirement Savings</div>
        <div className="text-4xl font-extrabold text-yellow-700 mb-2">${fv ? fv.toLocaleString(undefined, {maximumFractionDigits: 2}) : "0.00"}</div>
        <div className="text-sm text-gray-500">Based on your inputs above</div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Set Retirement Savings Goal ($)</label>
        <input
          type="number"
          min={1}
          value={goal}
          onChange={e => setGoal(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-2"
        />
        <GoalProgressChart currentValue={fv} goalValue={goal || 1} label="Retirement Savings Progress" unit="$" />
      </div>
      <AdsPlaceholder position="below-results" size="336x280" />
      <div className="mt-8 text-base text-gray-600">
        <p>This calculator estimates your retirement savings based on your current savings, contributions, and expected return rate.</p>
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