"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CalculatorExplorer } from "@/components/ui/calculator-explorer";
import { Button } from "@/components/ui/button";
import { guides as guideContent } from "@/lib/content/guides";

const guideIcons: Record<string, string> = {
  mortgage: "Home",
  investment: "Invest",
  retirement: "Retire",
  loan: "Loan",
  budget: "Budget",
  sip: "SIP",
  emi: "EMI",
  "income-tax": "Tax",
  "mutual-funds": "Funds",
  ppf: "PPF",
  "fd-rd": "FD/RD",
  salary: "Salary",
  "emergency-fund": "Safety",
  fire: "FIRE",
  insurance: "Cover",
  "gold-investment": "Gold",
};

const guides = Object.values(guideContent).map((guide) => ({
  title: guide.title,
  description: guide.description,
  path: `/guides/${guide.slug}`,
  label: guideIcons[guide.slug] || "Guide",
}));

export function GuidesPageClient() {
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGuides = useMemo(() => {
    if (!searchTerm.trim()) return guides;

    const searchLower = searchTerm.toLowerCase();
    return guides.filter((guide) =>
      guide.title.toLowerCase().includes(searchLower) ||
      guide.description.toLowerCase().includes(searchLower)
    );
  }, [searchTerm]);

  return (
    <div className="container-wide py-6">
      <header className="text-center mb-8 animate-fade-in">
        <div className="container-narrow">
          <p className="text-sm font-medium text-green-600 mb-2 uppercase tracking-wider">Financial Guides</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Learn and Grow Your Wealth</h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Practical India-focused guides that explain the decision before you use the calculator.
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search guides by topic or keyword..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
        />
        {searchTerm && (
          <div className="text-center text-sm text-gray-600 mt-3">
            Showing {filteredGuides.length} guide{filteredGuides.length !== 1 ? "s" : ""} for "{searchTerm}"
          </div>
        )}
      </div>

      <section className="animate-slide-up mb-16">
        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <Link
                key={guide.path}
                href={guide.path}
                className="group block bg-white rounded-xl border border-gray-100 p-6 hover:border-green-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-all duration-200 mr-4">
                      <span className="text-xs font-semibold text-green-700">{guide.label}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 mb-2 leading-tight">
                      {guide.title}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed flex-1">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                      Guide
                    </span>
                    <span className="text-green-600 group-hover:text-green-700 transition-colors">Read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No guides found</h2>
            <p className="text-gray-600 mb-4">No guides match your search for "{searchTerm}"</p>
            <button onClick={() => setSearchTerm("")} className="text-green-600 hover:text-green-700 font-medium">
              Clear search
            </button>
          </div>
        )}
      </section>

      <section className="section-spacing-sm">
        <div className="container-narrow">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-100">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Use a guide with a calculator</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Each guide explains the decision framework, and each calculator turns the same idea into numbers you can compare privately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setIsExplorerOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Explore Calculators
                </Button>
                <Link href="/calculators" className="bg-white text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium border border-gray-300 transition-colors duration-200 inline-flex items-center justify-center">
                  View All Calculators
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-1">{guides.length}</div>
            <div className="text-sm text-gray-600">Reviewed Guides</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">39+</div>
            <div className="text-sm text-gray-600">Calculators</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900 mb-1">Free</div>
            <div className="text-sm text-gray-600">Resources</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900 mb-1">Private</div>
            <div className="text-sm text-gray-600">Calculations</div>
          </div>
        </div>
      </section>

      <CalculatorExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
      />
    </div>
  );
}
