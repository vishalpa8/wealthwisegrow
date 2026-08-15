import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/templates/calculator-layout";

export const metadata: Metadata = {
  title: "Calculation Methodology | WealthWiseGrow",
  description: "Understand the math and logic behind our financial calculators.",
  alternates: {
    canonical: "/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <CalculatorLayout
      title="Calculation Methodology"
      description="Transparency in how we calculate your financial projections."
    >
      <div className="prose prose-neutral max-w-none card p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Approach</h2>
          <p className="text-neutral-600 mb-4">
            Transparency is a core value at WealthWiseGrow. We want you to understand exactly how we arrive at the numbers shown in our calculators. Our methodologies are based on standard financial mathematics and Indian regulatory rules.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Standard Formulas Used</h2>
          <div className="space-y-6 mt-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="font-semibold text-neutral-900 mb-2">EMI Calculation (Reducing Balance)</h3>
              <p className="text-sm font-mono text-neutral-700">EMI = [P x R x (1+R)^N] / [(1+R)^N-1]</p>
              <p className="text-xs text-neutral-500 mt-2">Where P = Principal, R = Monthly Interest Rate, N = Number of Months.</p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="font-semibold text-neutral-900 mb-2">Compound Interest</h3>
              <p className="text-sm font-mono text-neutral-700">A = P(1 + r/n)^(nt)</p>
              <p className="text-xs text-neutral-500 mt-2">Used for FD, RD, and generic investment projections.</p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="font-semibold text-neutral-900 mb-2">SIP (Systematic Investment Plan)</h3>
              <p className="text-sm font-mono text-neutral-700">FV = P x [((1 + r)^n - 1) / r] x (1 + r)</p>
              <p className="text-xs text-neutral-500 mt-2">Calculates the future value of monthly mutual fund investments.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Tax Calculation Logic</h2>
          <p className="text-neutral-600 mb-4">
            Our tax calculators (Income Tax, GST, HRA) use the latest slabs and rules defined by the Government of India. We update these annually following the Union Budget.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-600">
            <li><strong>Income Tax:</strong> Supports both Old and New Tax Regimes.</li>
            <li><strong>GST:</strong> Applies standard GST rates (5%, 12%, 18%, 28%) to net or gross amounts.</li>
            <li><strong>HRA:</strong> Uses the standard three-rule comparison for exemption calculation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Data Privacy in Calculations</h2>
          <p className="text-neutral-600">
            All primary calculations are performed client-side (in your browser). We do not send your personal financial inputs to our servers, ensuring your data remains private and secure.
          </p>
        </section>
      </div>
    </CalculatorLayout>
  );
}
