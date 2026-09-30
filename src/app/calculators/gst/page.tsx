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
  supplyType: 'intra-state',
};

export default function GSTCalculatorPage() {
  const { currency } = useCurrency();

  const fields: EnhancedCalculatorField[] = [
    { label: 'Amount', name: 'amount', type: 'number', placeholder: '10,000', unit: currency.symbol, tooltip: 'Enter the base amount (exclusive) or total amount (inclusive)' },
    { label: 'GST Rate', name: 'gstRate', type: 'percentage', placeholder: '18', step: 0.1, tooltip: 'Enter the GST rate applicable to the specific goods or services.' },
    { label: 'Amount Type', name: 'type', type: 'select', options: [
      { value: 'exclusive', label: 'GST Exclusive (Add GST)' },
      { value: 'inclusive', label: 'GST Inclusive (Extract GST)' }
    ], tooltip: 'Whether the amount includes GST or not' },
    { label: 'Supply Type', name: 'supplyType', type: 'select', options: [
      { value: 'intra-state', label: 'Intra-state (CGST + SGST)' },
      { value: 'inter-state', label: 'Inter-state (IGST)' }
    ], tooltip: 'Choose whether the supplier and place of supply are in the same state.' }
  ];

  const calculate = (values: GSTInputs) => {
    const calculation = calculateGST(values);

    const results: CalculatorResult[] = [
      { label: 'Total Amount', value: calculation.totalAmount, type: 'currency', highlight: true, tooltip: 'Total amount including GST' },
      { label: 'Original Amount', value: calculation.originalAmount, type: 'currency', tooltip: 'Amount before GST' },
      { label: 'GST Amount', value: calculation.gstAmount, type: 'currency', tooltip: 'Total GST amount' }
    ];
    if (values.supplyType === 'inter-state') {
      results.push({ label: 'IGST', value: calculation.igst, type: 'currency', tooltip: 'Integrated GST for an inter-state supply' });
    } else {
      results.push(
        { label: 'CGST', value: calculation.cgst, type: 'currency', tooltip: 'Central GST for an intra-state supply' },
        { label: 'SGST', value: calculation.sgst, type: 'currency', tooltip: 'State GST for an intra-state supply' }
      );
    }

    return { results };
  };

  const seoContent = (
      <SEOContent title="GST Tips"
      description="Calculate Indian GST-inclusive or GST-exclusive prices and split tax correctly as CGST plus SGST or IGST."
      sections={[
        { title: "Know the Rates", content: "Understand the different GST rates for goods and services." },
        { title: "File on Time", content: "File your GST returns on time to avoid penalties." },
        { title: "Keep Records", content: "Maintain proper records for GST compliance." }
      ]}
    />
  );

  return (
    <BaseCalculatorTemplate<GSTInputs>
      title="Free GST Inclusive & Exclusive Price Calculator"
      description="Calculate GST amount, CGST, SGST, and IGST for your business transactions."
      initialValues={initialValues}
      fields={fields}
      calculate={calculate}
      seoContent={seoContent}
    />
  );
}
