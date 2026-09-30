import React from 'react';
import type { Metadata } from "next";
import { MortgageCalculatorPageContent } from "./page-content";

export const metadata: Metadata = {
  title: "Mortgage Calculator | WealthWiseGrow",
  description: "Estimate a mortgage payment in your selected currency, including optional property tax, insurance, and mortgage insurance.",
  keywords: [
    "mortgage calculator", 
    "home loan", 
    "monthly payment", 
    "interest rate", 
    "property tax", 
    "home insurance", 
    "mortgage insurance",
    "loan calculator",
    "home buying",
    "real estate",
    "amortization schedule"
  ],
  openGraph: {
    title: "Mortgage Calculator | WealthWiseGrow",
    description: "Estimate principal, interest, property tax, insurance, and optional mortgage-insurance costs.",
    type: "website",
    url: "/calculators/mortgage",
    siteName: "WealthWiseGrow",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mortgage Calculator | WealthWiseGrow",
    description: "Estimate mortgage principal, interest, taxes, insurance, and optional mortgage insurance.",
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
  "description": "Estimate a mortgage payment with optional property tax, insurance, and mortgage insurance.",
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
    "Include optional property taxes and insurance",
    "Include optional mortgage insurance",
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