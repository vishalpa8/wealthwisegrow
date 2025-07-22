import React from 'react';
import { CalculatorList } from "@/components/ui/calculator-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Calculators | WealthWise Hub",
  description: "Comprehensive collection of 26+ financial calculators for mortgages, loans, investments, retirement planning, and more. Free, accurate, and easy to use.",
  keywords: ["financial calculators", "mortgage calculator", "loan calculator", "investment calculator", "retirement planning"],
  openGraph: {
    title: "Financial Calculators | WealthWise Hub",
    description: "Comprehensive collection of 26+ financial calculators for mortgages, loans, investments, retirement planning, and more.",
    type: "website",
  },
};

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-wide py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="container-narrow">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Financial Calculators
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive collection of 26+ financial calculators to help you make informed decisions about mortgages, loans, investments, and retirement planning.
            </p>
          </div>
        </header>

        {/* Calculator Grid */}
        <section className="animate-slide-up">
          <CalculatorList />
        </section>

        {/* Information Section */}
        <section className="mt-16">
          <div className="container-narrow">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Calculator Categories
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🏠</div>
                  <div className="font-medium text-gray-900">Loans</div>
                  <div className="text-sm text-gray-600">Mortgage, Personal, Car</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-medium text-gray-900">Investments</div>
                  <div className="text-sm text-gray-600">SIP, Mutual Funds, FD</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-medium text-gray-900">Planning</div>
                  <div className="text-sm text-gray-600">Budget, Retirement, Insurance</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-medium text-gray-900">Tax</div>
                  <div className="text-sm text-gray-600">Income Tax, GST</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}