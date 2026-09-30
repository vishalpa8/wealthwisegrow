import type { Metadata } from "next";
import { InvestmentCalculatorPageContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";
import { breadcrumbStructuredData, calculatorStructuredData } from "@/lib/seo/structured-data";

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
      <InvestmentCalculatorPageContent />
    </>
  );
}
