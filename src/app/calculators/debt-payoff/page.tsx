import type { Metadata } from "next";
import { DebtPayoffContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateCalculatorMetadata(
  "debt-payoff",
  "Debt Snowball & Payoff Strategy Calculator",
  "Calculate how long it will take to pay off your debt and how much interest you'll pay. See the impact of extra payments on your debt freedom journey."
);

export default function DebtPayoffPage() {
  return <DebtPayoffContent />;
}
