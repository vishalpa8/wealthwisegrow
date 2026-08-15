"use client";
import { SEOContent } from "@/components/molecules/seo-content";

import { BaseCalculatorTemplate } from '@/components/templates/base-calculator';
import { EnhancedCalculatorField, CalculatorResult } from '@/components/organisms/enhanced-calculator-form';
import { useCurrency } from "@/contexts/currency-context";
import { calculateGST, GSTInputs } from '@/lib/calculations/tax';

const initialValues: GSTInputs = {
  amount: 10000,
  gstRate: 18,
  type: 'exclusive',
};

export default function GSTCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Amount', name: 'amount', type: 'number', placeholder: '10,000', unit: currency.symbol, tooltip: 'Enter the base amount (exclusive) or total amount (inclusive)' },
    { label: 'GST Rate', name: 'gstRate', type: 'percentage', placeholder: '18', step: 0.1, tooltip: 'GST rate applicable (0%, 5%, 12%, 18%, 28%)' },
    { label: 'Amount Type', name: 'type', type: 'select', options: [
      { value: 'exclusive', label: 'GST Exclusive (Add GST)' },
      { value: 'inclusive', label: 'GST Inclusive (Extract GST)' }
    ], tooltip: 'Whether the amount includes GST or not' }
  ];

  const calculate = (values: GSTInputs) => {
    const calculation = calculateGST(values);

    const results: CalculatorResult[] = [
      { label: 'Total Amount', value: calculation.totalAmount, type: 'currency', highlight: true, tooltip: 'Total amount including GST' },
      { label: 'Original Amount', value: calculation.originalAmount, type: 'currency', tooltip: 'Amount before GST' },
      { label: 'GST Amount', value: calculation.gstAmount, type: 'currency', tooltip: 'Total GST amount' },
      { label: 'CGST', value: calculation.cgst, type: 'currency', tooltip: 'Central GST (for intra-state transactions)' },
      { label: 'SGST', value: calculation.sgst, type: 'currency', tooltip: 'State GST (for intra-state transactions)' },
      { label: 'IGST', value: calculation.igst, type: 'currency', tooltip: 'Integrated GST (for inter-state transactions)' }
    ];

    return { results };
  };

  const seoContent = (
      <SEOContent title="GST Tips"
      description="Calculate GST amount, CGST, SGST, and IGST for your business transactions."
      sections={[
        { title: "Know the Rates", content: "Understand the different GST rates for goods and services." },
        { title: "File on Time", content: "File your GST returns on time to avoid penalties." },
        { title: "Keep Records", content: "Maintain proper records for GST compliance." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<GSTInputs>
      title="GST Calculator"
      description="Calculate GST amount, CGST, SGST, and IGST for your business transactions."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      seoContent={seoContent}
    />
  );
}
