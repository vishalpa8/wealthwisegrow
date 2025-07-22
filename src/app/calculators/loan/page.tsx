"use client";

import { useState, useEffect } from "react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";

export default function LoanCalculator() {
  const [loanType, setLoanType] = useState('personal');
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(5);
  const [loading, setLoading] = useState(false);

  // Enhanced calculations
  const n = years * 12;
  const r = rate / 100 / 12;
  const monthly = amount && rate && years
    ? (amount * r) / (1 - Math.pow(1 + r, -n))
    : 0;
  
  const totalPayment = monthly * n;
  const totalInterest = totalPayment - amount;
  
  // Additional calculations for insights
  const interestPercentage = amount > 0 ? (totalInterest / amount) * 100 : 0;
  const monthlyInterest = totalInterest / n;
  const monthlyPrincipal = monthly - monthlyInterest;
  const effectiveRate = amount > 0 ? (totalInterest / amount / years) * 100 : 0;
  
  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const { addHistory } = useIndexedDBHistory();

  // Save to history when calculation changes
  useEffect(() => {
    if (amount > 0 && rate > 0 && years > 0 && monthly > 0) {
      addHistory({
        id: uuidv4(),
        type: "loan",
        inputs: { loanType, amount, rate, years },
        results: { monthly, totalPayment, totalInterest },
        timestamp: new Date(),
        title: `${loanType} Loan Calculator`,
        notes: "",
      });
    }
  }, [loanType, amount, rate, years, monthly, addHistory]);

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const loanTypeConfig = {
    personal: { min: 10000, max: 5000000, rateRange: "8-30%", termRange: "1-7 years", icon: "👤", color: "from-blue-500 to-blue-600" },
    home: { min: 100000, max: 100000000, rateRange: "6-15%", termRange: "5-30 years", icon: "🏠", color: "from-green-500 to-green-600" },
    car: { min: 50000, max: 10000000, rateRange: "7-20%", termRange: "1-8 years", icon: "🚗", color: "from-purple-500 to-purple-600" },
    business: { min: 100000, max: 50000000, rateRange: "10-35%", termRange: "1-15 years", icon: "🏢", color: "from-orange-500 to-orange-600" },
    education: { min: 50000, max: 20000000, rateRange: "7-15%", termRange: "1-15 years", icon: "🎓", color: "from-indigo-500 to-indigo-600" },
  };

  const currentConfig = loanTypeConfig[loanType as keyof typeof loanTypeConfig];

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Loan Information</h3>
        <div className="space-y-3">
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 mb-1 text-sm">Current Type</h4>
            <p className="text-sm text-neutral-700 capitalize">{loanType} Loan</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 mb-1 text-sm">Rate Range</h4>
            <p className="text-sm text-neutral-700">{currentConfig.rateRange}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3">
            <h4 className="font-medium text-neutral-900 mb-1 text-sm">Term Range</h4>
            <p className="text-sm text-neutral-700">{currentConfig.termRange}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare rates from multiple lenders</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider prepayment options</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Check for processing fees</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Maintain good credit score</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-neutral-200 py-8">
        <div className="container-wide">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Loan Calculator
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Calculate EMI, total interest, and payment schedule for different types of loans.
            </p>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Calculator */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Calculator Form */}
              <div className="card">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Loan Details</h2>

                {/* Loan Type Selection */}
                <div className="mb-6">
                  <label className="block text-base font-medium text-neutral-900 mb-3">Choose Your Loan Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(loanTypeConfig).map(([type, config]) => (
                      <button
                        key={type}
                        onClick={() => setLoanType(type)}
                        className={`p-4 rounded-lg border transition-colors ${
                          loanType === type
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{config.icon}</div>
                        <div className="font-medium text-neutral-900 capitalize text-sm">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">Loan Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">₹</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min={currentConfig.min}
                        max={currentConfig.max}
                        className="form-input pl-8"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">Interest Rate</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        min={0}
                        max={50}
                        step={0.1}
                        className="form-input"
                        placeholder="e.g. 12.5"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">Loan Term</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        min={1}
                        max={30}
                        className="form-input"
                        placeholder="e.g. 5"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500">years</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleCalculate}
                    disabled={loading}
                    className="btn btn-primary btn-md flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span className="mr-2">🧮</span>
                        Calculate EMI
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setAmount(500000);
                      setRate(12);
                      setYears(5);
                    }}
                    className="btn btn-outline btn-md"
                  >
                    <span className="mr-2">🔄</span>
                    Reset
                  </button>
                </div>
              </div>

              {/* Results */}
              {monthly > 0 && (
                <div className="space-y-6">
                  {/* Primary Results */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="result-card bg-primary-600 text-white">
                      <div className="text-sm font-medium mb-2">Monthly EMI</div>
                      <div className="text-2xl md:text-3xl font-bold mb-2">{formatCurrency(monthly)}</div>
                      <div className="text-sm opacity-90">Principal + Interest</div>
                    </div>

                    <div className="result-card">
                      <div className="text-sm font-medium text-neutral-600 mb-2">Total Payment</div>
                      <div className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">{formatCurrency(totalPayment)}</div>
                      <div className="text-sm text-neutral-500">Over {years} years</div>
                    </div>

                    <div className="result-card">
                      <div className="text-sm font-medium text-neutral-600 mb-2">Total Interest</div>
                      <div className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">{formatCurrency(totalInterest)}</div>
                      <div className="text-sm text-neutral-500">{formatPercentage(interestPercentage)} of principal</div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="modern-card p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button className="modern-button-secondary text-sm py-3">
                        <span className="mr-2">📊</span>
                        Amortization
                      </button>
                      <button className="modern-button-secondary text-sm py-3">
                        <span className="mr-2">📈</span>
                        Compare
                      </button>
                      <button className="modern-button-secondary text-sm py-3">
                        <span className="mr-2">💾</span>
                        Save
                      </button>
                      <button className="modern-button-secondary text-sm py-3">
                        <span className="mr-2">📤</span>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Analysis */}
              {monthly > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Loan Summary */}
                  <div className="modern-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-3">📋</span>
                      Loan Summary
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Principal Amount', value: formatCurrency(amount) },
                        { label: 'Interest Rate', value: `${rate}% per annum` },
                        { label: 'Loan Term', value: `${years} years (${n} months)` },
                        { label: 'Monthly EMI', value: formatCurrency(monthly) },
                        { label: 'Total Payment', value: formatCurrency(totalPayment) },
                        { label: 'Total Interest', value: formatCurrency(totalInterest) },
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-600 font-medium">{item.label}</span>
                          <span className="font-bold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="modern-card p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-3">💡</span>
                      Key Insights
                    </h3>
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6">
                        <h4 className="font-bold text-red-900 mb-2">Interest Burden</h4>
                        <p className="text-3xl font-bold text-red-800">{formatPercentage(interestPercentage)}</p>
                        <p className="text-sm text-red-700 mt-1">of principal amount goes to interest</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                        <h4 className="font-bold text-blue-900 mb-2">Effective Rate</h4>
                        <p className="text-3xl font-bold text-blue-800">{formatPercentage(effectiveRate)}</p>
                        <p className="text-sm text-blue-700 mt-1">effective annual cost of borrowing</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6">
                        <h4 className="font-bold text-green-900 mb-3">Monthly Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-green-700">Principal:</span>
                            <span className="font-bold text-green-800">{formatCurrency(monthlyPrincipal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Interest:</span>
                            <span className="font-bold text-green-800">{formatCurrency(monthlyInterest)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="my-8">
                <AdsPlaceholder position="below-results" size="728x90" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {sidebar}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}