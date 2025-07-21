import React from 'react';
import Link from 'next/link';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Guides | WealthWise Hub",
  description: "Expert financial guides and resources to help you understand mortgages, investments, retirement planning, and personal finance.",
  keywords: ["financial guides", "mortgage guide", "investment guide", "retirement planning", "personal finance"],
  openGraph: {
    title: "Financial Guides | WealthWise Hub",
    description: "Expert financial guides and resources to help you understand mortgages, investments, retirement planning, and personal finance.",
    type: "website",
  },
};

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

export default function GuidesPage() {
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
              className="card card-hover group"
            >
              <div className="card-content">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{guide.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">{guide.title}</h3>
                </div>
                <p className="text-body-small group-hover:text-gray-600 transition-colors">{guide.description}</p>
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
              <Link href="/calculators" className="btn btn-primary">
                Explore Calculators
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}