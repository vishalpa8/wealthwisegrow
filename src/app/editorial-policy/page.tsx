import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/layout/calculator-layout";

export const metadata: Metadata = {
  title: "Editorial Policy | WealthWiseGrow",
  description: "Our standards for accuracy, independence, and transparency in financial content.",
  alternates: {
    canonical: "/editorial-policy",
  },
};

export default function EditorialPolicyPage() {
  return (
    <CalculatorLayout
      title="Editorial Policy"
      description="Commitment to quality and integrity in financial information."
    >
      <div className="prose prose-neutral max-w-none card p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Integrity and Independence</h2>
          <p className="text-neutral-600 mb-4">
            At WealthWiseGrow, our editorial mission is to provide accurate, unbiased, and helpful financial information. We maintain strict independence from any financial institutions or service providers. Our tools and guides are designed to help users make their own informed decisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Accuracy and Fact-Checking</h2>
          <p className="text-neutral-600 mb-4">
            Accuracy is our top priority, especially given the YMYL (Your Money Your Life) nature of our content. 
          </p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-600">
            <li><strong>Expert Sourcing:</strong> Our content is researched using official government sources (Income Tax Department, RBI, etc.) and reputable financial publications.</li>
            <li><strong>Regular Updates:</strong> We review our calculators and guides annually or whenever significant policy changes occur (e.g., Union Budget announcements).</li>
            <li><strong>Verification:</strong> Mathematical models used in our calculators are verified against standard financial formulas and cross-checked with multiple sources.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Disclosure</h2>
          <p className="text-neutral-600 mb-4">
            WealthWiseGrow is supported by advertising. However, our advertising relationships do not influence our editorial content, the results of our calculators, or our guides. We do not accept payment in exchange for positive reviews or biased results.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Editorial</h2>
          <p className="text-neutral-600">
            If you have questions about our editorial process or spot a potential error, please let us know via our <a href="/contact" className="text-primary-600 hover:underline">Contact Page</a>.
          </p>
        </section>
      </div>
    </CalculatorLayout>
  );
}
