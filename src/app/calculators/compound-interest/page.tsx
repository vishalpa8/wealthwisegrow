import type { Metadata } from "next";
import { CompoundInterestContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateCalculatorMetadata(
  "compound-interest",
  "Daily Compound Interest & Wealth Growth Calculator",
  "Calculate compound interest with different compounding frequencies and compare with simple interest."
);

export default function CompoundInterestPage() {
  return <CompoundInterestContent />;
}
