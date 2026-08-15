import type { Metadata } from "next";
import { AdvancedEMICalculatorContent } from "./page-content";

export const metadata: Metadata = {
  title: "Advanced EMI Calculator | WealthWiseGrow",
  description: "Calculate EMI with prepayment options, amortization schedule, and scenario comparisons.",
};

export default function AdvancedEMIPage() {
  return <AdvancedEMICalculatorContent />;
}
