"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from '@/lib/utils/number';
import { calculateFutureValue } from "@/lib/calculations/financial-math";

const initialValues = {
  insuranceType: 'life',
  age: 30,
  annualIncome: 1000000,
  dependents: 2,
  existingCoverage: 0,
  outstandingLoans: 500000,
  monthlyExpenses: 50000,
  yearsOfCoverage: 20,
  inflationRate: 6,
  gender: 'male',
  smokingStatus: 'no',
  healthConditions: 'none'
};

export default function InsuranceCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Insurance Type',
      name: 'insuranceType',
      type: 'select',
      options: [
        { value: 'life', label: 'Life Insurance' },
        { value: 'health', label: 'Health Insurance' },
        { value: 'vehicle', label: 'Vehicle Insurance' }
      ],
    },
    {
      label: 'Age',
      name: 'age',
      type: 'number',
      placeholder: '30',
    },
    {
      label: 'Annual Income',
      name: 'annualIncome',
      type: 'number',
      placeholder: '10,00,000',
      unit: currency.symbol,
    },
    {
      label: 'Number of Dependents',
      name: 'dependents',
      type: 'number',
      placeholder: '2',
    },
    {
      label: 'Existing Coverage',
      name: 'existingCoverage',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
    },
    {
      label: 'Outstanding Loans',
      name: 'outstandingLoans',
      type: 'number',
      placeholder: '5,00,000',
      unit: currency.symbol,
    },
    {
      label: 'Monthly Expenses',
      name: 'monthlyExpenses',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
    },
    {
      label: 'Years of Coverage Needed',
      name: 'yearsOfCoverage',
      type: 'number',
      placeholder: '20',
      unit: 'years',
    },
    {
      label: 'Expected Inflation Rate',
      name: 'inflationRate',
      type: 'percentage',
      placeholder: '6',
      step: 0.1,
    },
    {
      label: 'Gender',
      name: 'gender',
      type: 'select',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ],
    },
    {
      label: 'Smoking Status',
      name: 'smokingStatus',
      type: 'select',
      options: [
        { value: 'no', label: 'Non-Smoker' },
        { value: 'yes', label: 'Smoker' }
      ],
    },
    {
      label: 'Health Conditions',
      name: 'healthConditions',
      type: 'select',
      options: [
        { value: 'none', label: 'No Health Issues' },
        { value: 'minor', label: 'Minor Health Issues' },
        { value: 'major', label: 'Major Health Issues' }
      ],
    }
  ], [currency.symbol]);

  const calculate = (inputs: typeof initialValues) => {
    const insuranceType = inputs.insuranceType || 'life';
    const age = Math.max(18, Math.min(80, Math.abs(parseRobustNumber(inputs.age)) || 30));
    const annualIncome = Math.abs(parseRobustNumber(inputs.annualIncome)) || 1000000;
    const dependents = Math.abs(parseRobustNumber(inputs.dependents)) || 0;
    const existingCoverage = Math.abs(parseRobustNumber(inputs.existingCoverage)) || 0;
    const outstandingLoans = Math.abs(parseRobustNumber(inputs.outstandingLoans)) || 0;
    const monthlyExpenses = Math.abs(parseRobustNumber(inputs.monthlyExpenses)) || 50000;
    const yearsOfCoverage = Math.max(5, Math.abs(parseRobustNumber(inputs.yearsOfCoverage)) || 20);
    const inflationRate = Math.max(3, Math.min(15, Math.abs(parseRobustNumber(inputs.inflationRate)) || 6));
    const gender = inputs.gender || 'male';
    const smokingStatus = inputs.smokingStatus || 'no';
    const healthConditions = inputs.healthConditions || 'none';

    let recommendedCoverage = 0;
    let estimatedPremium = 0;

    if (insuranceType === 'life') {
      const halfYears = yearsOfCoverage / 2;
      const futureValueOfIncome = calculateFutureValue(annualIncome * yearsOfCoverage, inflationRate, halfYears);
      const dependentMultiplier = Math.max(1, dependents * 0.5);
      const baseRequirement = futureValueOfIncome * dependentMultiplier;
      
      const futureExpenses = calculateFutureValue(monthlyExpenses * 12 * yearsOfCoverage, inflationRate, halfYears);
      
      recommendedCoverage = Math.max(
        baseRequirement + outstandingLoans + futureExpenses - existingCoverage,
        annualIncome * 10
      );

      let basePremiumRate = 0.5;
      if (age > 40) basePremiumRate *= 1.5;
      if (age > 50) basePremiumRate *= 2;
      if (age > 60) basePremiumRate *= 3;
      if (gender === 'male') basePremiumRate *= 1.1;
      if (smokingStatus === 'yes') basePremiumRate *= 2;
      if (healthConditions === 'minor') basePremiumRate *= 1.2;
      if (healthConditions === 'major') basePremiumRate *= 1.8;
      
      estimatedPremium = (recommendedCoverage / 1000) * basePremiumRate * 12;
      
    } else if (insuranceType === 'health') {
      recommendedCoverage = Math.max(
        annualIncome * 0.5,
        500000,
        monthlyExpenses * 12 * 2
      );
      
      let basePremiumRate = 8;
      if (age > 35) basePremiumRate *= 1.3;
      if (age > 45) basePremiumRate *= 1.8;
      if (age > 55) basePremiumRate *= 2.5;
      if (smokingStatus === 'yes') basePremiumRate *= 1.5;
      if (healthConditions === 'minor') basePremiumRate *= 1.3;
      if (healthConditions === 'major') basePremiumRate *= 2;
      
      estimatedPremium = (recommendedCoverage / 1000) * basePremiumRate;
      
    } else if (insuranceType === 'vehicle') {
      const vehicleValue = annualIncome * 0.1;
      recommendedCoverage = vehicleValue;
      
      let premiumRate = 0.03;
      if (age < 25) premiumRate *= 1.5;
      if (age > 60) premiumRate *= 1.2;
      
      estimatedPremium = vehicleValue * premiumRate;
    }

    const coverageGap = Math.max(0, recommendedCoverage - existingCoverage);
    const premiumAsPercentOfIncome = annualIncome > 0 ? (estimatedPremium / annualIncome) * 100 : 0;
    
    const totalProtection = existingCoverage + coverageGap;
    const monthlyPremium = estimatedPremium / 12;
    const premiumPerLakh = recommendedCoverage > 0 ? (estimatedPremium / recommendedCoverage) * 100000 : 0;

    const results: CalculatorResult[] = [
      {
        label: 'Recommended Coverage',
        value: recommendedCoverage,
        type: 'currency',
        highlight: true,
      },
      {
        label: 'Coverage Gap',
        value: coverageGap,
        type: 'currency',
      },
      {
        label: 'Estimated Annual Premium',
        value: estimatedPremium,
        type: 'currency',
      },
      {
        label: 'Monthly Premium',
        value: monthlyPremium,
        type: 'currency',
      },
      {
        label: 'Premium as % of Income',
        value: premiumAsPercentOfIncome,
        type: 'percentage',
      },
      {
        label: 'Premium per Lakh Coverage',
        value: premiumPerLakh,
        type: 'currency',
      }
    ];

    if (existingCoverage > 0) {
      results.push({
        label: 'Total Protection',
        value: totalProtection,
        type: 'currency',
      });
    }

    return { results };
  };

  return (
    <BaseCalculatorTemplate<typeof initialValues>
      title="Insurance Calculator"
      description="Calculate your insurance needs for life, health, and vehicle insurance. Get personalized coverage recommendations and premium estimates."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
