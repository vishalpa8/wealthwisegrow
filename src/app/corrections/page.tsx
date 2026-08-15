import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/templates/calculator-layout";

export const metadata: Metadata = {
  title: "Corrections Policy | WealthWiseGrow",
  description: "How we handle and correct errors in our calculators and content.",
  alternates: {
    canonical: "/corrections",
  },
};

export default function CorrectionsPage() {
  return (
    <CalculatorLayout
      title="Corrections Policy"
      description="Ensuring the accuracy and reliability of our information."
    >
      <div className="prose prose-neutral max-w-none card p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Commitment to Accuracy</h2>
          <p className="text-neutral-600 mb-4">
            WealthWiseGrow strives for 100% accuracy in all our calculators and financial guides. However, given the complexity of financial rules and the potential for human error, mistakes can occasionally occur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Reporting an Error</h2>
          <p className="text-neutral-600 mb-4">
            We value our users' input in maintaining the highest standards of accuracy. If you believe you have found an error in a calculation or a piece of content, please let us know immediately.
          </p>
          <p className="text-neutral-600 mb-4">
            You can report errors via our <a href="/contact" className="text-primary-600 hover:underline">Contact Page</a> or by emailing <span className="font-semibold">corrections@wealthwisegrow.com</span>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Correction Process</h2>
          <p className="text-neutral-600 mb-4">
            When an error is reported or discovered:
          </p>
          <ol className="list-decimal pl-6 space-y-3 text-neutral-600">
            <li><strong>Verification:</strong> Our editorial and technical team will immediately investigate and verify the report against primary sources and mathematical models.</li>
            <li><strong>Fixing:</strong> If an error is confirmed, we aim to fix it within 24-48 hours.</li>
            <li><strong>Transparency:</strong> For significant errors in guides or calculators that may have impacted user decisions, we will include a note about the correction on the relevant page.</li>
            <li><strong>Audit:</strong> We periodically audit our entire toolset to ensure small errors don't go unnoticed.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Update Logs</h2>
          <p className="text-neutral-600">
            Major updates and corrections to our core calculation logic are logged internally to maintain a history of tool evolution and accuracy improvements.
          </p>
        </section>
      </div>
    </CalculatorLayout>
  );
}
