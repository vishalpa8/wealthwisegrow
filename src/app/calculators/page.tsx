import React from 'react';
import { CalculatorList } from "@/components/ui/calculator-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Calculators | WealthWise Hub",
  description: "Comprehensive collection of financial calculators for mortgages, loans, investments, retirement planning, and more. Free, accurate, and easy to use.",
  keywords: ["financial calculators", "mortgage calculator", "loan calculator", "investment calculator", "retirement planning"],
  openGraph: {
    title: "Financial Calculators | WealthWise Hub",
    description: "Comprehensive collection of financial calculators for mortgages, loans, investments, retirement planning, and more.",
    type: "website",
  },
};

export default function CalculatorsPage() {
  return (
    <div className="container-wide py-8">
      {/* Header */}
      <header className="text-center mb-12 animate-fade-in">
        <div className="container-narrow">
          <h1 className="text-heading-1 mb-6">Financial Calculators</h1>
          <p className="text-body-large">
            Comprehensive collection of financial calculators to help you make informed decisions about mortgages, loans, investments, and retirement planning.
          </p>
        </div>
      </header>

      {/* Calculator Grid */}
      <section className="animate-slide-up">
        <CalculatorList />
      </section>

      {/* Information Section */}
      <section className="section-spacing-sm">
        <div className="container-narrow">
          <div className="card">
            <div className="card-content">
              <h2 className="text-heading-3 mb-6 text-center">How Our Calculators Help You</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl text-white">📊</span>
                  </div>
                  <h3 className="text-heading-4 mb-3">Make Informed Decisions</h3>
                  <p className="text-body">
                    Get accurate calculations to compare different financial scenarios and choose the best option for your situation.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl text-white">💡</span>
                  </div>
                  <h3 className="text-heading-4 mb-3">Plan Your Future</h3>
                  <p className="text-body">
                    Use our retirement and investment calculators to plan for your financial future and achieve your goals.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl text-white">💰</span>
                  </div>
                  <h3 className="text-heading-4 mb-3">Save Money</h3>
                  <p className="text-body">
                    Find the best loan terms, optimize your investments, and discover ways to reduce your financial costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}