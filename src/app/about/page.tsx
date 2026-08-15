import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/templates/calculator-layout";

export const metadata: Metadata = {
  title: "About Us | WealthWiseGrow",
  description: "Learn about WealthWiseGrow's mission to provide free, accurate, and accessible financial tools for everyone in India.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <CalculatorLayout
      title="About WealthWiseGrow"
      description="Empowering your financial journey with clarity and precision."
    >
      <div className="prose prose-neutral max-w-none card p-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Mission</h2>
          <p className="text-neutral-600 leading-relaxed mb-6">
            WealthWiseGrow was founded with a simple yet powerful goal: to make financial planning accessible to everyone. We believe that financial literacy and the right tools should not be behind a paywall or complex registrations.
          </p>
          <p className="text-neutral-600 leading-relaxed">
            Our platform provides free, high-quality financial calculators and guides tailored to the Indian financial landscape, helping you make informed decisions about loans, investments, taxes, and retirement.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Why WealthWiseGrow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Privacy First</h3>
              <p className="text-sm text-neutral-600">
                Your financial data is yours. We don't store your sensitive calculation inputs on our servers. Most calculations happen right in your browser.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Accuracy & Precision</h3>
              <p className="text-sm text-neutral-600">
                Our calculators are built on rigorous mathematical models and updated regularly to reflect the latest financial rules and tax slabs in India.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">User Experience</h3>
              <p className="text-sm text-neutral-600">
                No sign-ups, no hidden costs, and no clutter. Just clean, fast, and easy-to-use tools designed for clarity.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Commitment</h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            In the world of personal finance (YMYL - Your Money Your Life), trust is everything. We are committed to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-600">
            <li><strong>Expert Review:</strong> Our content and tools are reviewed for accuracy and relevance.</li>
            <li><strong>Transparency:</strong> We clearly explain the methodology and formulas behind our calculators.</li>
            <li><strong>Independence:</strong> Our tools provide objective results to help you compare options fairly.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Connect With Us</h2>
          <p className="text-neutral-600 leading-relaxed">
            Have feedback or suggestions? We'd love to hear from you. Visit our <a href="/contact" className="text-primary-600 hover:underline">Contact Page</a> to get in touch.
          </p>
        </section>
      </div>
    </CalculatorLayout>
  );
}
