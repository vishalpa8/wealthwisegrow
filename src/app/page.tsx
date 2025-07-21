"use client";

import Link from 'next/link';
import { useState } from 'react';
import { CalculatorList } from "@/components/ui/calculator-list";
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
            <h1 className="text-heading-1 mb-6">
              Personal Calculator Hub
            </h1>
            <p className="text-body-large mb-10 max-w-3xl mx-auto">
              25+ interactive calculators for mortgages, loans, investments,
              retirement, debt payoff, and budgeting. Get instant results,
              actionable insights, and track your financial progress—all in one
              place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                onClick={() => setIsExplorerOpen(true)}
                className="btn-primary btn-lg"
              >
                <span className="mr-2 text-lg">🧮</span>
                Explore Calculators
              </Button>
              <Link
                href="/calculators"
                className="btn btn-outline btn-lg"
              >
                <span className="mr-2 text-lg">📊</span>
                View All Calculators
              </Link>
              <Link
                href="/guides"
                className="btn btn-outline btn-lg"
              >
                <span className="mr-2 text-lg">📚</span>
                Read Guides
              </Link>
            </div>
          </div>
          
          {/* Feature Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="card text-center p-6 animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
              <div className="text-sm text-gray-600 font-medium">Calculators</div>
            </div>
            <div className="card text-center p-6 animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm text-gray-600 font-medium">Instant Results</div>
            </div>
            <div className="card text-center p-6 animate-scale-in" style={{animationDelay: '0.3s'}}>
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm text-gray-600 font-medium">Track Progress</div>
            </div>
            <div className="card text-center p-6 animate-scale-in" style={{animationDelay: '0.4s'}}>
              <div className="text-3xl mb-2">🆓</div>
              <div className="text-sm text-gray-600 font-medium">Free & No Signup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Categories */}
      <section className="animate-slide-up">
        <div className="text-center mb-12">
          <h2 className="text-heading-2 mb-4">
            Financial Calculators for Every Need
          </h2>
          <p className="text-body-large max-w-2xl mx-auto">
            From simple interest calculations to complex retirement planning, 
            we've got you covered with professional-grade tools.
          </p>
        </div>
        <CalculatorList />
      </section>

      {/* Features Section */}
      <section className="section-spacing-sm bg-gray-100 rounded-2xl">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="text-heading-3 mb-4">
              Why Choose WealthWise Hub?
            </h2>
            <p className="text-body">
              Built by financial experts, designed for everyone
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl text-white">🎯</span>
              </div>
              <h3 className="text-heading-4 mb-3">Accurate Calculations</h3>
              <p className="text-body">
                Professional-grade algorithms ensure precise results for all your financial planning needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl text-white">🚀</span>
              </div>
              <h3 className="text-heading-4 mb-3">Lightning Fast</h3>
              <p className="text-body">
                Get instant results with our optimized calculators. No waiting, no delays.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-xl text-white">🔒</span>
              </div>
              <h3 className="text-heading-4 mb-3">Privacy First</h3>
              <p className="text-body">
                Your data stays on your device. No registration required, completely private.
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
            Start with any calculator and discover insights that can transform your financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsExplorerOpen(true)}
              className="btn-primary btn-lg"
            >
              <span className="mr-2">🚀</span>
              Get Started Now
            </Button>
            <Link
              href="/calculators"
              className="btn btn-outline btn-lg"
            >
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