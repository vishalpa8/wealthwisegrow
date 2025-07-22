"use client";

import React, { useState } from 'react';
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

  return (
    <div className="container-wide py-8">
      {/* Header */}
      <header className="text-center mb-12 animate-fade-in">
        <div className="container-narrow">
          <h1 className="text-heading-1 mb-6">Financial Guides</h1>
          <p className="text-body-large">
            Expert guides and resources to help you understand personal finance, make informed decisions, and achieve your financial goals.
          </p>
        </div>
      </header>

      {/* Guides Grid */}
      <section className="animate-slide-up mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link 
              key={guide.title} 
              href={guide.path}
              className="calculator-card card card-hover group block"
            >
              <div className="card-content">
                <div className="flex-1">
                  <div className="flex items-start mb-4">
                    <span className="text-2xl mr-3 flex-shrink-0">{guide.icon}</span>
                    <h3 className="calculator-card-title group-hover:text-gray-700 transition-colors">{guide.title}</h3>
                  </div>
                  <p className="calculator-card-description group-hover:text-gray-600 transition-colors">{guide.description}</p>
                </div>
                <div className="calculator-card-footer">
                  <div className="text-center">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      Guide
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Coming Soon Notice */}
      <section className="section-spacing-sm">
        <div className="container-narrow">
          <div className="card bg-gray-50">
            <div className="card-content text-center">
              <h2 className="text-heading-3 mb-4">More Guides Coming Soon</h2>
              <p className="text-body mb-6">
                We're working on comprehensive guides to help you navigate every aspect of personal finance. 
                Check back soon for detailed articles on tax planning, insurance, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setIsExplorerOpen(true)}
                  className="btn-primary"
                >
                  <span className="mr-2">🧮</span>
                  Explore Calculators
                </Button>
                <Link href="/calculators" className="btn btn-outline">
                  <span className="mr-2">📊</span>
                  View All Calculators
                </Link>
              </div>
            </div>
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