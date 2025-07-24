import React from "react";

export function generateMetadata({ params }: { params: any }) {
  const { type, location } = params;
  const title = `${capitalize(type)} Calculator for ${formatLocation(location)} | WealthWiseGrow`;
  const description = `Calculate your ${type} in ${formatLocation(location)}. Get instant results, local rates, and actionable insights for your financial planning.`;
  return {
    title,
    description,
    keywords: [
      `${type} calculator`,
      `${type} calculator ${location}`,
      `${type} rates ${location}`,
      `finance calculator ${location}`,
      `personal finance ${location}`,
    ],
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function formatLocation(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}

export default function Page({ params }: { params: any }) {
  const { type, location } = params;
  return (
    <section className="max-w-2xl mx-auto p-10 mt-12 bg-white rounded-3xl shadow-xl border border-gray-200 font-sans">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-800 tracking-tight">
        {capitalize(type)} Calculator
        <span className="block text-lg font-medium text-gray-400 mt-1">for {formatLocation(location)}</span>
      </h1>
      <p className="mb-8 text-gray-500 text-base leading-relaxed">
        Easily calculate your <strong className="text-gray-700 font-semibold">{type}</strong> in <strong className="text-gray-700 font-semibold">{formatLocation(location)}</strong>.<br />
        Get local rates, instant results, and actionable insights for your financial planning.
      </p>
      <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 mb-8 shadow-sm">
        <span className="text-gray-600 font-medium">[Calculator for {capitalize(type)} in {formatLocation(location)} will appear here]</span>
      </div>
      <p className="text-xs text-gray-400 text-center">Location-based calculators help users find relevant financial information for their area.<br />More features coming soon!</p>
    </section>
  );
} 