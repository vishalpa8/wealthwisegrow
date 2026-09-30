"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Button } from '../atoms/button';

interface Calculator {
  name: string;
  description: string;
  path: string;
  category: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimatedTime: string;
  features: string[];
}

const calculators: Calculator[] = [
  {
    name: 'Mortgage',
    description: 'Calculate your monthly mortgage payments with taxes and insurance.',
    path: '/calculators/mortgage',
    category: 'Loans',
    icon: '🏠',
    difficulty: 'Medium',
    estimatedTime: '3-5 min',
    features: ['Monthly Payment', 'Total Interest', 'Amortization Schedule', 'Tax & Insurance'],
  },
  {
    name: 'Loan',
    description: 'Calculate EMI for personal, home, car, business, and education loans.',
    path: '/calculators/loan',
    category: 'Loans',
    icon: '💳',
    difficulty: 'Easy',
    estimatedTime: '2-3 min',
    features: ['EMI Calculator', 'Multiple Loan Types', 'Interest Breakdown', 'Total Cost'],
  },
  {
    name: 'Investment',
    description: 'Calculate future value of investments including lump sum and SIP.',
    path: '/calculators/investment',
    category: 'Investments',
    icon: '📈',
    difficulty: 'Medium',
    estimatedTime: '4-6 min',
    features: ['SIP Calculator', 'Lump Sum', 'Goal Planning', 'Returns Analysis'],
  },
  {
    name: 'Retirement',
    description: 'Plan your retirement savings and calculate required corpus.',
    path: '/calculators/retirement',
    category: 'Planning',
    icon: '🧓',
    difficulty: 'Advanced',
    estimatedTime: '5-8 min',
    features: ['Corpus Calculation', 'Inflation Adjustment', 'Multiple Scenarios', 'Goal Tracking'],
  },
  {
    name: 'Budget',
    description: 'Create and manage your monthly budget effectively.',
    path: '/calculators/budget',
    category: 'Planning',
    icon: '💰',
    difficulty: 'Easy',
    estimatedTime: '3-4 min',
    features: ['Income Tracking', 'Expense Categories', 'Savings Goals', 'Budget Analysis'],
  },
  {
    name: 'Income Tax',
    description: 'Estimate Indian income tax for FY 2025-26 under the old and new regimes.',
    path: '/calculators/income-tax',
    category: 'Tax',
    icon: '📋',
    difficulty: 'Advanced',
    estimatedTime: '6-10 min',
    features: ['Tax Calculation', 'Deductions', 'Rebate & Cess', 'Regime Comparison'],
  },
];

const categories = ['All', 'Loans', 'Investments', 'Planning', 'Tax'];

const difficultyColor: Record<Calculator['difficulty'], string> = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800',
};

interface CalculatorExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalculatorExplorer({ isOpen, onClose }: CalculatorExplorerProps) {
  const [selectedCalculator, setSelectedCalculator] = useState<Calculator | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const query = searchTerm.trim().toLowerCase();
  const filteredCalculators = calculators.filter((calc) => {
    const matchesCategory = selectedCategory === 'All' || calc.category === selectedCategory;
    const matchesSearch =
      !query ||
      calc.name.toLowerCase().includes(query) ||
      calc.description.toLowerCase().includes(query) ||
      calc.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const selectCalculator = (calculator: Calculator) => {
    setSelectedCalculator(calculator);
    setPreviewVisible(false);
    setPreviewLoaded(false);
  };

  const openPreview = () => {
    setPreviewVisible(true);
    setPreviewLoaded(false);
    setPreviewKey((key) => key + 1);
  };

  const reloadPreview = () => {
    setPreviewLoaded(false);
    setPreviewKey((key) => key + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculator-explorer-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-white sm:h-[90dvh] sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="calculator-explorer-title" className="text-xl font-bold text-gray-900 sm:text-2xl">
              Explore Calculators
            </h2>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Find the right calculator for your financial needs
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Close calculator explorer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div
            className={`min-h-0 flex-1 flex-col overflow-y-auto lg:flex lg:w-[42%] lg:flex-none lg:border-r lg:border-gray-200 ${
              selectedCalculator ? 'hidden' : 'flex'
            }`}
          >
            <div className="space-y-4 border-b border-gray-100 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search calculators..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search calculators"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                {filteredCalculators.length} calculator{filteredCalculators.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="space-y-3 p-4">
              {filteredCalculators.length > 0 ? (
                filteredCalculators.map((calculator) => (
                  <button
                    type="button"
                    key={calculator.name}
                    onClick={() => selectCalculator(calculator)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      selectedCalculator?.name === calculator.name
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 text-2xl" aria-hidden="true">{calculator.icon}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{calculator.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">{calculator.description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {calculator.category}
                          </span>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${difficultyColor[calculator.difficulty]}`}>
                            {calculator.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">{calculator.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">
                    {searchTerm ? `No calculators found for "${searchTerm}"` : 'No calculators in this category'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            className={`min-h-0 flex-1 overflow-y-auto lg:block ${selectedCalculator ? 'block' : 'hidden'}`}
          >
            {selectedCalculator ? (
              <div className="space-y-5 p-4 sm:p-6">
                <button
                  type="button"
                  onClick={() => setSelectedCalculator(null)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 lg:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All calculators
                </button>

                <div className="flex items-start gap-3">
                  <span className="text-4xl" aria-hidden="true">{selectedCalculator.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {selectedCalculator.name} Calculator
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 sm:text-base">{selectedCalculator.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-2 py-1 font-medium ${difficultyColor[selectedCalculator.difficulty]}`}>
                    {selectedCalculator.difficulty}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700">
                    {selectedCalculator.category}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700">
                    {selectedCalculator.estimatedTime}
                  </span>
                </div>

                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedCalculator.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-600">
                      <span className="mr-2 text-green-500" aria-hidden="true">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={selectedCalculator.path} onClick={onClose} className="block">
                  <Button className="w-full" size="lg">
                    Open full calculator
                  </Button>
                </Link>

                {!previewVisible ? (
                  <Button type="button" variant="outline" className="w-full" size="lg" onClick={openPreview}>
                    Preview calculator
                  </Button>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2">
                      <p className="text-sm font-medium text-gray-700">Live preview</p>
                      <button
                        type="button"
                        onClick={reloadPreview}
                        className="text-sm font-medium text-blue-700 hover:text-blue-800"
                      >
                        Reload
                      </button>
                    </div>
                    <div className="relative h-[60dvh] min-h-[420px] w-full bg-white">
                      {!previewLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                          Loading calculator preview...
                        </div>
                      )}
                      <iframe
                        key={`${selectedCalculator.path}-${previewKey}`}
                        title={`${selectedCalculator.name} calculator preview`}
                        src={`${selectedCalculator.path}?embed=1`}
                        onLoad={() => setPreviewLoaded(true)}
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">Select a calculator</h3>
                  <p className="text-gray-600">Choose a calculator from the list to see its features and a live preview.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
