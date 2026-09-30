import React from 'react';
import type { Metadata } from "next";
import { GuidesPageClient } from './guides-client';

export const metadata: Metadata = {
  title: "Financial Guides | WealthWiseGrow",
  description: "Practical financial guides and resources to help you understand mortgages, investments, retirement planning, and personal finance.",
  keywords: ["financial guides", "mortgage guide", "investment guide", "retirement planning", "personal finance"],
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "Financial Guides | WealthWiseGrow",
    description: "Practical financial guides and resources to help you understand mortgages, investments, retirement planning, and personal finance.",
    url: "https://wealthwisegrow.com/guides",
    type: "website",
  },
};

export default function GuidesPage() {
  return <GuidesPageClient />;
}