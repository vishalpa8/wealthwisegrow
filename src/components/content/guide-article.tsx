import Link from "next/link";
import type { GuideContent } from "@/lib/content/guides";

export function GuideArticle({ guide }: { guide: GuideContent }) {
  return (
    <article className="prose prose-neutral max-w-none card p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
        Personal finance guide
      </p>
      <h1 className="text-3xl font-bold text-neutral-900 mt-2">{guide.title}</h1>
      <p className="text-lg text-neutral-600 leading-relaxed">{guide.description}</p>

      {guide.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="text-neutral-600 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-neutral-50 p-5">
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Action checklist</h2>
          <ul className="space-y-2 text-neutral-600">
            {guide.checklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-neutral-50 p-5">
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Useful calculators</h2>
          <ul className="space-y-2">
            {guide.relatedCalculators.map((calculator) => (
              <li key={calculator.href}>
                <Link href={calculator.href} className="font-medium text-primary-600 hover:underline">
                  {calculator.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mt-8 rounded-lg border border-neutral-200 p-4 text-sm text-neutral-600">
        <strong className="text-neutral-900">Editorial note:</strong> This guide is educational and does not replace professional financial advice. Last reviewed: {guide.lastReviewed}.
      </footer>
    </article>
  );
}
