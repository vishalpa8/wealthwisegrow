"use client";

import Link from 'next/link';
import { useState } from 'react';

interface Calculator {
  name: string;
  description: string;
  path: string;
  category: string;
  icon: string;
  popular?: boolean;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

const calculators: Calculator[] = [
  { name: 'Mortgage', description: 'Calculate your monthly mortgage payments with taxes and insurance.', path: '/calculators/mortgage', category: 'Loans', icon: '🏠', popular: true, difficulty: 'Medium' },
  { name: 'Loan', description: 'Calculate EMI for personal, home, car, business, and education loans.', path: '/calculators/loan', category: 'Loans', icon: '💳', popular: true, difficulty: 'Easy' },
  { name: 'Investment', description: 'Calculate future value of investments including lump sum and SIP.', path: '/calculators/investment', category: 'Investments', icon: '📈', popular: true, difficulty: 'Medium' },
  { name: 'Retirement', description: 'Plan your retirement savings and calculate required corpus.', path: '/calculators/retirement', category: 'Planning', icon: '🧓', popular: true, difficulty: 'Advanced' },
  { name: 'Budget', description: 'Create and manage your monthly budget effectively.', path: '/calculators/budget', category: 'Planning', icon: '💰', difficulty: 'Easy' },
  { name: 'PPF', description: 'Calculate returns on your Public Provident Fund investment.', path: '/calculators/ppf', category: 'Investments', icon: '🏛️', difficulty: 'Medium' },
  { name: 'FD', description: 'Calculate returns on your Fixed Deposit investments.', path: '/calculators/fd', category: 'Investments', icon: '🏦', difficulty: 'Easy' },
  { name: 'RD', description: 'Calculate returns on your Recurring Deposit investments.', path: '/calculators/rd', category: 'Investments', icon: '📅', difficulty: 'Easy' },
  { name: 'EPF', description: 'Calculate your Employee Provident Fund savings.', path: '/calculators/epf', category: 'Investments', icon: '👔', difficulty: 'Medium' },
  { name: 'Dividend Yield', description: 'Calculate dividend yield and returns on stocks.', path: '/calculators/dividend-yield', category: 'Investments', icon: '📊', difficulty: 'Medium' },
  { name: 'Gold', description: 'Calculate returns on your gold investment portfolio.', path: '/calculators/gold', category: 'Investments', icon: '🥇', difficulty: 'Medium' },
  { name: 'Income Tax', description: 'Calculate your annual income tax liability.', path: '/calculators/income-tax', category: 'Tax', icon: '📋', difficulty: 'Advanced' },
  { name: 'GST', description: 'Calculate GST on goods and services.', path: '/calculators/gst', category: 'Tax', icon: '🧾', difficulty: 'Easy' },
  { name: 'Salary', description: 'Calculate your take-home salary after deductions.', path: '/calculators/salary', category: 'Planning', icon: '💼', difficulty: 'Medium' },
  { name: 'Compound Interest', description: 'Calculate compound interest on investments and loans.', path: '/calculators/compound-interest', category: 'Investments', icon: '📈', difficulty: 'Easy' },
  { name: 'Debt Payoff', description: 'Plan strategies to pay off your debts efficiently.', path: '/calculators/debt-payoff', category: 'Planning', icon: '💸', difficulty: 'Medium' },
  { name: 'Insurance', description: 'Calculate your life and health insurance needs.', path: '/calculators/insurance', category: 'Planning', icon: '🛡️', difficulty: 'Advanced' },
];

const categories = ['All', 'Loans', 'Investments', 'Planning', 'Tax'];
const difficulties = ['All', 'Easy', 'Medium', 'Advanced'];

export function CalculatorList() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  const filteredCalculators = calculators.filter(calculator => {
    const matchesCategory = selectedCategory === 'All' || calculator.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || calculator.difficulty === selectedDifficulty;
    const matchesSearch = calculator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calculator.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPopular = !showPopularOnly || calculator.popular;
    
    return matchesCategory && matchesDifficulty && matchesSearch && matchesPopular;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container-wide">
      {/* Search and Filters */}
      <div className="mb-8 space-y-6">
        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search calculators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedDifficulty === difficulty
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>

          {/* Popular Toggle */}
          <button
            onClick={() => setShowPopularOnly(!showPopularOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              showPopularOnly
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⭐ Popular Only
          </button>
        </div>

        {/* Results Count */}
        <div className="text-center text-gray-600">
          Showing {filteredCalculators.length} of {calculators.length} calculators
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCalculators.map((calculator) => (
          <Link 
            key={calculator.name} 
            href={calculator.path}
            className="card card-hover group relative"
          >
            <div className="card-content">
              {/* Popular Badge */}
              {calculator.popular && (
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                    ⭐ Popular
                  </span>
                </div>
              )}
              
              {/* Icon and Title */}
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{calculator.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {calculator.name}
                </h3>
              </div>
              
              {/* Description */}
              <p className="text-body-small text-gray-600 group-hover:text-gray-500 transition-colors mb-4">
                {calculator.description}
              </p>
              
              {/* Tags */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {calculator.category}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(calculator.difficulty)}`}>
                  {calculator.difficulty}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredCalculators.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No calculators found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setShowPopularOnly(false);
            }}
            className="btn btn-outline"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
