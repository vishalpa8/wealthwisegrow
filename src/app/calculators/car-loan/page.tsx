import type { Metadata } from "next";
import { CarLoanContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateCalculatorMetadata(
  "car-loan",
  "Car Loan EMI Calculator",
  "Calculate car loan EMI, total interest, and understand the true cost of car ownership including depreciation."
);

export default function CarLoanPage() {
  return <CarLoanContent />;
}
