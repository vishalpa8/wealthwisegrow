"use client";

import Link from "next/link";
import { useState } from "react";
import { CalculatorExplorer } from "@/components/ui/calculator-explorer";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center section-spacing">
        <div className="container-narrow">
          <div className="animate-fade-in">
            <h1 className="text-heading-1 mb-6">Calculator Collections</h1>
            <p className="text-body-large mb-10 max-w-3xl mx-auto">
              34+ interactive financial calculators for mortgages, loans, investments,
              retirement, debt payoff, and budgeting. Get instant results,
              actionable insights, and track your financial progress—all in one
              place. No signup required, completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                onClick={() => setIsExplorerOpen(true)}
                className="btn-primary btn-lg"
              >
                <span className="mr-2 text-lg">🧮</span>
                Explore Calculators
              </Button>
              <Link href="/guides" className="btn btn-outline btn-lg">
                <span className="mr-2 text-lg">📚</span>
                Read Guides
              </Link>
            </div>
          </div>

          {/* Quick Access to Popular Calculators */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
              Quick Access - Most Popular
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/calculators/mortgage"
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-center"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                  🏠
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Mortgage
                </span>
              </Link>
              <Link
                href="/calculators/loan"
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-center"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                  💳
                </span>
                <span className="text-sm font-medium text-gray-900">Loan</span>
              </Link>
              <Link
                href="/calculators/investment"
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-center"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                  📈
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Investment
                </span>
              </Link>
              <Link
                href="/calculators/retirement"
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-center"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                  🧓
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Retirement
                </span>
              </Link>
            </div>
          </div>

          {/* Feature Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="card text-center p-6 animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="text-3xl font-bold text-gray-900 mb-2">34+</div>
              <div className="text-sm text-gray-600 font-medium">Calculators</div>
            </div>
            <div
              className="card text-center p-6 animate-scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm text-gray-600 font-medium">
                Instant Results
              </div>
            </div>
            <div
              className="card text-center p-6 animate-scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm text-gray-600 font-medium">
                Track Progress
              </div>
            </div>
            <div
              className="card text-center p-6 animate-scale-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="text-3xl mb-2">🆓</div>
              <div className="text-sm text-gray-600 font-medium">
                Free & No Signup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Categories Preview */}
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
