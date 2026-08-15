import type { Metadata } from "next";
import { BreakEvenContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateCalculatorMetadata(
  "break-even",
  "Break-even Point Calculator",
  "Calculate the point at which total revenue equals total costs, indicating when your business becomes profitable."
);

export default function BreakEvenPage() {
  return <BreakEvenContent />;
}