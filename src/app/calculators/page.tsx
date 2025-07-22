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
      <div className="container-content-extensive py-6 sm:py-8">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="container-narrow">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
              Financial Calculators
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive collection of 26+ financial calculators to help you make informed decisions about mortgages, loans, investments, and retirement planning.
            </p>
          </div>
        </header>

        {/* Calculator Grid */}
        <section className="animate-slide-up mb-12 sm:mb-16">
          <div className="container-content-extensive">
            <CalculatorList />
          </div>
        </section>

        {/* Information Section */}
        <section>
          <div className="container-narrow">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                Calculator Categories
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                  <div className="text-3xl sm:text-4xl mb-3">🏠</div>
                  <div className="font-semibold text-gray-900 mb-2">Loans</div>
                  <div className="text-sm text-gray-600 leading-relaxed">Mortgage, Personal, Car</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                  <div className="text-3xl sm:text-4xl mb-3">📈</div>
                  <div className="font-semibold text-gray-900 mb-2">Investments</div>
                  <div className="text-sm text-gray-600 leading-relaxed">SIP, Mutual Funds, FD</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                  <div className="text-3xl sm:text-4xl mb-3">💰</div>
                  <div className="font-semibold text-gray-900 mb-2">Planning</div>
                  <div className="text-sm text-gray-600 leading-relaxed">Budget, Retirement, Insurance</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100">
                  <div className="text-3xl sm:text-4xl mb-3">📋</div>
                  <div className="font-semibold text-gray-900 mb-2">Tax</div>
                  <div className="text-sm text-gray-600 leading-relaxed">Income Tax, GST</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}