"use client";
import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';

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
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
      min: 0,
      max: 100000000,
      tooltip: 'Current insurance coverage amount'
    },
    {
      label: 'Outstanding Loans',
      name: 'outstandingLoans',
      type: 'number',
      placeholder: '5,00,000',
      min: 0,
      max: 50000000,
      tooltip: 'Total outstanding loan amounts'
    },
    {
      label: 'Monthly Expenses',
      name: 'monthlyExpenses',
      type: 'number',
      placeholder: '50,000',
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

  const results = useMemo(() => {
    try {
      setError('');
      
      // Validate inputs
      if (values.age < 18 || values.age > 80) {
        setError('Age must be between 18 and 80 years');
        return [];
      }

      if (values.annualIncome <= 0) {
        setError('Annual income must be greater than zero');
        return [];
      }

      if (values.monthlyExpenses <= 0) {
        setError('Monthly expenses must be greater than zero');
        return [];
      }

      const calculation = calculateInsuranceNeeds(values);

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Recommended Coverage',
          value: calculation.recommendedCoverage,
          type: 'currency',
          highlight: true,
          tooltip: 'Recommended insurance coverage amount based on your profile'
        },
        {
          label: 'Coverage Gap',
          value: calculation.coverageGap,
          type: 'currency',
          tooltip: 'Additional coverage needed beyond existing coverage'
        },
        {
          label: 'Estimated Annual Premium',
          value: calculation.estimatedPremium,
          type: 'currency',
          tooltip: 'Estimated annual premium for recommended coverage'
        },
        {
          label: 'Monthly Premium',
          value: calculation.monthlyPremium,
          type: 'currency',
          tooltip: 'Estimated monthly premium amount'
        },
        {
          label: 'Premium as % of Income',
          value: calculation.premiumAsPercentOfIncome,
          type: 'percentage',
          tooltip: 'Premium as percentage of annual income'
        },
        {
          label: 'Premium per Lakh Coverage',
          value: calculation.premiumPerLakh,
          type: 'currency',
          tooltip: 'Premium cost per lakh of coverage'
        }
      ];

      if (values.existingCoverage > 0) {
        calculatorResults.push({
          label: 'Total Protection',
          value: calculation.totalProtection,
          type: 'currency',
          tooltip: 'Total coverage including existing and recommended'
        });
      }

      return calculatorResults;
    } catch (err) {
      console.error('Insurance calculation error:', err);
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      if ((name === 'age' || name === 'annualIncome' || name === 'monthlyExpenses') && numValue < 0) {
        setError(`${name} cannot be negative`);
        return;
      }

      setValues(prev => ({ ...prev, [name]: value }));
      if (error) setError('');
    } catch (err) {
      console.error('Input change error:', err);
      setError('Invalid input format');
    }
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="Insurance Calculator"
        description="Calculate your insurance needs for life, health, and vehicle insurance. Get personalized coverage recommendations and premium estimates."
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