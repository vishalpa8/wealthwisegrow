"use client";
import React, { useState, useMemo } from "react";
import {
  EnhancedCalculatorForm,
  EnhancedCalculatorField,
  CalculatorResult,
} from "@/components/ui/enhanced-calculator-form";
import { calculatePPF, PPFInputs } from "@/lib/calculations/savings";
import { ppfSchema } from "@/lib/validations/calculator";

const initialValues = {
  yearlyInvestment: 50000,
  years: 15,
};

export default function PPFCalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fields: EnhancedCalculatorField[] = [
    {
      label: "Yearly Investment",
      name: "yearlyInvestment",
      type: "number",
      placeholder: "50,000",
      min: 500,
      max: 150000,
      required: true,
      tooltip: "Amount you plan to invest every year in PPF",
    },
    {
      label: "Investment Period",
      name: "years",
      type: "number",
      placeholder: "15",
      min: 15,
      max: 50,
      unit: "years",
      required: true,
      tooltip: "Number of years you plan to keep investing in PPF",
    },
  ];

  const results = useMemo(() => {
    try {
      setError("");
      const validation = ppfSchema.safeParse(values);
      if (!validation.success) {
        setError(validation.error.errors[0]?.message || "Invalid input");
        return [];
      }

      // Ensure the data is correctly typed
      const ppfInputs: PPFInputs = {
        yearlyInvestment: Number(validation.data.yearlyInvestment),
        years: Number(validation.data.years)
      };
      
      const calculation = calculatePPF(ppfInputs);

      const calculatorResults: CalculatorResult[] = [
        {
          label: "Maturity Amount",
          value: calculation.maturityAmount,
          type: "currency",
          highlight: true,
          tooltip: "Total amount received at maturity",
        },
        {
          label: "Total Investment",
          value: calculation.totalInvestment,
          type: "currency",
          tooltip: "Total amount invested over the period",
        },
        {
          label: "Total Returns",
          value: calculation.totalGains,
          type: "currency",
          tooltip: "Interest earned on your investments",
        },
      ];

      return calculatorResults;
    } catch {
      setError("Calculation failed. Please check your inputs.");
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="PPF Calculator"
        description="Calculate the future value of your Public Provident Fund investments."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={results}
        loading={loading}
        error={error}
        showComparison={true}
      />
    </div>
  );
}
