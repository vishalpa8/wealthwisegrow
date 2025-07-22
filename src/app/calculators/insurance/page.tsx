"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";

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

interface InsuranceInputs {
  insuranceType: string;
  age: number;
  annualIncome: number;
  dependents: number;
  existingCoverage: number;
  outstandingLoans: number;
  monthlyExpenses: number;
  yearsOfCoverage: number;
  inflationRate: number;
  gender: string;
  smokingStatus: string;
  healthConditions: string;
}

function calculateInsuranceNeeds(inputs: InsuranceInputs) {
  const {
    insuranceType,
    age,
    annualIncome,
    dependents,
    existingCoverage,
    outstandingLoans,
    monthlyExpenses,
    yearsOfCoverage,
    inflationRate,
    gender,
    smokingStatus,
    healthConditions
  } = inputs;

  let recommendedCoverage = 0;
  let estimatedPremium = 0;

  if (insuranceType === 'life') {
    // Life Insurance Calculation using Human Life Value method
    const futureValueOfIncome = annualIncome * yearsOfCoverage * Math.pow(1 + inflationRate / 100, yearsOfCoverage / 2);
    const dependentMultiplier = Math.max(1, dependents * 0.5);
    const baseRequirement = futureValueOfIncome * dependentMultiplier;
    
    // Add outstanding loans and future expenses
    const futureExpenses = monthlyExpenses * 12 * yearsOfCoverage * Math.pow(1 + inflationRate / 100, yearsOfCoverage / 2);
    
    recommendedCoverage = Math.max(
      baseRequirement + outstandingLoans + futureExpenses - existingCoverage,
      annualIncome * 10 // Minimum 10x annual income
    );

    // Premium calculation (simplified)
    let basePremiumRate = 0.5; // Base rate per 1000 of coverage
    
    // Age factor
    if (age > 40) basePremiumRate *= 1.5;
    if (age > 50) basePremiumRate *= 2;
    if (age > 60) basePremiumRate *= 3;
    
    // Gender factor
    if (gender === 'male') basePremiumRate *= 1.1;
    
    // Smoking factor
    if (smokingStatus === 'yes') basePremiumRate *= 2;
    
    // Health conditions factor
    if (healthConditions === 'minor') basePremiumRate *= 1.2;
    if (healthConditions === 'major') basePremiumRate *= 1.8;
    
    estimatedPremium = (recommendedCoverage / 1000) * basePremiumRate * 12; // Annual premium
    
  } else if (insuranceType === 'health') {
    // Health Insurance Calculation
    recommendedCoverage = Math.max(
      annualIncome * 0.5, // 50% of annual income
      500000, // Minimum 5 lakhs
      monthlyExpenses * 12 * 2 // 2 years of expenses
    );
    
    // Health insurance premium calculation
    let basePremiumRate = 8; // Base rate per 1000 of coverage
    
    if (age > 35) basePremiumRate *= 1.3;
    if (age > 45) basePremiumRate *= 1.8;
    if (age > 55) basePremiumRate *= 2.5;
    
    if (smokingStatus === 'yes') basePremiumRate *= 1.5;
    if (healthConditions === 'minor') basePremiumRate *= 1.3;
    if (healthConditions === 'major') basePremiumRate *= 2;
    
    estimatedPremium = (recommendedCoverage / 1000) * basePremiumRate;
    
  } else if (insuranceType === 'vehicle') {
    // Vehicle Insurance (assuming car worth 10% of annual income)
    const vehicleValue = annualIncome * 0.1;
    recommendedCoverage = vehicleValue;
    
    // Vehicle insurance premium (2-4% of vehicle value)
    let premiumRate = 0.03;
    if (age < 25) premiumRate *= 1.5;
    if (age > 60) premiumRate *= 1.2;
    
    estimatedPremium = vehicleValue * premiumRate;
  }

  const coverageGap = Math.max(0, recommendedCoverage - existingCoverage);
  const premiumAsPercentOfIncome = (estimatedPremium / annualIncome) * 100;
  
  return {
    recommendedCoverage,
    coverageGap,
    estimatedPremium,
    premiumAsPercentOfIncome,
    existingCoverage,
    totalProtection: existingCoverage + coverageGap,
    monthlyPremium: estimatedPremium / 12,
    premiumPerLakh: (estimatedPremium / recommendedCoverage) * 100000
  };
}

