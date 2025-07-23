"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CalculatorLayout } from "@/components/layout/calculator-layout";

// Organize calculators by category
// All calculator definitions
const calculatorsByCategory = {
  'Loans & EMI': [
    {
      title: 'Advanced EMI Calculator',
      description: 'EMI calculator with prepayment options and amortization schedule',
      icon: '🧮',
      href: '/calculators/advanced-emi'
    },
    {
      title: 'Personal Loan',
      description: 'Calculate EMI and total interest for personal loans',
      icon: '💳',
      href: '/calculators/personal-loan'
    },
    {
      title: 'Home Loan',
      description: 'Plan your home loan EMIs and total costs',
      icon: '🏠',
      href: '/calculators/home-loan'
    },
    {
      title: 'Car Loan',
      description: 'Calculate car loan EMIs and affordability',
      icon: '🚗',
      href: '/calculators/car-loan'
    },
    {
      title: 'Business Loan',
      description: 'Calculate business loan EMI with eligibility analysis',
      icon: '🏢',
      href: '/calculators/business-loan'
    },
    {
      title: 'Education Loan',
      description: 'Plan education loan with tax benefits and ROI',
      icon: '🎓',
      href: '/calculators/education-loan'
    },
    {
      title: 'Balloon Loan',
      description: 'Calculate balloon loan payments and final amount',
      icon: '🎈',
      href: '/calculators/balloon-loan'
    },
    {
      title: 'Loan Calculator',
      description: 'General loan calculator for all loan types',
      icon: '💰',
      href: '/calculators/loan'
    },
    {
      title: 'Mortgage Calculator',
      description: 'Calculate mortgage payments with detailed breakdown',
      icon: '🏡',
      href: '/calculators/mortgage'
    }
  ],
  'Investment & SIP': [
    {
      title: 'SIP Calculator',
      description: 'Plan your systematic investment returns',
      icon: '📈',
      href: '/calculators/sip'
    },
    {
      title: 'Mutual Fund',
      description: 'Calculate mutual fund returns and growth',
      icon: '💹',
      href: '/calculators/mutual-fund'
    },
    {
      title: 'Investment Calculator',
      description: 'Calculate investment growth with compound interest',
      icon: '📊',
      href: '/calculators/investment'
    },
    {
      title: 'Lumpsum Investment',
      description: 'Calculate returns on one-time investments',
      icon: '💎',
      href: '/calculators/lumpsum'
    },
    {
      title: 'Dividend Yield',
      description: 'Calculate dividend yield and income from stocks',
      icon: '💵',
      href: '/calculators/dividend-yield'
    },
    {
      title: 'Gold Investment',
      description: 'Calculate gold investment returns and growth',
      icon: '🥇',
      href: '/calculators/gold'
    },
    {
      title: 'SWP Calculator',
      description: 'Plan systematic withdrawal from investments',
      icon: '📉',
      href: '/calculators/swp'
    },
    {
      title: 'ROI Calculator',
      description: 'Calculate return on investment percentage',
      icon: '📋',
      href: '/calculators/roi'
    }
  ],
  'Fixed Income & Savings': [
    {
      title: 'FD Calculator',
      description: 'Calculate fixed deposit returns and maturity',
      icon: '🏦',
      href: '/calculators/fd'
    },
    {
      title: 'RD Calculator',
      description: 'Plan your recurring deposits',
      icon: '💰',
      href: '/calculators/rd'
    },
    {
      title: 'PPF Calculator',
      description: 'Calculate PPF investment growth',
      icon: '🏛️',
      href: '/calculators/ppf'
    },
    {
      title: 'EPF Calculator',
      description: 'Estimate your EPF returns',
      icon: '💼',
      href: '/calculators/epf'
    },
    {
      title: 'Savings Calculator',
      description: 'Plan your savings goals with inflation adjustment',
      icon: '🎯',
      href: '/calculators/savings'
    },
    {
      title: 'Compound Interest',
      description: 'Calculate compound interest with different frequencies',
      icon: '🔄',
      href: '/calculators/compound-interest'
    },
    {
      title: 'Simple Interest',
      description: 'Calculate simple interest on investments',
      icon: '📐',
      href: '/calculators/simple-interest'
    }
  ],
  'Tax Planning': [
    {
      title: 'Tax Planning Calculator',
      description: 'Compare old vs new tax regime with detailed analysis',
      icon: '📋',
      href: '/calculators/tax-planning'
    },
    {
      title: 'Income Tax',
      description: 'Calculate your income tax liability',
      icon: '📊',
      href: '/calculators/income-tax'
    },
    {
      title: 'GST Calculator',
      description: 'Calculate GST inclusive/exclusive amounts',
      icon: '🧾',
      href: '/calculators/gst'
    },
    {
      title: 'HRA Calculator',
      description: 'Calculate HRA exemption amount',
      icon: '🏘️',
      href: '/calculators/hra'
    },
    {
      title: 'Tax Calculator',
      description: 'General tax calculation tool',
      icon: '🧮',
      href: '/calculators/tax'
    }
  ],
  'Financial Planning': [
    {
      title: 'Retirement Planning',
      description: 'Plan your retirement corpus',
      icon: '👴',
      href: '/calculators/retirement'
    },
    {
      title: 'Goal Planning',
      description: 'Plan and track multiple financial goals with inflation adjustment',
      icon: '🎯',
      href: '/calculators/goal-planning'
    },
    {
      title: 'Budget Calculator',
      description: 'Track income, expenses and savings rate',
      icon: '📝',
      href: '/calculators/budget'
    },
    {
      title: 'Insurance Calculator',
      description: 'Calculate insurance needs and premiums',
      icon: '🛡️',
      href: '/calculators/insurance'
    },
    {
      title: 'Education Goal',
      description: 'Plan for children\'s education expenses',
      icon: '🎓',
      href: '/calculators/education-goal'
    },
    {
      title: 'Debt Payoff',
      description: 'Plan debt payoff strategy and timeline',
      icon: '💳',
      href: '/calculators/debt-payoff'
    },
    {
      title: 'Emergency Fund',
      description: 'Calculate emergency fund needs based on your risk profile',
      icon: '🚨',
      href: '/calculators/emergency-fund'
    },
    {
      title: 'Financial Health Score',
      description: 'Assess your overall financial health with comprehensive scoring',
      icon: '🎩',
      href: '/calculators/financial-health'
    },
    {
      title: 'Break-even Analysis',
      description: 'Calculate business break-even point',
      icon: '⚖️',
      href: '/calculators/break-even'
    },
    {
      title: 'Salary Calculator',
      description: 'Calculate take-home salary and deductions',
      icon: '💼',
      href: '/calculators/salary'
    }
  ]
};



