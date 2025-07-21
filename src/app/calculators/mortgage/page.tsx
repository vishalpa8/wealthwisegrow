import React from 'react';
import { MortgageCalculator } from "@/components/calculators/mortgage-calculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mortgage Calculator | WealthWise Hub",
  description: "Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Get detailed payment breakdowns and loan summaries to make informed home buying decisions.",
  keywords: ["mortgage calculator", "home loan", "monthly payment", "interest rate", "property tax", "home insurance", "PMI"],
  openGraph: {
    title: "Mortgage Calculator | WealthWise Hub",
    description: "Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI.",
    type: "website",
  },
};

export default function MortgagePage() {
  return <MortgageCalculator />;
}