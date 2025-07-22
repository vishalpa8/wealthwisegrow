"use client";

import Link from "next/link";
import { useState } from "react";
import { CalculatorExplorer } from "@/components/ui/calculator-explorer";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  return (
    <div className="space-y-20">
      {/* Simple Hero Section */}
      <section className="bg-white py-16">
        <div className="container-narrow">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Financial Calculator Hub
            </h1>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
              34+ financial calculators for mortgages, loans, investments, and retirement planning. 
              Get instant results to make informed financial decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => setIsExplorerOpen(true)}
                className="btn-primary btn-lg"
              >
                <span className="mr-2">🧮</span>
                Explore Calculators
              </Button>
              <Link href="/guides" className="btn btn-outline btn-lg">
                <span className="mr-2">📚</span>
                Read Guides
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 text-center mb-6">
              Popular Calculators
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/calculators/mortgage"
                className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors text-center"
              >
                <span className="text-2xl block mb-2">🏠</span>
                <span className="text-sm font-medium text-neutral-900">Mortgage</span>
              </Link>
              <Link
                href="/calculators/loan"
                className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors text-center"
              >
                <span className="text-2xl block mb-2">💳</span>
                <span className="text-sm font-medium text-neutral-900">Loan</span>
              </Link>
              <Link
                href="/calculators/investment"
                className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors text-center"
              >
                <span className="text-2xl block mb-2">📈</span>
                <span className="text-sm font-medium text-neutral-900">Investment</span>
              </Link>
              <Link
                href="/calculators/retirement"
                className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors text-center"
              >
                <span className="text-2xl block mb-2">🧓</span>
                <span className="text-sm font-medium text-neutral-900">Retirement</span>
              </Link>
            </div>
          </div>

          {/* Feature Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">34+</div>
              <div className="text-sm text-neutral-600 font-medium">Calculators</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm text-neutral-600 font-medium">Instant Results</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm text-neutral-600 font-medium">Track Progress</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">🆓</div>
              <div className="text-sm text-neutral-600 font-medium">Free & No Signup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Calculator Categories Preview */}
      <section className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Financial Calculator Categories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our complete collection of 34+ financial calculators organized by category.
          </p>
        </div>

        {/* Calculator Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-2">🏠</div>
            <h3 className="font-medium text-gray-900 mb-1">Loans</h3>
            <p className="text-sm text-gray-600">Mortgage, Personal, Car</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-medium text-gray-900 mb-1">Investments</h3>
            <p className="text-sm text-gray-600">SIP, Mutual Funds, FD</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-medium text-gray-900 mb-1">Planning</h3>
            <p className="text-sm text-gray-600">Budget, Retirement</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-medium text-gray-900 mb-1">Tax</h3>
            <p className="text-sm text-gray-600">Income Tax, GST</p>
          </div>
        </div>

        {/* CTA to Calculators Page */}
        <div className="text-center">
          <Link
            href="/calculators"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span className="mr-2">📊</span>
            View All Calculators
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 rounded-lg p-8">
        <div className="container-narrow">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Why Choose WealthWise Hub?
            </h2>
            <p className="text-gray-600">
              Professional financial tools designed for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Accurate
              </h3>
              <p className="text-sm text-gray-600">
                Professional-grade algorithms ensure precise results for your
                financial planning.
              </p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast</h3>
              <p className="text-sm text-gray-600">
                Get instant results with our optimized calculators. No waiting,
                no delays.
              </p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Private
              </h3>
              <p className="text-sm text-gray-600">
                Your data stays on your device. No registration required,
                completely private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center section-spacing-sm">
        <div className="container-narrow">
          <h2 className="text-heading-3 mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-body-large mb-8">
            Start with any calculator and discover insights that can transform
            your financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsExplorerOpen(true)}
              className="btn-primary btn-lg"
            >
              <span className="mr-2">🚀</span>
              Get Started Now
            </Button>
            <Link href="/calculators" className="btn btn-outline btn-lg">
              <span className="mr-2">📊</span>
              Browse All
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
