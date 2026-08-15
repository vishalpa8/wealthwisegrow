import React from 'react';
import type { Metadata } from "next";
import { MortgageCalculatorPageContent } from "./page-content";

export const metadata: Metadata = {
  title: "Mortgage Calculator | WealthWiseGrow",
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
    title: "Mortgage Calculator | WealthWiseGrow",
    description: "Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Get detailed payment breakdowns and amortization schedules.",
    type: "website",
    url: "/calculators/mortgage",
    siteName: "WealthWiseGrow",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mortgage Calculator | WealthWiseGrow",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Mortgage Calculator",
  "description": "Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "url": "https://wealthwisegrow.com/calculators/mortgage",
  "featureList": [
    "Calculate monthly mortgage payments",
    "Include property taxes and insurance",
    "Calculate PMI (Private Mortgage Insurance)",
    "Generate amortization schedule",
    "Compare loan scenarios"
  ]
};

export default function MortgagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MortgageCalculatorPageContent />
    </>
  );
}