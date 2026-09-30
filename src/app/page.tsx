"use client";

import Link from "next/link";
import { useState } from "react";
import { CalculatorExplorer } from "@/components/organisms/calculator-explorer";
import { Button } from "@/components/atoms/button";
import { guides } from "@/lib/content/guides";

const featuredGuides = Object.values(guides);

export default function Home() {
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 rounded-xl">
        <div className="container-narrow">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <span className="mr-1">✨</span>
              Financial Calculator Hub
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Smart Financial Decisions
              <span className="block text-blue-600">Start Here</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Access 39+ professional financial calculators for mortgages, loans, investments, and retirement planning. 
              Get instant estimates with documented assumptions to support informed financial decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button
                onClick={() => setIsExplorerOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">🧮</span>
                Explore Calculators
              </Button>
              <Link href="/guides" className="bg-white text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold border border-gray-300 transition-all duration-200 inline-flex items-center justify-center">
                <span className="mr-2">📚</span>
                Read Guides
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
              Most Popular Calculators
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/calculators/mortgage"
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center"
              >
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-200">
                  <span className="text-2xl">🏠</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">Mortgage Calculator</span>
              </Link>
              <Link
                href="/calculators/loan"
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center"
              >
                <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-100 group-hover:scale-110 transition-all duration-200">
                  <span className="text-2xl">💳</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700">Loan Calculator</span>
              </Link>
              <Link
                href="/calculators/investment"
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center"
              >
                <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-200">
                  <span className="text-2xl">📈</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">Investment Calculator</span>
              </Link>
              <Link
                href="/calculators/retirement"
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center"
              >
                <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-100 group-hover:scale-110 transition-all duration-200">
                  <span className="text-2xl">🧓</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-700">Retirement Calculator</span>
              </Link>
            </div>
          </div>

          {/* Feature Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">39+</div>
              <div className="text-xs text-gray-600 font-medium">Calculators</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-gray-600 font-medium">Instant Results</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-xs text-gray-600 font-medium">Local Calculations</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl mb-1">🆓</div>
              <div className="text-xs text-gray-600 font-medium">Free Forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Categories Preview */}
      <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Explore by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our complete collection of 39+ financial calculators organized by category to help you make smarter financial decisions.
          </p>
        </div>

        {/* Calculator Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Link href="/calculators#loans-emi" className="group text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl text-white">🏠</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Loans & EMI</h3>
            <p className="text-sm text-gray-600">Mortgage, Personal, Car, Business</p>
          </Link>
          <Link href="/calculators#investment-sip" className="group text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl text-white">📈</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Investments</h3>
            <p className="text-sm text-gray-600">SIP, Mutual Funds, FD, Gold</p>
          </Link>
          <Link href="/calculators#financial-planning" className="group text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl text-white">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Planning</h3>
            <p className="text-sm text-gray-600">Budget, Retirement, Goals</p>
          </Link>
          <Link href="/calculators#tax-planning" className="group text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
            <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl text-white">📋</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Tax Planning</h3>
            <p className="text-sm text-gray-600">Income Tax, GST, HRA</p>
          </Link>
        </div>

        {/* CTA to Calculators Page */}
        <div className="text-center">
          <Link
            href="/calculators"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">📊</span>
            View All Calculators
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
        <div className="container-narrow">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose WealthWiseGrow?
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Professional financial tools designed for everyone, from beginners to experts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Transparent & Testable
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Documented formulas, dated regulatory assumptions, and automated tests make results easier to understand and verify.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant results with our optimized calculators. No waiting, no delays, just immediate insights.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Calculator Privacy
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Calculator inputs are processed in your browser and are not sent to our servers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          How to make a money decision with WealthWiseGrow
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          A calculator gives you a number, but a good decision needs context. Every tool on WealthWiseGrow comes with the formula it uses, the assumptions behind it, a worked example with Indian numbers, and the common mistakes people make. We suggest a simple three-step approach.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Understand the decision</h3>
            <p className="text-gray-600 leading-relaxed">
              Start with a guide. Our guides explain how loans, SIPs, taxes, insurance and retirement planning work in India, so you know which numbers actually matter before you calculate anything.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Test more than one scenario</h3>
            <p className="text-gray-600 leading-relaxed">
              Run a conservative case and an optimistic case. A home loan at 1% higher interest, or a SIP at 8% instead of 12%, shows whether your plan still works when things do not go perfectly.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Verify before you commit</h3>
            <p className="text-gray-600 leading-relaxed">
              Results are educational estimates. Confirm the final numbers with your bank quote, fund documents, Form 16 or a qualified advisor. Our <Link href="/methodology" className="text-blue-600 hover:underline">methodology page</Link> explains exactly how each result is calculated.
            </p>
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Personal finance guides</h2>
          <p className="text-gray-600 leading-relaxed">
            Practical, India-focused explanations with worked examples, checklists and answers to common questions.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {featuredGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="block rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{guide.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="container-narrow">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed">
            Start with any calculator and discover insights that can transform your financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsExplorerOpen(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">🚀</span>
              Get Started Now
            </Button>
            <Link href="/calculators" className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold border border-blue-400 transition-all duration-200 inline-flex items-center justify-center">
              <span className="mr-2">📊</span>
              Browse All Calculators
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator Explorer Modal */}
      <CalculatorExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
      />
    </div>
  );
}
