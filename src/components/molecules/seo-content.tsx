import React from 'react';

interface SEOSection {
  title: string;
  content: string;
}

interface SEOFaq {
  question: string;
  answer: string;
}

interface SEORelatedTool {
  name: string;
  href: string;
}

export interface SEOContentProps {
  title: string;
  description: React.ReactNode;
  sections?: SEOSection[];
  faqs?: SEOFaq[];
  relatedTools?: SEORelatedTool[];
}

export function SEOContent({ title, description, sections, faqs, relatedTools }: SEOContentProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="mb-6">{description}</div>
      
      {sections && sections.length > 0 && (
        <div className="space-y-4 mb-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-semibold">{section.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {faqs && faqs.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx}>
                <h4 className="font-medium text-neutral-800 dark:text-neutral-200">{faq.question}</h4>
                <p className="text-neutral-600 dark:text-neutral-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {relatedTools && relatedTools.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">Related Calculators</h3>
          <ul className="list-disc pl-5">
            {relatedTools.map((tool, idx) => (
              <li key={idx}>
                <a href={tool.href} className="text-blue-600 hover:underline">{tool.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
