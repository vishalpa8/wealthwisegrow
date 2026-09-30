import type { Metadata } from "next";
import { RetirementCalculatorContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";
import { breadcrumbStructuredData, calculatorStructuredData } from "@/lib/seo/structured-data";

export const metadata: Metadata = generateCalculatorMetadata(
  "retirement",
  "Retirement Corpus & Pension Planning Calculator",
  "Plan for your future with our free retirement calculator. Estimate your savings at retirement, monthly contributions, and see if you're on track to meet your retirement goals."
);

const breadcrumbs = breadcrumbStructuredData([
  { name: "Home", url: "https://wealthwisegrow.com" },
  { name: "Calculators", url: "https://wealthwisegrow.com/calculators" },
  { name: "Retirement Calculator", url: "https://wealthwisegrow.com/calculators/retirement" },
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
      <RetirementCalculatorContent />
    </>
  );
}
