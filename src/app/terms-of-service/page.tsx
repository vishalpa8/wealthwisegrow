import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/templates/calculator-layout";

export const metadata: Metadata = {
  title: "Terms of Service | WealthWiseGrow",
  description: "Terms for using WealthWiseGrow financial calculators, guides, and educational planning tools.",
  alternates: {
    canonical: "/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  return (
    <CalculatorLayout
      title="Terms of Service"
      description="The terms that apply when you use WealthWiseGrow calculators, guides, and planning resources."
    >
      <div className="prose prose-neutral max-w-none card p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Educational use</h2>
          <p className="text-neutral-600 mb-4">
            WealthWiseGrow provides calculators and guides for general education and planning. Results are estimates based on the information you enter and the assumptions described on each page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">No professional advice</h2>
          <p className="text-neutral-600 mb-4">
            Content on WealthWiseGrow is not financial, investment, tax, legal, insurance, or accounting advice. Before making decisions that affect your money, verify details with official sources, product documents, or a qualified professional.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Accuracy and availability</h2>
          <p className="text-neutral-600 mb-4">
            We work to keep formulas, assumptions, and content accurate, but we do not guarantee that every calculator will fit every personal situation. Rules, tax slabs, interest rates, and product terms can change.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact</h2>
          <p className="text-neutral-600">
            Questions about these terms can be sent to <a href="mailto:support@wealthwisegrow.com" className="text-primary-600 hover:underline">support@wealthwisegrow.com</a>.
          </p>
          <p className="text-sm text-neutral-500 mt-6">Last reviewed: May 4, 2026</p>
        </section>
      </div>
    </CalculatorLayout>
  );
}
