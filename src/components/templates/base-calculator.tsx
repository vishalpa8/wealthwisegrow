"use client";

import React, { useState, useCallback, ReactNode } from "react";
import { CalculatorLayout } from "@/components/templates/calculator-layout";
import { 
  EnhancedCalculatorForm, 
  EnhancedCalculatorField, 
  CalculatorResult 
} from "@/components/organisms/enhanced-calculator-form";

export interface ChartConfig {
  id: string;
  render: (results: CalculatorResult[], data: any, values: any) => ReactNode;
}

export interface BaseCalculatorProps<T extends Record<string, any>> {
  title: string;
  description: string;
  initialValues: T;
  fields: EnhancedCalculatorField[];
  calculate: (values: T) => { results: CalculatorResult[]; chartData?: any };
  charts?: ChartConfig[];
  children?: ReactNode;
  seoContent?: ReactNode;
  faqs?: ReactNode;
  sidebar?: ReactNode;
  onCalculate?: (values: T, results: CalculatorResult[]) => void;
}

export function BaseCalculatorTemplate<T extends Record<string, any>>({
  title,
  description,
  initialValues,
  fields,
  calculate,
  charts,
  children,
  seoContent,
  faqs,
  sidebar,
  onCalculate,
}: BaseCalculatorProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [results, setResults] = useState<CalculatorResult[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  const handleCalculate = useCallback(() => {
    const output = calculate(values);
    setResults(output.results);
    if (output.chartData) setChartData(output.chartData);
    
    // Call the external onCalculate callback if provided
    if (onCalculate) {
      onCalculate(values, output.results);
    }
  }, [calculate, values, onCalculate]);

  // Debounced calculation when values change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleCalculate();
    }, 300); // 300ms debounce prevents UI blocking on fast typing
    return () => clearTimeout(timer);
  }, [values, handleCalculate]);

  const handleChange = useCallback((fieldName: string, value: string | number) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  return (
    <CalculatorLayout title={title} description={description} sidebar={sidebar}>
      <EnhancedCalculatorForm<T>
        title={title}
        description={description}
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={results}
      />
      
      {charts && chartData && results.length > 0 && (
        <div className="mt-8 space-y-8">
          {charts.map((chart) => (
            <div key={chart.id}>
              {chart.render(results, chartData, values)}
            </div>
          ))}
        </div>
      )}

      {children}
      
      {seoContent && (
        <div className="mt-12">
          {seoContent}
        </div>
      )}
      
      {faqs && (
        <div className="mt-12">
          {faqs}
        </div>
      )}
    </CalculatorLayout>
  );
}
