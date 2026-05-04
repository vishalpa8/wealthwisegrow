import React from 'react';
import Link from 'next/link';
import { ChevronRight, HelpCircle, BookOpen } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface RelatedTool {
  name: string;
  href: string;
}

interface CalculatorExplanatoryContentProps {
  title: string;
  description: React.ReactNode;
  sections: Array<{
    title: string;
    content: React.ReactNode;
  }>;
  faqs: FAQ[];
  relatedTools: RelatedTool[];
}

export function CalculatorExplanatoryContent({
  title,
  description,
  sections,
  faqs,
  relatedTools
}: CalculatorExplanatoryContentProps) {
  return (
    <div className="mt-12 space-y-12 animate-fade-in">
      {/* Introduction */}
      <section className="prose prose-neutral max-w-none">
        <h2 className="text-3xl font-bold text-neutral-900 mb-6 flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
          Everything You Need to Know About {title}
        </h2>
        <div className="text-lg text-neutral-600 leading-relaxed">
          {description}
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, index) => (
          <div key={index} className="card p-6 bg-white border-neutral-100 hover:border-blue-100 transition-colors">
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3 text-sm">
                {index + 1}
              </span>
              {section.title}
            </h3>
            <div className="text-neutral-600 leading-relaxed">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <section>
        <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center">
          <HelpCircle className="w-7 h-7 mr-3 text-blue-600" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="card p-6 bg-neutral-50 border-transparent">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{faq.question}</h3>
              <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools & Internal Linking */}
      <section className="bg-blue-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Ready to explore more tools?</h2>
            <p className="text-blue-100 text-lg">
              Check out our related financial calculators to get a complete picture of your financial health.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end flex-1">
            {relatedTools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center shadow-lg"
              >
                {tool.name}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