export default function CalculatorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const sidebar = null;

  // Get all calculators in a flat array for searching
  const allCalculators = useMemo(() => {
    return Object.entries(calculatorsByCategory).flatMap(([category, calculators]) =>
      calculators.map(calc => ({ ...calc, category }))
    );
  }, []);

  // Filter calculators based on search term and category
  const filteredCalculators = useMemo(() => {
    let filtered = allCalculators;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(calc =>
        calc.title.toLowerCase().includes(searchLower) ||
        calc.description.toLowerCase().includes(searchLower) ||
        calc.category.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(calc => calc.category === selectedCategory);
    }

    // Group back by category
    const grouped: { [key: string]: typeof filtered } = {};
    filtered.forEach(calc => {
      if (!grouped[calc.category]) {
        grouped[calc.category] = [];
      }
      (grouped[calc.category] as typeof filtered).push(calc);
    });

    return grouped;
  }, [allCalculators, searchTerm, selectedCategory]);

  // Get unique categories for filter
  const categories = ['All', ...Object.keys(calculatorsByCategory)];

  const totalResults = Object.values(filteredCalculators).flat().length;

  return (
    <div className="container-wide py-4">
      {/* Header - Outside of CalculatorLayout for better control */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium text-blue-600 mb-2 uppercase tracking-wider">All Calculators</p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
          Choose Your Calculator
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Explore our collection of 39+ financial calculators designed to help you make better financial decisions
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-4xl mx-auto mb-8">
        {/* Search Box */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search calculators by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-center text-sm text-gray-600 mb-6">
          {searchTerm || selectedCategory !== 'All' ? (
            <span>
              Showing {totalResults} calculator{totalResults !== 1 ? 's' : ''}
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </span>
          ) : (
            <span>Showing all {totalResults} calculators</span>
          )}
        </div>
      </div>

      <CalculatorLayout
        title=""
        description=""
        sidebar={sidebar}
        className="!pt-0 !pb-0"
      >

        {/* Calculator Categories */}
        {Object.keys(filteredCalculators).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(filteredCalculators).map(([category, calculators]) => (
              <section 
                key={category} 
                id={category.toLowerCase().replace(/\s+/g, '-')}
                className="scroll-mt-8"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="mr-2">{category}</span>
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {calculators.length}
                  </span>
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {calculators.map(calc => (
                    <Link
                      key={calc.title}
                      href={calc.href}
                      className="group block bg-white rounded-xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-200">
                            <span className="text-2xl">{calc.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 mb-2 leading-tight">
                              {calc.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">
                            {calc.description}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              Calculator
                            </span>
                            <span className="text-blue-600 group-hover:text-blue-700 transition-colors">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No calculators found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? (
                <>No calculators match your search for "{searchTerm}"</>
              ) : (
                <>No calculators found in the {selectedCategory} category</>
              )}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

      {/* Features Section */}
      <section className="mt-16 bg-gray-50 rounded-xl p-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Why Use Our Calculators?
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="inline-block p-3 bg-white rounded-lg shadow-sm mb-3">
              ⚡
            </div>
            <h3 className="font-medium text-gray-900">Fast & Accurate</h3>
            <p className="text-sm text-gray-600 mt-1">
              Get instant results with precise calculations
            </p>
          </div>
          <div className="text-center">
            <div className="inline-block p-3 bg-white rounded-lg shadow-sm mb-3">
              🛡️
            </div>
            <h3 className="font-medium text-gray-900">Secure & Private</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your data never leaves your device
            </p>
          </div>
          <div className="text-center">
            <div className="inline-block p-3 bg-white rounded-lg shadow-sm mb-3">
              💡
            </div>
            <h3 className="font-medium text-gray-900">Easy to Use</h3>
            <p className="text-sm text-gray-600 mt-1">
              Simple interface with helpful guides
            </p>
          </div>
        </div>
      </section>

      </CalculatorLayout>
    </div>
  );
}
