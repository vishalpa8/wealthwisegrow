"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './button';

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
    features: ['Monthly Payment', 'Total Interest', 'Amortization Schedule', 'Tax & Insurance']
  },
  { 
    name: 'Loan', 
    description: 'Calculate EMI for personal, home, car, business, and education loans.', 
    path: '/calculators/loan', 
    category: 'Loans', 
    icon: '💳', 
    difficulty: 'Easy',
    estimatedTime: '2-3 min',
    features: ['EMI Calculator', 'Multiple Loan Types', 'Interest Breakdown', 'Prepayment Analysis']
  },
  { 
    name: 'Investment', 
    description: 'Calculate future value of investments including lump sum and SIP.', 
    path: '/calculators/investment', 
    category: 'Investments', 
    icon: '📈', 
    difficulty: 'Medium',
    estimatedTime: '4-6 min',
    features: ['SIP Calculator', 'Lump Sum', 'Goal Planning', 'Returns Analysis']
  },
  { 
    name: 'Retirement', 
    description: 'Plan your retirement savings and calculate required corpus.', 
    path: '/calculators/retirement', 
    category: 'Planning', 
    icon: '🧓', 
    difficulty: 'Advanced',
    estimatedTime: '5-8 min',
    features: ['Corpus Calculation', 'Inflation Adjustment', 'Multiple Scenarios', 'Goal Tracking']
  },
  { 
    name: 'Budget', 
    description: 'Create and manage your monthly budget effectively.', 
    path: '/calculators/budget', 
    category: 'Planning', 
    icon: '💰', 
    difficulty: 'Easy',
    estimatedTime: '3-4 min',
    features: ['Income Tracking', 'Expense Categories', 'Savings Goals', 'Budget Analysis']
  },
  { 
    name: 'Income Tax', 
    description: 'Calculate your annual income tax liability.', 
    path: '/calculators/income-tax', 
    category: 'Tax', 
    icon: '📋', 
    difficulty: 'Advanced',
    estimatedTime: '6-10 min',
    features: ['Tax Calculation', 'Deductions', 'Tax Saving', 'Regime Comparison']
  },
];

interface CalculatorExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalculatorExplorer({ isOpen, onClose }: CalculatorExplorerProps) {
  const [selectedCalculator, setSelectedCalculator] = useState<Calculator | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Loans', 'Investments', 'Planning', 'Tax'];
  
  const filteredCalculators = calculators.filter(calc => {
    const matchesCategory = selectedCategory === 'All' || calc.category === selectedCategory;
    const matchesSearch = !searchTerm.trim() || 
      calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Explore Calculators</h2>
            <p className="text-gray-600 mt-1">Find the perfect calculator for your financial needs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Calculator List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-100 space-y-4">
              {/* Search Box */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search calculators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Results count */}
              <div className="text-xs text-gray-500">
                {filteredCalculators.length} calculator{filteredCalculators.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {/* Calculator List */}
            <div className="p-4 space-y-3">
              {filteredCalculators.length > 0 ? filteredCalculators.map((calculator) => (
                <div
                  key={calculator.name}
                  onClick={() => setSelectedCalculator(calculator)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedCalculator?.name === calculator.name
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3 flex-shrink-0">{calculator.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 flex items-center flex-wrap gap-2 mb-1">
                          <span>{calculator.name}</span>
                          
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{calculator.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {calculator.category}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(calculator.difficulty)}`}>
                        {calculator.difficulty}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{calculator.estimatedTime}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? `No calculators found for "${searchTerm}"` : 'No calculators in this category'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Calculator Details */}
          <div className="w-1/2 overflow-y-auto">
            {selectedCalculator ? (
              <div className="p-6">
                {/* Calculator Header */}
                <div className="text-center mb-6">
                  <span className="text-6xl mb-4 block">{selectedCalculator.icon}</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedCalculator.name} Calculator</h3>
                  <p className="text-gray-600">{selectedCalculator.description}</p>
                </div>

                {/* Calculator Info */}
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-600">Difficulty</div>
                      <div className={`text-sm font-semibold mt-1 px-2 py-1 rounded-full inline-block ${getDifficultyColor(selectedCalculator.difficulty)}`}>
                        {selectedCalculator.difficulty}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-600">Time</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{selectedCalculator.estimatedTime}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-600">Category</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{selectedCalculator.category}</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCalculator.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link href={selectedCalculator.path} className="w-full">
                      <Button className="w-full" size="lg">
                        <span className="mr-2">🚀</span>
                        Start Calculating
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full" size="lg">
                      <span className="mr-2">👁️</span>
                      Preview Calculator
                    </Button>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tip</h4>
                    <p className="text-sm text-blue-800">
                      {selectedCalculator.difficulty === 'Easy' && "Perfect for beginners! This calculator is straightforward and easy to use."}
                      {selectedCalculator.difficulty === 'Medium' && "Requires some financial knowledge. Take your time to understand each input."}
                      {selectedCalculator.difficulty === 'Advanced' && "Complex calculator with multiple variables. Consider consulting a financial advisor for major decisions."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <div className="text-6xl mb-4">🧮</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Calculator</h3>
                  <p className="text-gray-600">Choose a calculator from the list to see detailed information and features.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}