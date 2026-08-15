import type { Metadata } from "next";
import { BusinessLoanContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateCalculatorMetadata(
  "business-loan",
  "Business Loan Calculator",
  "Calculate EMI, eligibility, and total cost for various business loan types. Includes risk assessment and tax benefit analysis."
);

export default function BusinessLoanPage() {
  return <BusinessLoanContent />;
}
