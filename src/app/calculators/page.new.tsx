import React from 'react';
import Link from 'next/link';
import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/layout/calculator-layout";

export const metadata: Metadata = {
  title: "Financial Calculators | WealthWiseGrow",
  description: "Explore our collection of financial calculators for loans, investments, retirement planning, and more. Simple, accurate, and free to use.",
  keywords: ["financial calculators", "loan calculator", "investment calculator", "retirement calculator"],
};

interface CalculatorCard {
  title: string;
  description: string;
  icon: string;
  link: string;
  category: string;
}

const calculators: CalculatorCard[] = [
  {
    title: "Loan Calculator",
    description: "Calculate EMI, interest, and payment schedule for your loans",
    icon: "💳",
    link: "/calculators/loan",
    category: "Loans",
  },
  {
    title: "Mortgage Calculator",
    description: "Plan your home loan and understand the costs involved",
    icon: "🏠",
    link: "/calculators/mortgage",
    category: "Loans",
  },
  {
    title: "Investment Calculator",
    description: "Calculate returns on your investments over time",
    icon: "📈",
    link: "/calculators/investment",
    category: "Investments",
  },
  {
    title: "SIP Calculator",
    description: "Plan your systematic investment plans and see potential growth",
    icon: "💰",
    link: "/calculators/sip",
    category: "Investments",
  },
  {
    title: "Retirement Calculator",
    description: "Plan for your retirement and estimate required savings",
    icon: "👴",
    link: "/calculators/retirement",
    category: "Planning",
  },
  {
    title: "GST Calculator",
    description: "Calculate GST inclusive and exclusive amounts",
    icon: "📊",
    link: "/calculators/gst",
    category: "Tax",
  },
  {
    title: "Income Tax Calculator",
    description: "Estimate your income tax liability",
    icon: "📝",
    link: "/calculators/income-tax",
    category: "Tax",
  },
  {
    title: "Insurance Calculator",
    description: "Determine the right insurance coverage for your needs",
    icon: "🛡️",
    link: "/calculators/insurance",
    category: "Planning",
  },
];

const categories = Array.from(new Set(calculators.map(calc => calc.category)));

export default function CalculatorsPage() {
  const sidebar = (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 rounded-xl">
        <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wider">
          Categories
        </h3>
        <nav className="space-y-2">
          {categories.map(category => (
            <a
              key={category}
              href={`#${category.toLowerCase()}`}
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors"
            >
              {category}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Financial Calculators"
      description="Find the right calculator for your financial planning needs."
      sidebar={sidebar}
    >
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl mb-4">
          Financial Calculators
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Make better financial decisions with our easy-to-use calculators.
          Simple, accurate, and always free.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <div className="text-2xl font-semibold text-gray-900">25+</div>
            <div className="text-sm text-gray-600">Calculators</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <div className="text-2xl font-semibold text-gray-900">100%</div>
            <div className="text-sm text-gray-600">Free</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <div className="text-2xl font-semibold text-gray-900">Real-time</div>
            <div className="text-sm text-gray-600">Results</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <div className="text-2xl font-semibold text-gray-900">Simple</div>
            <div className="text-sm text-gray-600">To Use</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {categories.map(category => (
          <section key={category} id={category.toLowerCase()} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {category} Calculators
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculators
                .filter(calc => calc.category === category)
                .map(calculator => (
                  <Link
                    key={calculator.title}
                    href={calculator.link}
                    className="group p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-2xl">{calculator.icon}</div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-800">
                        {calculator.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700">
                      {calculator.description}
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>

      {/* Features Section */}
      <section className="mt-24 py-12 px-6 bg-gray-50 rounded-2xl">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Why Choose Our Calculators?
          </h2>
          <p className="text-gray-600">
            Designed for accuracy and ease of use, our calculators help you make informed financial decisions.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
              ⚡
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fast Results</h3>
            <p className="text-sm text-gray-600">
              Get instant calculations with our optimized formulas
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
              🎯
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accurate</h3>
            <p className="text-sm text-gray-600">
              Built using industry-standard financial formulas
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
              🔒
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Private</h3>
            <p className="text-sm text-gray-600">
              Your data never leaves your device
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="mt-24 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Ready to Start?
        </h2>
        <p className="text-gray-600 mb-8">
          Choose a calculator above or start with our most popular ones
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/calculators/loan"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Loan Calculator
          </Link>
          <Link
            href="/calculators/investment"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 text-sm font-medium rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Investment Calculator
          </Link>
        </div>
      </section>
    </CalculatorLayout>
  );
}
