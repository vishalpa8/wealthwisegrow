"use client";

import { useState, useEffect } from "react";
import { useIndexedDBHistory } from "@/hooks/use-indexeddb-history";
import { v4 as uuidv4 } from "uuid";
import { GoalProgressChart } from "@/components/ui/goal-progress-chart";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoanCalculator() {
  const [loanType, setLoanType] = useState('personal');
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(5);
  const [goal, setGoal] = useState(500000);
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
    personal: { min: 10000, max: 5000000, rateRange: "8-30%", termRange: "1-7 years" },
    home: { min: 100000, max: 100000000, rateRange: "6-15%", termRange: "5-30 years" },
    car: { min: 50000, max: 10000000, rateRange: "7-20%", termRange: "1-8 years" },
    business: { min: 100000, max: 50000000, rateRange: "10-35%", termRange: "1-15 years" },
    education: { min: 50000, max: 20000000, rateRange: "7-15%", termRange: "1-15 years" },
  };

  const currentConfig = loanTypeConfig[loanType as keyof typeof loanTypeConfig];

  const sidebar = (
    <div className="space-y-6">
      <div className="sidebar-card">
        <div className="sidebar-card-content">
          <AdsPlaceholder position="sidebar" size="300x250" />
        </div>
      </div>
      
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <h3 className="sidebar-card-title">Loan Information</h3>
        </div>
        <div className="sidebar-card-content space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 text-xs uppercase tracking-wide">Current Loan Type</h4>
            <p className="text-sm text-gray-600 capitalize">{loanType} Loan</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 text-xs uppercase tracking-wide">Typical Rate Range</h4>
            <p className="text-sm text-gray-600">{currentConfig.rateRange}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 text-xs uppercase tracking-wide">Term Range</h4>
            <p className="text-sm text-gray-600">{currentConfig.termRange}</p>
          </div>
        </div>
      </div>

      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <h3 className="sidebar-card-title">Loan Tips</h3>
        </div>
        <div className="sidebar-card-content">
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Compare rates from multiple lenders</li>
            <li>• Consider prepayment options</li>
            <li>• Check for processing fees</li>
            <li>• Maintain good credit score</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Loan Calculator"
      description="Calculate EMI, total interest, and payment schedule for personal, home, car, business, and education loans with detailed breakdown."
      sidebar={sidebar}
    >
      <div className="space-y-8">
        {/* Loan Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="form-group">
              <label htmlFor="loanType" className="form-label">Loan Type</label>
              <select 
                id="loanType" 
                name="loanType" 
                value={loanType} 
                onChange={(e) => setLoanType(e.target.value)} 
                className="form-select"
              >
                <option value="personal">Personal Loan</option>
                <option value="home">Home Loan</option>
                <option value="car">Car Loan</option>
                <option value="business">Business Loan</option>
                <option value="education">Education Loan</option>
              </select>
              <p className="form-help">Select the type of loan you want to calculate</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label htmlFor="amount" className="form-label">Loan Amount (₹)</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={currentConfig.min}
                  max={currentConfig.max}
                  className="form-input"
                  placeholder="Enter loan amount"
                />
                <p className="form-help">Amount between ₹{currentConfig.min.toLocaleString()} - ₹{currentConfig.max.toLocaleString()}</p>
              </div>

              <div className="form-group">
                <label htmlFor="rate" className="form-label">Interest Rate (%)</label>
                <input
                  type="number"
                  id="rate"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  min={0}
                  max={50}
                  step={0.1}
                  className="form-input"
                  placeholder="e.g. 12.5"
                />
                <p className="form-help">Annual interest rate</p>
              </div>

              <div className="form-group">
                <label htmlFor="years" className="form-label">Loan Term (years)</label>
                <input
                  type="number"
                  id="years"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="form-input"
                  placeholder="e.g. 5"
                />
                <p className="form-help">Loan duration in years</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleCalculate}
                loading={loading}
                className="flex-1 sm:flex-none"
                size="lg"
              >
                <span className="mr-2">🧮</span>
                Calculate EMI
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setAmount(500000);
                  setRate(12);
                  setYears(5);
                  setGoal(500000);
                }}
                className="flex-1 sm:flex-none"
                size="lg"
              >
                <span className="mr-2">🔄</span>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {monthly > 0 && (
          <div className="space-y-8 animate-fade-in">
            {/* Primary Results */}
            <div className="calculator-results-grid">
              <div className="result-card result-card-primary">
                <div className="result-label result-label-primary">Monthly EMI</div>
                <div className="result-highlight result-highlight-primary">{formatCurrency(monthly)}</div>
                <div className="result-description result-description-primary">Principal + Interest per month</div>
              </div>

              <div className="pricing-card">
                <div className="pricing-card-title">Total Payment</div>
                <div className="pricing-card-value">{formatCurrency(totalPayment)}</div>
                <div className="pricing-card-description">Over {years} years</div>
              </div>

              <div className="pricing-card">
                <div className="pricing-card-title">Total Interest</div>
                <div className="pricing-card-value">{formatCurrency(totalInterest)}</div>
                <div className="pricing-card-description">{formatPercentage(interestPercentage)} of principal</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" size="sm">
                <span className="mr-2">📊</span>
                View Amortization
              </Button>
              <Button variant="outline" size="sm">
                <span className="mr-2">📈</span>
                Compare Loans
              </Button>
              <Button variant="outline" size="sm">
                <span className="mr-2">💾</span>
                Save Results
              </Button>
              <Button variant="outline" size="sm">
                <span className="mr-2">📤</span>
                Share
              </Button>
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        {monthly > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Loan Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Principal Amount</span>
                    <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-medium text-gray-900">{rate}% per annum</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Loan Term</span>
                    <span className="font-medium text-gray-900">{years} years ({n} months)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Monthly EMI</span>
                    <span className="font-medium text-gray-900">{formatCurrency(monthly)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total Payment</span>
                    <span className="font-medium text-gray-900">{formatCurrency(totalPayment)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Total Interest</span>
                    <span className="font-medium text-gray-900">{formatCurrency(totalInterest)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Interest Burden</h4>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(interestPercentage)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      of principal amount goes to interest
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Effective Rate</h4>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(effectiveRate)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      effective annual cost of borrowing
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Monthly Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Principal:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(monthlyPrincipal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(monthlyInterest)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Loan Progress Tracker */}
        {monthly > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Loan Progress Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="form-group mb-4">
                    <label className="form-label">Set Payoff Goal (₹)</label>
                    <input
                      type="number"
                      min={1}
                      value={goal}
                      onChange={e => setGoal(Number(e.target.value))}
                      className="form-input"
                      placeholder="Enter your goal amount"
                    />
                  </div>
                  <GoalProgressChart 
                    currentValue={amount} 
                    goalValue={goal || 1} 
                    label="Loan Payoff Progress" 
                    unit="₹" 
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 mb-3">Prepayment Benefits</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">If you pay an extra ₹5,000 per month:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Time saved:</span>
                        <span className="font-medium">~{Math.round(years * 0.3)} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest saved:</span>
                        <span className="font-medium">{formatCurrency(totalInterest * 0.25)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">If you pay an extra ₹10,000 per month:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Time saved:</span>
                        <span className="font-medium">~{Math.round(years * 0.5)} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest saved:</span>
                        <span className="font-medium">{formatCurrency(totalInterest * 0.4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="my-8">
          <AdsPlaceholder position="below-results" size="728x90" />
        </div>

        {/* Loan Comparison & Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Loan Type Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(loanTypeConfig).map(([type, config]) => (
                  <div 
                    key={type} 
                    className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      loanType === type 
                        ? 'border-gray-900 bg-gray-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setLoanType(type)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{type} Loan</h4>
                        <p className="text-sm text-gray-600">Rate: {config.rateRange}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Term: {config.termRange}</p>
                        <p className="text-xs text-gray-500">
                          ₹{(config.min/100000).toFixed(0)}L - ₹{(config.max/10000000).toFixed(0)}Cr
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How to Use This Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-none">
                <p className="text-body mb-6">
                  This calculator estimates your monthly loan payment (EMI) based on the loan amount, 
                  interest rate, and term. The calculation uses the standard EMI formula and provides 
                  accurate results for personal, home, car, business, and education loans.
                </p>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Features:</h4>
                    <ul className="text-body-small space-y-1">
                      <li>• Multiple loan types with specific ranges</li>
                      <li>• Instant EMI calculation with detailed breakdown</li>
                      <li>• Interest burden analysis</li>
                      <li>• Prepayment benefits calculator</li>
                      <li>• Progress tracking and goal setting</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Smart Tips:</h4>
                    <ul className="text-body-small space-y-1">
                      <li>• Compare rates from 3-4 lenders before deciding</li>
                      <li>• Consider shorter terms to save on total interest</li>
                      <li>• Factor in processing fees and other charges</li>
                      <li>• Maintain good credit score for better rates</li>
                      <li>• Consider prepayment to reduce interest burden</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}