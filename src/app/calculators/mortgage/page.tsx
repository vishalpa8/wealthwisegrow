import React from 'react';
import { MortgageCalculator } from "@/components/calculators/mortgage-calculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mortgage Calculator | WealthWise Hub",
  description: "Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Get detailed payment breakdowns and loan summaries to make informed home buying decisions.",
  keywords: [
    "mortgage calculator", 
    "home loan", 
    "monthly payment", 
    "interest rate", 
    "property tax", 
    "home insurance", 
    "PMI",
    "loan calculator",
    "home buying",
    "real estate",
    "amortization schedule"
  ],
  openGraph: {
    title: "Mortgage Calculator | WealthWise Hub",
    description: "Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Get detailed payment breakdowns and amortization schedules.",
    type: "website",
    url: "/calculators/mortgage",
    siteName: "WealthWise Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mortgage Calculator | WealthWise Hub",
    description: "Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI.",
  },
  alternates: {
    canonical: "/calculators/mortgage",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function MortgagePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Mortgage Calculator",
            "description": "Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI.",
            "url": "https://wealthwisehub.com/calculators/mortgage",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Monthly payment calculation",
              "Amortization schedule",
              "Interest vs principal breakdown",
              "PMI calculation",
              "Property tax and insurance",
              "Loan-to-value ratio",
              "Payment breakdown analysis"
            ]
          })
        }}
      />
      <MortgageCalculator />
    </>
  );
}