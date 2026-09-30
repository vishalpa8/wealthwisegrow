import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/templates/calculator-layout";
import { siteConfig } from "@/lib/site";

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
            WealthWiseGrow tests its calculators and reviews financial guides, but calculations and content can still contain errors or become outdated when laws and product rules change.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Reporting an Error</h2>
          <p className="text-neutral-600 mb-4">
            We value our users' input in maintaining the highest standards of accuracy. If you believe you have found an error in a calculation or a piece of content, please let us know immediately.
          </p>
          <p className="text-neutral-600 mb-4">
            {siteConfig.contactEmail
              ? <>You can report errors via our <a href="/contact" className="text-primary-600 hover:underline">Contact Page</a> or by emailing <a href={`mailto:${siteConfig.contactEmail}`} className="font-semibold text-primary-600 hover:underline">{siteConfig.contactEmail}</a>.</>
              : <>The public mailbox is being configured. Please check the <a href="/contact" className="text-primary-600 hover:underline">Contact Page</a> for its availability.</>}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Correction Process</h2>
          <p className="text-neutral-600 mb-4">
            When an error is reported or discovered:
          </p>
          <ol className="list-decimal pl-6 space-y-3 text-neutral-600">
            <li><strong>Verification:</strong> The report is checked against primary sources, formula references, and automated tests.</li>
            <li><strong>Fixing:</strong> Confirmed issues are prioritized by their potential impact and corrected as soon as practical.</li>
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
