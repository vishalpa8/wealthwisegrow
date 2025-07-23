"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CalculatorExplorer } from "@/components/ui/calculator-explorer";
import { Button } from "@/components/ui/button";

const guides = [
  {
    title: "Mortgage Guide",
    description: "Everything you need to know about getting a mortgage, from pre-approval to closing.",
    path: "/guides/mortgage",
    icon: "🏠"
  },
  {
    title: "Investment Guide",
    description: "Learn the basics of investing, portfolio diversification, and long-term wealth building.",
    path: "/guides/investment",
    icon: "📈"
  },
  {
    title: "Retirement Planning",
    description: "Plan for your retirement with our comprehensive guide to savings and investment strategies.",
    path: "/guides/retirement",
    icon: "🧓"
  },
  {
    title: "Loan Guide",
    description: "Understand different types of loans, interest rates, and how to get the best terms.",
    path: "/guides/loan",
    icon: "💳"
  },
  {
    title: "Budget Guide",
    description: "Master the art of budgeting and take control of your personal finances.",
    path: "/guides/budget",
    icon: "💰"
  },
];

export function GuidesPageClient() {
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter guides based on search term
  const filteredGuides = useMemo(() => {
    if (!searchTerm.trim()) return guides;
    
    const searchLower = searchTerm.toLowerCase();
    return guides.filter(guide =>
      guide.title.toLowerCase().includes(searchLower) ||
      guide.description.toLowerCase().includes(searchLower)
    );
  }, [searchTerm]);

  return (
    <div className="container-wide py-6">
      {/* Header */}
      <header className="text-center mb-8 animate-fade-in">
        <div className="container-narrow">
          <p className="text-sm font-medium text-green-600 mb-2 uppercase tracking-wider">Financial Guides</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Learn & Grow Your Wealth</h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Expert guides and resources to help you understand personal finance, make informed decisions, and achieve your financial goals.
          </p>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search guides by topic or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
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
        
        {/* Results Count */}
        {searchTerm && (
          <div className="text-center text-sm text-gray-600 mt-3">
            Showing {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''} for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Guides Grid */}
      <section className="animate-slide-up mb-16">
        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <Link 
                key={guide.title} 
                href={guide.path}
                className="group block bg-white rounded-xl border border-gray-100 p-6 hover:border-green-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:bg-green-100 transition-all duration-200 mr-4">
                      <span className="text-2xl">{guide.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 mb-2 leading-tight">
                        {guide.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                      Guide
                    </span>
                    <span className="text-green-600 group-hover:text-green-700 transition-colors">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No guides found</h3>
            <p className="text-gray-600 mb-4">
              No guides match your search for "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      {/* Coming Soon Notice & Quick Actions */}
      <section className="section-spacing-sm">
        <div className="container-narrow">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-100">
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">More Guides Coming Soon</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We're working on comprehensive guides to help you navigate every aspect of personal finance. 
                Check back soon for detailed articles on tax planning, insurance, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setIsExplorerOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <span className="mr-2">🧮</span>
                  Explore Calculators
                </Button>
                <Link href="/calculators" className="bg-white text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium border border-gray-300 transition-colors duration-200 inline-flex items-center justify-center">
                  <span className="mr-2">📊</span>
                  View All Calculators
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-1">{guides.length}</div>
            <div className="text-sm text-gray-600">Expert Guides</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">34+</div>
            <div className="text-sm text-gray-600">Calculators</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-sm text-gray-600">Free Resources</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-sm text-gray-600">Expert Tips</div>
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