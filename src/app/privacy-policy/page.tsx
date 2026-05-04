import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/layout/calculator-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | WealthWiseGrow",
  description: "Learn how WealthWiseGrow protects calculator privacy, local browser storage, cookies, analytics, and advertising disclosures.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <CalculatorLayout
      title="Privacy Policy"
      description="How WealthWiseGrow protects your privacy while you use our financial calculators and guides."
    >
      <div className="prose prose-neutral max-w-none card p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Privacy-first calculator use</h2>
          <p className="text-neutral-600 mb-4">
            WealthWiseGrow does not require registration to use calculators. Most calculation inputs are processed in your browser and are not sent to our servers. If a calculator stores history, that information is saved locally on your device so you can clear it from your browser at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Information we may collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-neutral-600">
            <li>Basic technical data such as browser type, device type, pages visited, and approximate usage patterns.</li>
            <li>Messages you voluntarily send through contact or feedback forms.</li>
            <li>Cookie or advertising identifiers when advertising or analytics services are enabled.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Advertising and cookies</h2>
          <p className="text-neutral-600 mb-4">
            WealthWiseGrow may use Google AdSense or similar advertising services. Third-party vendors, including Google, may use cookies to serve ads based on visits to this and other websites. Users can manage ad personalization through Google Ads Settings or their browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Analytics</h2>
          <p className="text-neutral-600 mb-4">
            We may use privacy-conscious analytics to understand aggregate usage, improve calculator accuracy, and prioritize new guides. We do not use analytics to collect sensitive personal financial inputs from calculators.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact</h2>
          <p className="text-neutral-600">
            For privacy questions, email <a href="mailto:support@wealthwisegrow.com" className="text-primary-600 hover:underline">support@wealthwisegrow.com</a>.
          </p>
          <p className="text-sm text-neutral-500 mt-6">Last reviewed: May 4, 2026</p>
        </section>
      </div>
    </CalculatorLayout>
  );
}
