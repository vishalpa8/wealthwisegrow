import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/templates/calculator-layout";
import { siteConfig } from "@/lib/site";

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
            Google AdSense is disabled until the site is approved and configured with real ad units. When enabled, Google and its partners may use cookies or similar identifiers to provide and measure advertising.
          </p>
          <p className="text-neutral-600 mb-4">
            Learn <a href="https://policies.google.com/technologies/partner-sites" rel="noreferrer" target="_blank" className="text-primary-600 hover:underline">how Google uses information from partner sites</a> and manage personalization through <a href="https://adssettings.google.com/" rel="noreferrer" target="_blank" className="text-primary-600 hover:underline">Google Ads Settings</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Analytics</h2>
          <p className="text-neutral-600 mb-4">
            Google Analytics collects aggregate usage information such as pages visited, browser type, approximate location, and device category. Calculator inputs are not intentionally sent to Google Analytics.
          </p>
          <p className="text-neutral-600 mb-4">
            You can opt out of Google Analytics with the <a href="https://tools.google.com/dlpage/gaoptout" rel="noreferrer" target="_blank" className="text-primary-600 hover:underline">Google Analytics opt-out browser add-on</a>, or block cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact</h2>
          <p className="text-neutral-600">
            {siteConfig.contactEmail
              ? <>For privacy questions, email <a href={`mailto:${siteConfig.contactEmail}`} className="text-primary-600 hover:underline">{siteConfig.contactEmail}</a>.</>
              : "A public contact mailbox is being configured. This page will be updated as soon as it is available."}
          </p>
          <p className="text-sm text-neutral-500 mt-6">Last reviewed: September 30, 2026</p>
        </section>
      </div>
    </CalculatorLayout>
  );
}
