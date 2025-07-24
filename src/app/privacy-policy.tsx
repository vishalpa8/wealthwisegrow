import { useState, useEffect } from "react";

export default function PrivacyPolicyPage() {
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(new Date().toLocaleDateString());
  }, []);
  return (
    <section className="max-w-3xl mx-auto p-8 mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Privacy Policy</h1>
      <p className="mb-4 text-gray-700">
        <strong>WealthWiseGrow</strong> is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">1. Data Collection & Usage</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>We do <strong>not</strong> require user registration or collect personal information for calculator use.</li>
        <li>Calculation history is stored locally in your browser using IndexedDB and is never sent to our servers.</li>
        <li>We use Google AdSense to display ads. AdSense may use cookies or device identifiers to personalize ads.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">2. Google AdSense Disclosure</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.</li>
        <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</li>
        <li>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">3. Analytics</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>We may use Google Analytics or similar tools to understand aggregate usage patterns. No personally identifiable information is collected.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">4. Your Choices</h2>
      <ul className="list-disc ml-6 mb-4 text-gray-700">
        <li>You can clear your calculation history at any time using the &quot;Clear All&quot; button in the history section.</li>
        <li>You can manage ad personalization and cookie settings via your browser or Google Ads Settings.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">5. Contact</h2>
      <p className="mb-2 text-gray-700">For questions or concerns, please contact us at <a href="mailto:contact@wealthwisegrow.com" className="text-blue-600 underline">contact@wealthwisegrow.com</a>.</p>
      <p className="text-xs text-gray-500 mt-8">Last updated: {date}</p>
    </section>
  );
} 