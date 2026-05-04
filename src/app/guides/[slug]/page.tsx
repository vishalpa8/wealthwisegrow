import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/content/guide-article";
import { guides } from "@/lib/content/guides";

type GuideSlug = keyof typeof guides;

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.values(guides).map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug as GuideSlug];

  if (!guide) {
    return {
      title: "Guide Not Found | WealthWiseGrow",
    };
  }

  return {
    title: `${guide.title} | WealthWiseGrow`,
    description: guide.description,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    openGraph: {
      title: `${guide.title} | WealthWiseGrow`,
      description: guide.description,
      type: "article",
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = guides[slug as GuideSlug];

  if (!guide) {
    notFound();
  }

  return <GuideArticle guide={guide} />;
}
