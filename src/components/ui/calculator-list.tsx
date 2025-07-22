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
  { name: 'Tax Calculator', description: 'Comprehensive tax calculator for income tax and other taxes.', path: '/calculators/tax', category: 'Tax', icon: '💰', difficulty: 'Advanced' },
  { name: 'Salary', description: 'Calculate your take-home salary after deductions.', path: '/calculators/salary', category: 'Planning', icon: '💼', difficulty: 'Medium' },
  { name: 'HRA', description: 'Calculate House Rent Allowance exemption and tax benefits.', path: '/calculators/hra', category: 'Tax', icon: '🏠', difficulty: 'Medium' },
  { name: 'Compound Interest', description: 'Calculate compound interest on investments and loans.', path: '/calculators/compound-interest', category: 'Investments', icon: '📈', difficulty: 'Easy' },
  { name: 'Simple Interest', description: 'Calculate simple interest on loans and investments.', path: '/calculators/simple-interest', category: 'Investments', icon: '📊', difficulty: 'Easy' },
  { name: 'Debt Payoff', description: 'Plan strategies to pay off your debts efficiently.', path: '/calculators/debt-payoff', category: 'Planning', icon: '💸', difficulty: 'Medium' },
  { name: 'Insurance', description: 'Calculate your life and health insurance needs.', path: '/calculators/insurance', category: 'Planning', icon: '🛡️', difficulty: 'Advanced' },
  { name: 'Car Loan', description: 'Calculate your car loan EMI and total interest.', path: '/calculators/car-loan', category: 'Loans', icon: '🚗', difficulty: 'Easy' },
  { name: 'Home Loan', description: 'Calculate home loan EMI with detailed breakdown.', path: '/calculators/home-loan', category: 'Loans', icon: '🏡', difficulty: 'Medium' },
  { name: 'Personal Loan', description: 'Calculate personal loan EMI and interest costs.', path: '/calculators/personal-loan', category: 'Loans', icon: '👤', difficulty: 'Easy' },
  { name: 'Education Loan', description: 'Calculate education loan EMI and repayment schedule.', path: '/calculators/education-loan', category: 'Loans', icon: '🎓', difficulty: 'Medium' },
  { name: 'Business Loan', description: 'Calculate business loan EMI and cash flow impact.', path: '/calculators/business-loan', category: 'Loans', icon: '🏢', difficulty: 'Medium' },
  { name: 'Balloon Loan', description: 'Calculate payments for balloon loans with large final payment.', path: '/calculators/balloon-loan', category: 'Loans', icon: '🎈', difficulty: 'Advanced' },
  { name: 'Mutual Fund', description: 'Calculate mutual fund returns and SIP planning.', path: '/calculators/mutual-fund', category: 'Investments', icon: '📊', difficulty: 'Medium' },
  { name: 'SIP', description: 'Calculate Systematic Investment Plan returns.', path: '/calculators/sip', category: 'Investments', icon: '📈', difficulty: 'Easy' },
  { name: 'SWP', description: 'Calculate Systematic Withdrawal Plan duration and sustainability.', path: '/calculators/swp', category: 'Investments', icon: '💵', difficulty: 'Medium' },
  { name: 'Lump Sum', description: 'Calculate lump sum investment returns.', path: '/calculators/lumpsum', category: 'Investments', icon: '💰', difficulty: 'Easy' },
  { name: 'Savings', description: 'Plan your savings strategy with goal-based calculations.', path: '/calculators/savings', category: 'Planning', icon: '💶', difficulty: 'Easy' },
  { name: 'ROI', description: 'Calculate Return on Investment for projects and investments.', path: '/calculators/roi', category: 'Investments', icon: '📉', difficulty: 'Medium' },
  { name: 'Break-even', description: 'Calculate break-even point for business and projects.', path: '/calculators/break-even', category: 'Planning', icon: '⚖️', difficulty: 'Medium' },
  { name: 'Education Goal', description: 'Plan and calculate savings for children\'s education expenses.', path: '/calculators/education-goal', category: 'Planning', icon: '🎓', difficulty: 'Medium' },
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
    <div className="w-full">
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search calculators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {/* Category Filter */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
          
          {/* Difficulty Filter */}
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDifficulty === difficulty
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {difficulty}
            </button>
          ))}

          {/* Popular Toggle */}
          <button
            onClick={() => setShowPopularOnly(!showPopularOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPopularOnly
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⭐ Popular
          </button>
        </div>

        {/* Results Count */}
        <div className="text-center text-sm text-gray-600">
          Showing {filteredCalculators.length} of {calculators.length} calculators
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 xl:gap-6 items-start">
        {filteredCalculators.map((calculator) => (
          <Link 
            key={calculator.name} 
            href={calculator.path}
            className="calculator-card group block bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 w-full max-w-[300px] mx-auto"
          >
            <div className="calculator-card-content p-6 flex flex-col min-h-[240px]">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl flex-shrink-0">{calculator.icon}</span>
                <div className="flex flex-col flex-grow min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="calculator-card-title text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors flex-1 min-w-0 line-clamp-2 leading-tight">
                      {calculator.name}
                    </h3>
                    {calculator.popular && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        ⭐
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="calculator-card-description text-gray-600 text-sm leading-relaxed group-hover:text-gray-500 transition-colors line-clamp-3 overflow-hidden mb-4 flex-1">
                {calculator.description}
              </p>
              <div className="calculator-card-footer flex items-center flex-wrap gap-2 mt-auto">
                <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700 whitespace-nowrap">
                  {calculator.category}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${getDifficultyColor(calculator.difficulty)}`}> 
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
