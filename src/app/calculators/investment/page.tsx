"use client";
import { useState, useEffect } from "react";
import { parseRobustNumber, safeMultiply, safeAdd, safePower, safeDivide, safeSubtract } from "@/lib/utils/number";
import { NumericInput } from "@/components/ui/numeric-input";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";
import { GoalProgressChart } from "@/components/ui/goal-progress-chart";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorForm, CalculatorFormField } from "@/components/ui/calculator-form";

export default function InvestmentCalculator() {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);
  const n = years * 12;
  const r = rate / 100 / 12;
  // Future value of a series formula
const fv = safeAdd(safeMultiply(initial, safePower(1 + r, n)),
    safeMultiply(monthly, safeDivide(safeSubtract(safePower(1 + r, n), 1), r)));
  const [goal, setGoal] = useState(fv);

  const { addHistory } = useIndexedDBHistory();

  // Save to history when calculation changes
  useEffect(() => {
    if (initial > 0 && monthly >= 0 && rate > 0 && years > 0 && fv > 0) {
      addHistory({
        id: uuidv4(),
        type: "investment",
        inputs: { initial, monthly, rate, years },
        results: { fv },
        timestamp: new Date(),
        title: "",
        notes: "",
      });
    }
  }, [initial, monthly, rate, years, fv]);

  const fields: CalculatorFormField[] = [
    {
      label: "Initial Investment ($)",
      name: "initial",
      type: "number",
      placeholder: "Enter initial investment",
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
      label: "Annual Return Rate (%)",
      name: "rate",
      type: "number",
      placeholder: "e.g. 7",
      min: 0,
      step: 0.01,
      required: true,
    },
    {
      label: "Years",
      name: "years",
      type: "number",
      placeholder: "e.g. 20",
      min: 1,
      required: true,
    },
  ];

  const values = { initial, monthly, rate, years };
  const handleChange = (name: string, value: any) => {
    if (name === "initial") setInitial(parseRobustNumber(value));
    if (name === "monthly") setMonthly(parseRobustNumber(value));
    if (name === "rate") setRate(parseRobustNumber(value));
    if (name === "years") setYears(parseRobustNumber(value));
  };

  return (
    <section className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8 border border-gray-100 w-full">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Investment Calculator</h1>
      <CalculatorForm fields={fields} values={values} onChange={handleChange} />
      <AdsPlaceholder position="in-content" size="728x90" />
      <div className="bg-purple-50 rounded-xl p-6 text-center shadow-inner border border-purple-100 animate-fade-in">
        <div className="text-lg font-semibold text-purple-700 mb-1">Future Value</div>
        <div className="text-4xl font-extrabold text-purple-700 mb-2">${fv ? fv.toLocaleString(undefined, {maximumFractionDigits: 2}) : "0.00"}</div>
        <div className="text-sm text-gray-500">Based on your inputs above</div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Set Investment Goal ($)</label>
        <NumericInput
          min={1}
          value={goal}
          onValueChange={(value) => setGoal(value || 0)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-2"
        />
        <GoalProgressChart currentValue={fv} goalValue={goal || 1} label="Investment Growth Progress" unit="$" />
      </div>
      <AdsPlaceholder position="below-results" size="336x280" />
      <div className="mt-8 text-base text-gray-600">
        <p>This calculator estimates the future value of your investments based on your contributions and expected return rate.</p>
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