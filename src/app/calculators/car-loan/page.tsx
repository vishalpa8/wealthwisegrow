"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateLoan } from '@/lib/calculations/loan';
import { 
  validationPatterns, 
  createFieldConfigs, 
  formatResults, 
  createSidebar, 
  safeCalculation,
  createLoadingHandler,
  createInputChangeHandler
} from '@/lib/utils/calculator-helpers';

const initialValues = {
  principal: 800000,
  rate: 9.5,
  years: 7,
  extraPayment: 0
};

interface CarLoanInputs {
  principal: number;
  rate: number;
  years: number;
  extraPayment: number;
}

export default function CarLoanCalculatorPage() {
  const [values, setValues] = useState<CarLoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const carLoanResults = useMemo(() => {
    return safeCalculation(
      () => {
        // Use flexible validation with graceful handling
        const validatedValues = validationPatterns.loan(values);
        return calculateLoan(validatedValues);
      },
      null,
      'Car Loan',
      setCalculationError
    );
  }, [values]);

  const fieldConfigs = createFieldConfigs(currency.symbol);
  
  const fields: EnhancedCalculatorField[] = [
    fieldConfigs.amount('principal', 'Car Loan Amount', '10,00,000', 'Total amount you need to borrow for your car'),
    fieldConfigs.percentage('rate', 'Interest Rate', '9.5', 'Annual interest rate offered by the bank or dealer'),
    fieldConfigs.years('years', 'Loan Tenure', '5', 'Number of years to repay the loan'),
    fieldConfigs.amount('extraPayment', 'Extra Monthly Payment', '0', 'Additional amount you can pay monthly to reduce tenure')
  ];

  const results = useMemo(() => {
    if (!carLoanResults) return [];

    return [
      formatResults.currency('Monthly EMI', carLoanResults.monthlyPayment, 'Monthly installment you need to pay', true),
      formatResults.currency('Total Payment', carLoanResults.totalPayment, 'Total amount you will pay over the loan tenure'),
      formatResults.currency('Total Interest', carLoanResults.totalInterest, 'Total interest paid over the loan tenure'),
      formatResults.percentage('Interest as % of Principal', values.principal > 0 ? (carLoanResults.totalInterest / values.principal) * 100 : 0, 'Interest as percentage of loan amount')
    ];
  }, [carLoanResults, values.principal]);

  const handleChange = useCallback(
    createInputChangeHandler(setValues, setCalculationError),
    []
  );

  const handleCalculate = createLoadingHandler(setLoading);

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      {createSidebar([
        'Compare interest rates from banks and dealers',
        'Consider down payment to reduce EMI burden',
        'Check for prepayment charges and penalties',
        'Factor in insurance and registration costs'
      ], 'Car Loan')}
    </div>
  );

  return (
    <CalculatorLayout
      title="Car Loan EMI Calculator"
      description="Calculate car loan EMI, total interest, and understand the true cost of car ownership including depreciation."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Car Loan Details"
        description="Enter your car loan details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={carLoanResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}