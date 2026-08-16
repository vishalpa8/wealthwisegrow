"use client";

import { useMemo } from "react";
import { BaseCalculatorTemplate } from "@/components/templates/base-calculator";
import { EnhancedCalculatorField, CalculatorResult } from "@/components/organisms/enhanced-calculator-form";
import { useCurrency } from "@/contexts/currency-context";
import { parseRobustNumber } from "@/lib/utils/number";

const initialValues = {
  basicSalary: 50000,
  hraReceived: 20000,
  rentPaid: 15000,
  cityType: 'metro',
  monthsRented: 12
};

interface HRAInputs {
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  cityType: string;
  monthsRented: number;
}

export default function HRACalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = useMemo(() => [
    {
      label: 'Basic Salary (Monthly)',
      name: 'basicSalary',
      type: 'number',
      placeholder: '50,000',
      unit: currency.symbol,
    },
    {
      label: 'HRA Received (Monthly)',
      name: 'hraReceived',
      type: 'number',
      placeholder: '20,000',
      unit: currency.symbol,
    },
    {
      label: 'Rent Paid (Monthly)',
      name: 'rentPaid',
      type: 'number',
      placeholder: '15,000',
      unit: currency.symbol,
    },
    {
      label: 'City Type',
      name: 'cityType',
      type: 'select',
      options: [
        { value: 'metro', label: 'Metro City (50%)' },
        { value: 'non-metro', label: 'Non-Metro City (40%)' }
      ],
    },
    {
      label: 'Months Rented',
      name: 'monthsRented',
      type: 'number',
      placeholder: '12',
    }
  ], [currency.symbol]);

  const calculate = (inputs: HRAInputs) => {
    const basicSalary = Math.abs(parseRobustNumber(inputs.basicSalary)) || 1000;
    const hraReceived = Math.abs(parseRobustNumber(inputs.hraReceived)) || 0;
    const rentPaid = Math.abs(parseRobustNumber(inputs.rentPaid)) || 0;
    const monthsRented = Math.max(1, Math.min(12, Math.abs(parseRobustNumber(inputs.monthsRented)) || 12));
    const cityType = inputs.cityType || 'metro';

    const annualBasic = basicSalary * 12;
    const annualHRA = hraReceived * 12;
    const annualRent = rentPaid * monthsRented;

    const actualHRA = annualHRA;
    const rentMinusBasic = annualRent - (annualBasic * 0.1);
    const basicPercent = annualBasic * (cityType === 'metro' ? 0.5 : 0.4);

    const exemption = Math.min(
      actualHRA,
      rentMinusBasic > 0 ? rentMinusBasic : 0,
      basicPercent
    );

    const taxableHRA = annualHRA - exemption;

    const results: CalculatorResult[] = [
      {
        label: 'Annual HRA Exemption',
        value: exemption,
        type: 'currency',
        highlight: true,
      },
      {
        label: 'Monthly HRA Exemption',
        value: exemption / 12,
        type: 'currency',
      },
      {
        label: 'Annual Taxable HRA',
        value: taxableHRA,
        type: 'currency',
      },
      {
        label: 'Monthly Taxable HRA',
        value: taxableHRA / 12,
        type: 'currency',
      },
      {
        label: 'Actual HRA Received',
        value: actualHRA,
        type: 'currency',
      },
      {
        label: `${cityType === 'metro' ? '50%' : '40%'} of Basic`,
        value: basicPercent,
        type: 'currency',
      },
      {
        label: 'Rent - 10% of Basic',
        value: rentMinusBasic,
        type: 'currency',
      }
    ];

    return { results };
  };

  return (
    <BaseCalculatorTemplate<HRAInputs>
      title="Income Tax HRA Exemption Calculator"
      description="Calculate your House Rent Allowance (HRA) exemption and determine the taxable portion of your HRA."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
    />
  );
}
