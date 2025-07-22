'use client';

import React, { useState, useMemo } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { secureCalculation } from '@/lib/security';

const initialValues = {
  basicSalary: 50000,
  hraReceived: 20000,
  rentPaid: 15000,
  cityType: 'metro',
  monthsRented: 12
};

function calculateHRAExemption(inputs: typeof initialValues) {
  const {
    basicSalary,
    hraReceived,
    rentPaid,
    cityType,
    monthsRented
  } = inputs;

  // Annual calculations
  const annualBasic = basicSalary * 12;
  const annualHRA = hraReceived * 12;
  const annualRent = rentPaid * monthsRented;

  // Calculate exemption based on three conditions
  const actualHRA = annualHRA;
  const rentMinusBasic = annualRent - (annualBasic * 0.1); // Rent paid minus 10% of basic
  const basicPercent = annualBasic * (cityType === 'metro' ? 0.5 : 0.4); // 50% for metro, 40% for non-metro

  // Exemption is minimum of the three
  const exemption = Math.min(
    actualHRA,
    rentMinusBasic > 0 ? rentMinusBasic : 0,
    basicPercent
  );

  // Calculate taxable HRA
  const taxableHRA = annualHRA - exemption;

  return {
    annualBasic,
    annualHRA,
    annualRent,
    exemption,
    taxableHRA,
    basicPercent,
    rentMinusBasic,
    actualHRA,
    monthlyExemption: exemption / 12,
    monthlyTaxableHRA: taxableHRA / 12
  };
}

export default function HRACalculatorPage() {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Basic Salary (Monthly)',
      name: 'basicSalary',
      type: 'number',
      placeholder: '50,000',
      min: 1000,
      max: 1000000,
      required: true,
      tooltip: 'Your monthly basic salary'
    },
    {
      label: 'HRA Received (Monthly)',
      name: 'hraReceived',
      type: 'number',
      placeholder: '20,000',
      min: 0,
      max: 500000,
      required: true,
      tooltip: 'Monthly HRA received from employer'
    },
    {
      label: 'Rent Paid (Monthly)',
      name: 'rentPaid',
      type: 'number',
      placeholder: '15,000',
      min: 0,
      max: 500000,
      required: true,
      tooltip: 'Monthly rent paid for accommodation'
    },
    {
      label: 'City Type',
      name: 'cityType',
      type: 'select',
      options: [
        { value: 'metro', label: 'Metro City (50%)' },
        { value: 'non-metro', label: 'Non-Metro City (40%)' }
      ],
      required: true,
      tooltip: 'Metro cities: Delhi, Mumbai, Kolkata, Chennai'
    },
    {
      label: 'Months Rented',
      name: 'monthsRented',
      type: 'number',
      placeholder: '12',
      min: 1,
      max: 12,
      required: true,
      tooltip: 'Number of months rent paid in the financial year'
    }
  ];

  const results = useMemo(() => {
    try {
      setError('');

      // Validate inputs
      if (values.rentPaid > values.basicSalary) {
        setError('Rent paid seems unusually high compared to basic salary');
        return [];
      }

      const secureResult = secureCalculation(
        values,
        (validatedInputs) => calculateHRAExemption(validatedInputs),
        {
          requiredFields: ['basicSalary', 'hraReceived', 'rentPaid', 'cityType', 'monthsRented'],
          numericFields: ['basicSalary', 'hraReceived', 'rentPaid', 'monthsRented'],
          minValues: {
            basicSalary: 1000,
            hraReceived: 0,
            rentPaid: 0,
            monthsRented: 1
          },
          maxValues: {
            basicSalary: 1000000,
            hraReceived: 500000,
            rentPaid: 500000,
            monthsRented: 12
          }
        }
      );

      const result = secureResult.result;

      if (!result) {
        setError('Calculation failed. Please verify your inputs.');
        return [];
      }

      const calculatorResults: CalculatorResult[] = [
        {
          label: 'Annual HRA Exemption',
          value: result.exemption,
          type: 'currency',
          highlight: true,
          tooltip: 'Total HRA exemption for the year'
        },
        {
          label: 'Monthly HRA Exemption',
          value: result.monthlyExemption,
          type: 'currency',
          tooltip: 'Monthly HRA exemption amount'
        },
        {
          label: 'Annual Taxable HRA',
          value: result.taxableHRA,
          type: 'currency',
          tooltip: 'HRA amount that is taxable'
        },
        {
          label: 'Monthly Taxable HRA',
          value: result.monthlyTaxableHRA,
          type: 'currency',
          tooltip: 'Monthly taxable HRA amount'
        }
      ];

      // Add details of calculation
      calculatorResults.push(
        {
          label: 'Actual HRA Received',
          value: result.actualHRA,
          type: 'currency',
          tooltip: 'Total HRA received for the year'
        },
        {
          label: `${values.cityType === 'metro' ? '50%' : '40%'} of Basic`,
          value: result.basicPercent,
          type: 'currency',
          tooltip: `${values.cityType === 'metro' ? '50%' : '40%'} of annual basic salary`
        },
        {
          label: 'Rent - 10% of Basic',
          value: result.rentMinusBasic,
          type: 'currency',
          tooltip: 'Rent paid minus 10% of basic salary'
        }
      );

      return calculatorResults;
    } catch (err) {
      console.error('HRA calculation error:', err);
      setError('Calculation failed. Please check your inputs.');
      return [];
    }
  }, [values]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnhancedCalculatorForm
        title="HRA Exemption Calculator"
        description="Calculate your House Rent Allowance (HRA) exemption and determine the taxable portion of your HRA."
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
