import type { Metadata } from "next";
import { DividendYieldContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateCalculatorMetadata(
  "dividend-yield",
  "Dividend Yield Calculator",
  "Calculate dividend yield and income from your stock investments."
);

export default function DividendYieldPage() {
  return <DividendYieldContent />;
}
