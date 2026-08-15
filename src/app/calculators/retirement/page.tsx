import type { Metadata } from "next";
import { RetirementCalculatorContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";
import { breadcrumbStructuredData, faqStructuredData, calculatorStructuredData } from "@/lib/seo/structured-data";

export const metadata: Metadata = generateCalculatorMetadata(
  "retirement",
  "Retirement Calculator | WealthWiseGrow",
  "Plan for your future with our free retirement calculator. Estimate your savings at retirement, monthly contributions, and see if you're on track to meet your retirement goals."
);

const breadcrumbs = breadcrumbStructuredData([
  { name: "Home", url: "https://wealthwisegrow.com" },
  { name: "Calculators", url: "https://wealthwisegrow.com/calculators" },
  { name: "Retirement Calculator", url: "https://wealthwisegrow.com/calculators/retirement" },
]);

const faqs = faqStructuredData([
  {
    question: "How much money do I need to retire comfortably in India?",
    answer: "The amount depends on your lifestyle, but a general rule is to aim for a corpus that is 25-30 times your annual expenses. For example, if your annual expenses are ₹12 lakhs, you might need ₹3-3.6 crores."
  },
  {
    question: "What is the best age to start retirement planning?",
    answer: "The best age is as early as possible. Starting in your 20s allows your investments more time to grow through the power of compounding, significantly reducing the monthly savings required compared to starting in your 40s."
  },
  {
    question: "How does inflation affect my retirement savings?",
    answer: "Inflation reduces the purchasing power of your money over time. A monthly expense of ₹50,000 today could cost over ₹1.5 lakhs in 20 years at a 5% inflation rate. Your retirement plan must account for this by targeting a higher corpus."
  },
  {
    question: "What is the 4% rule in retirement planning?",
    answer: "The 4% rule is a guideline that suggests you can safely withdraw 4% of your total retirement savings in the first year and adjust for inflation thereafter, with a high probability that your money will last at least 30 years."
  }
]);


const softwareApp = calculatorStructuredData(
  "Retirement Calculator | WealthWiseGrow",
  "Plan for your future with our free retirement calculator. Estimate your savings at retirement, monthly contributions, and see if you're on track to meet your retirement goals.",
  "https://wealthwisegrow.com/calculators/retirement"
);

export default function RetirementPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqs) }}
      />
      <RetirementCalculatorContent />
    </>
  );
}