export default function InsuranceCalculatorPage() {
  const [values, setValues] = useState<InsuranceInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const insuranceResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Validate inputs
      if (values.age < 18 || values.age > 80) {
        throw new Error('Age must be between 18 and 80 years');
      }

      if (values.annualIncome <= 0) {
        throw new Error('Annual income must be greater than zero');
      }

      if (values.monthlyExpenses <= 0) {
        throw new Error('Monthly expenses must be greater than zero');
      }

      const calculation = calculateInsuranceNeeds(values);

      return calculation;
    } catch (err: any) {
      console.error('Insurance calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please check your inputs.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Insurance Type',
      name: 'insuranceType',
      type: 'select',
      options: [
        { value: 'life', label: 'Life Insurance' },
        { value: 'health', label: 'Health Insurance' },
        { value: 'vehicle', label: 'Vehicle Insurance' }
      ],
      required: true,
      tooltip: 'Type of insurance you want to calculate'
    },
    {
      label: 'Age',
      name: 'age',
      type: 'number',
      placeholder: '30',
      min: 18,
      max: 80,
      required: true,
      tooltip: 'Your current age'
    },
    {
      label: 'Annual Income',
      name: 'annualIncome',
      type: 'number',
      placeholder: '10,00,000',
      unit: currency.symbol,
      min: 100000,
      max: 100000000,
      required: true,
      tooltip: 'Your total annual income'
    },
    {
      label: 'Number of Dependents',
      name: 'dependents',
      type: 'number',
      placeholder: '2',
      min: 0,
      max: 10,
      required: true,
      tooltip: 'Number of people financially dependent on you'
    },
    {
      label: 'Existing Coverage',
      name: 'existingCoverage',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      min: 0,
      max: 100000000,
      tooltip: 'Current insurance coverage amount'
    },
    {
      label: 'Outstanding Loans',
      name: 'outstandingLoans',
      type: 'number',
      placeholder: '5,00,000',
      unit: currency.symbol,
      min: 0,
      max: 50000000,
      tooltip: 'Total outstanding loan amounts'
    },
    {
      label: 'Monthly Expenses',
      name: 'monthlyExpenses',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
      min: 10000,
      max: 1000000,
      required: true,
      tooltip: 'Average monthly household expenses'
    },
    {
      label: 'Years of Coverage Needed',
      name: 'yearsOfCoverage',
      type: 'number',
      placeholder: '20',
      min: 5,
      max: 50,
      unit: 'years',
      required: true,
      tooltip: 'Number of years you need coverage for'
    },
    {
      label: 'Expected Inflation Rate',
      name: 'inflationRate',
      type: 'percentage',
      placeholder: '6',
      min: 3,
      max: 15,
      step: 0.1,
      required: true,
      tooltip: 'Expected annual inflation rate'
    },
    {
      label: 'Gender',
      name: 'gender',
      type: 'select',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ],
      required: true,
      tooltip: 'Gender affects premium calculations'
    },
    {
      label: 'Smoking Status',
      name: 'smokingStatus',
      type: 'select',
      options: [
        { value: 'no', label: 'Non-Smoker' },
        { value: 'yes', label: 'Smoker' }
      ],
      required: true,
      tooltip: 'Smoking significantly affects insurance premiums'
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
      required: true,
      tooltip: 'Pre-existing health conditions affect premiums'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!insuranceResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Recommended Coverage',
        value: insuranceResults.recommendedCoverage,
        type: 'currency',
        highlight: true,
        tooltip: 'Recommended insurance coverage amount based on your profile'
      },
      {
        label: 'Coverage Gap',
        value: insuranceResults.coverageGap,
        type: 'currency',
        tooltip: 'Additional coverage needed beyond existing coverage'
      },
      {
        label: 'Estimated Annual Premium',
        value: insuranceResults.estimatedPremium,
        type: 'currency',
        tooltip: 'Estimated annual premium for recommended coverage'
      },
      {
        label: 'Monthly Premium',
        value: insuranceResults.monthlyPremium,
        type: 'currency',
        tooltip: 'Estimated monthly premium amount'
      },
      {
        label: 'Premium as % of Income',
        value: insuranceResults.premiumAsPercentOfIncome,
        type: 'percentage',
        tooltip: 'Premium as percentage of annual income'
      },
      {
        label: 'Premium per Lakh Coverage',
        value: insuranceResults.premiumPerLakh,
        type: 'currency',
        tooltip: 'Premium cost per lakh of coverage'
      }
    ];

    if (values.existingCoverage > 0) {
      calculatorResults.push({
        label: 'Total Protection',
        value: insuranceResults.totalProtection,
        type: 'currency',
        tooltip: 'Total coverage including existing and recommended'
      });
    }

    return calculatorResults;
  }, [insuranceResults, values.existingCoverage, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 700);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Insurance Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Review your insurance needs regularly.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare quotes from multiple providers.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Understand policy terms and conditions before buying.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Insurance Calculator"
      description="Calculate your insurance needs for life, health, and vehicle insurance. Get personalized coverage recommendations and premium estimates."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Insurance Details"
        description="Enter your insurance details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={insuranceResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}
