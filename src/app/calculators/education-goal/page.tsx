import type { Metadata } from "next";
import { EducationGoalContent } from "./page-content";
import { generateCalculatorMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generateCalculatorMetadata(
  "education-goal",
  "Child Future Education Cost Calculator",
  "Plan for your children's education by calculating future costs and required monthly savings."
);

export default function EducationGoalPage() {
  return <EducationGoalContent />;
}
