import React from "react";
import type { Metadata } from "next";

interface PageProps {
  params: { type: string; location: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const { type, location } = params;
  const title = `${capitalize(type)} Calculator for ${formatLocation(location)} | WealthWise Hub`;
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
  return str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProgrammaticCalculatorPage({ params }: PageProps) {
  const { type, location } = params;
  return (
    <section className="max-w-2xl mx-auto p-8 mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        {capitalize(type)} Calculator for {formatLocation(location)}
      </h1>
      <p className="mb-4 text-gray-600">
        This is a programmatic SEO page for the <strong>{type}</strong> calculator in <strong>{formatLocation(location)}</strong>.
        Get local rates, instant results, and actionable insights for your financial planning.
      </p>
      <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-100 mb-6">
        <span className="text-blue-700 font-semibold">[Calculator for {capitalize(type)} in {formatLocation(location)} will appear here]</span>
      </div>
      <p className="text-xs text-gray-500">Location-based calculators help users find relevant financial information for their area. More features coming soon!</p>
    </section>
  );
} 