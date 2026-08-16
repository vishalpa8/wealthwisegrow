import type { Metadata } from "next";
import { CarLoanContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateCalculatorMetadata(
  "car-loan",
  "Instant Car Loan EMI & Interest Calculator",
  "Calculate car loan EMI, total interest, and understand the true cost of car ownership including depreciation."
);

export default function CarLoanPage() {
  return <CarLoanContent />;
}
