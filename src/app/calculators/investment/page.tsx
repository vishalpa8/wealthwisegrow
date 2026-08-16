import React from 'react';
import type { Metadata } from "next";
import { InvestmentCalculatorPageContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";
import { breadcrumbStructuredData, faqStructuredData, calculatorStructuredData } from "@/lib/seo/structured-data";

export const metadata: Metadata = generateCalculatorMetadata(
  "investment",
  "Future Value Investment Growth Calculator",
  "Calculate the future value of your investments with compounding. Plan your financial goals, compare SIP vs lumpsum, and see how your wealth grows over time."
);

const breadcrumbs = breadcrumbStructuredData([
  { name: "Home", url: "https://wealthwisegrow.com" },
  { name: "Calculators", url: "https://wealthwisegrow.com/calculators" },
  { name: "Investment Calculator", url: "https://wealthwisegrow.com/calculators/investment" },
]);

const faqs = faqStructuredData([
  {
    question: "What is compound interest?",
    answer: "Compound interest is the interest on a loan or deposit calculated based on both the initial principal and the accumulated interest from previous periods. It is often described as 'interest on interest'."
  },
  {
    question: "How does the frequency of compounding affect my returns?",
    answer: "The more frequently interest is compounded (e.g., monthly vs. annually), the higher the final amount will be. This is because interest starts earning more interest sooner."
  },
  {
    question: "What is the Rule of 72?",
    answer: "The Rule of 72 is a quick way to estimate how long it will take to double your money. Divide 72 by your expected annual return rate. For example, at a 12% return, your money doubles in approximately 6 years."
  },
  {
    question: "Is a lumpsum or SIP better for long-term investing?",
    answer: "A lumpsum can be better if you have a large amount and the market is low, but an SIP (Systematic Investment Plan) is generally better for most people as it averages the cost of purchase and instills disciplined saving."
  }
]);

const softwareApp = calculatorStructuredData(
  "Investment Calculator | WealthWiseGrow",
  "Calculate the future value of your investments with compounding. Plan your financial goals, compare SIP vs lumpsum, and see how your wealth grows over time.",
  "https://wealthwisegrow.com/calculators/investment"
);

export default function InvestmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqs) }} />
      <InvestmentCalculatorPageContent />
    </>
  );
}
