import type { Metadata } from "next";
import { LoanCalculator } from "@/components/calculators/loan-calculator";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";
import { breadcrumbStructuredData, faqStructuredData } from "@/lib/seo/structured-data";

export const metadata: Metadata = generateCalculatorMetadata(
  "loan",
  "Loan Calculator | WealthWiseGrow",
  "Calculate EMI, total interest, and payment schedule for personal, home, car, and business loans. Plan your debt payoff with our comprehensive loan calculator."
);

const breadcrumbs = breadcrumbStructuredData([
  { name: "Home", url: "https://wealthwisegrow.com" },
  { name: "Calculators", url: "https://wealthwisegrow.com/calculators" },
  { name: "Loan Calculator", url: "https://wealthwisegrow.com/calculators/loan" },
]);

const faqs = faqStructuredData([
  {
    question: "What is EMI and how is it calculated?",
    answer: "EMI stands for Equated Monthly Installment. It is a fixed amount paid by a borrower to a lender at a specified date each month. It consists of both principal and interest components, calculated using the reducing balance method."
  },
  {
    question: "How can I reduce my total loan interest?",
    answer: "You can reduce interest by opting for a shorter loan tenure, making regular prepayments toward the principal, or transferring your loan to a lender offering a lower interest rate."
  },
  {
    question: "What is the difference between a fixed and floating interest rate?",
    answer: "A fixed rate remains the same throughout the loan tenure, providing certainty in EMIs. A floating rate changes based on market conditions (like RBI repo rate moves), which can cause your EMI or tenure to fluctuate."
  },
  {
    question: "Is it better to take a longer loan tenure?",
    answer: "A longer tenure reduces your monthly EMI, making it more affordable in the short term, but significantly increases the total interest you pay over the life of the loan."
  }
]);

export default function LoanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqs) }}
      />
      <LoanCalculator />
    </>
  );
}
