import type { Metadata } from "next";
import { BalloonLoanCalculatorContent } from "./page-content";

export const metadata: Metadata = {
  title: "Balloon Loan Calculator | WealthWiseGrow",
  description: "Calculate payments for balloon loans with lower regular payments and a large final payment. Compare with traditional loan options.",
};

export default function BalloonLoanPage() {
  return <BalloonLoanCalculatorContent />;
}
