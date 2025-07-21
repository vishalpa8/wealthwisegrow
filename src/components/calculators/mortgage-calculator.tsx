"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { formatLargeCurrency, formatLargeNumber } from "@/lib/utils/number-format";

interface MortgageInputs {
  principal: number;
  downPayment: number;
  rate: number;
  years: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
}

const initialValues: MortgageInputs = {
  principal: 500000,
  downPayment: 100000,
  rate: 7.5,
  years: 30,
  propertyTax: 6000,
  insurance: 1500,
  pmi: 0,
};

function calculateMortgage(inputs: MortgageInputs) {
  const { principal, downPayment, rate, years, propertyTax, insurance, pmi } = inputs;
  
  const loanAmount = Math.max(0, principal - downPayment);
  
  // Handle cases where rate or years might be zero
  let monthlyPI = 0;
  if (rate > 0 && years > 0) {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    
    // Monthly principal and interest (only calculate if rate and years are positive)
    monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                    (Math.pow(1 + monthlyRate, numPayments) - 1);
  } else if (years > 0) {
    // If rate is zero but years is not, divide loan by number of months
    monthlyPI = loanAmount / (years * 12);
  }
  
  // If monthlyPI is NaN or infinite, set it to zero
  if (isNaN(monthlyPI) || !isFinite(monthlyPI)) {
    monthlyPI = 0;
  }
  
  // Monthly escrow amounts
  const monthlyPropertyTax = propertyTax > 0 ? propertyTax / 12 : 0;
  const monthlyInsurance = insurance > 0 ? insurance / 12 : 0;
  const monthlyPMI = pmi > 0 ? pmi / 12 : 0;
  
  // Total monthly payment
  const monthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI;
  
  // Total amounts
  const numPayments = years * 12;
  const totalPayment = monthlyPI * numPayments;
  const totalInterest = totalPayment - loanAmount;
  
  // Loan-to-value ratio (prevent division by zero)
  const loanToValue = principal > 0 ? (loanAmount / principal) * 100 : 0;
  
  return {
    monthlyPayment,
    monthlyPrincipalAndInterest: monthlyPI,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPMI,
    totalPayment,
    totalInterest,
    loanAmount,
    loanToValue,
  };
}

export function MortgageCalculator() {
  const [values, setValues] = useState<MortgageInputs>(initialValues);
  const [loading, setLoading] = useState(false);

  const results = useMemo(() => {
    // Allow zero values to be used in calculations
    if (values.principal >= 0 && values.rate >= 0 && values.years >= 0) {
      return calculateMortgage(values);
    }
    return null;
  }, [values]);

  const handleInputChange = (field: keyof MortgageInputs, value: number) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const formatCurrency = (amount: number) => {
    // For large numbers, use our utility function to prevent overflow
    if (amount >= 1000) {
      return formatLargeCurrency(amount);
    }
    
    // For smaller numbers, use full formatting
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const sidebar = (
    <div className="space-y-6">
      <div className="sidebar-card">
        <div className="sidebar-card-content">
          <AdsPlaceholder position="sidebar" size="300x250" />
        </div>
      </div>
      
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <h3 className="sidebar-card-title flex items-center">
            <span className="text-base mr-2">🏠</span>
            Mortgage Info
          </h3>
        </div>
        <div className="sidebar-card-content">
          {results && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-3 text-xs uppercase tracking-wide">Payment Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Principal & Interest:</span>
                    <span className="font-medium text-gray-900 text-right">{formatCurrency(results.monthlyPrincipalAndInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Property Tax:</span>
                    <span className="font-medium text-gray-900 text-right">{formatCurrency(results.monthlyPropertyTax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Insurance:</span>
                    <span className="font-medium text-gray-900 text-right">{formatCurrency(results.monthlyInsurance)}</span>
                  </div>
                  {results.monthlyPMI > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">PMI:</span>
                      <span className="font-medium text-gray-900 text-right">{formatCurrency(results.monthlyPMI)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-semibold text-gray-900">
                    <span>Total Monthly:</span>
                    <span className="text-right">{formatCurrency(results.monthlyPayment)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <h3 className="sidebar-card-title">Mortgage Tips</h3>
        </div>
        <div className="sidebar-card-content">
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 20% down payment avoids PMI</li>
            <li>• Compare rates from multiple lenders</li>
            <li>• Consider 15-year vs 30-year terms</li>
            <li>• Factor in closing costs</li>
            <li>• Get pre-approved before house hunting</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Get detailed payment breakdowns and loan summaries to make informed home buying decisions."
      sidebar={sidebar}
    >
      <div className="space-y-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Mortgage Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Home Price (₹)</label>
                <input
                  type="number"
                  value={values.principal}
                  onChange={(e) => handleInputChange('principal', Number(e.target.value))}
                  className="form-input"
                  placeholder="5,00,000"
                />
                <p className="form-help">Total purchase price of the home</p>
              </div>

              <div className="form-group">
                <label className="form-label">Down Payment (₹)</label>
                <input
                  type="number"
                  value={values.downPayment}
                  onChange={(e) => handleInputChange('downPayment', Number(e.target.value))}
                  className="form-input"
                  placeholder="1,00,000"
                />
                <p className="form-help">Amount paid upfront (typically 10-20%)</p>
              </div>

              <div className="form-group">
                <label className="form-label">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={values.rate}
                  onChange={(e) => handleInputChange('rate', Number(e.target.value))}
                  className="form-input"
                  placeholder="7.5"
                />
                <p className="form-help">Annual interest rate</p>
              </div>

              <div className="form-group">
                <label className="form-label">Loan Term (years)</label>
                <input
                  type="number"
                  value={values.years}
                  onChange={(e) => handleInputChange('years', Number(e.target.value))}
                  className="form-input"
                  placeholder="30"
                />
                <p className="form-help">Length of the mortgage</p>
              </div>

              <div className="form-group">
                <label className="form-label">Annual Property Tax (₹)</label>
                <input
                  type="number"
                  value={values.propertyTax}
                  onChange={(e) => handleInputChange('propertyTax', Number(e.target.value))}
                  className="form-input"
                  placeholder="6,000"
                />
                <p className="form-help">Yearly property tax amount</p>
              </div>

              <div className="form-group">
                <label className="form-label">Annual Home Insurance (₹)</label>
                <input
                  type="number"
                  value={values.insurance}
                  onChange={(e) => handleInputChange('insurance', Number(e.target.value))}
                  className="form-input"
                  placeholder="1,500"
                />
                <p className="form-help">Yearly homeowner's insurance</p>
              </div>
            </div>

            <Button 
              onClick={handleCalculate}
              loading={loading}
              className="w-full md:w-auto"
              size="lg"
            >
              Calculate Mortgage
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6 animate-fade-in">
            <div className="calculator-results-grid">
              <div className="result-card result-card-primary">
                <div className="result-label result-label-primary">Monthly Payment</div>
                <div className="result-highlight result-highlight-primary">{formatCurrency(results.monthlyPayment)}</div>
                <div className="result-description result-description-primary">Principal, Interest, Tax & Insurance</div>
              </div>

              <div className="pricing-card">
                <div className="pricing-card-title">Total Interest</div>
                <div className="pricing-card-value">{formatCurrency(results.totalInterest)}</div>
                <div className="pricing-card-description">Over {values.years} years</div>
              </div>

              <div className="pricing-card">
                <div className="pricing-card-title">Loan Amount</div>
                <div className="pricing-card-value">{formatCurrency(results.loanAmount)}</div>
                <div className="pricing-card-description">LTV: {formatPercentage(results.loanToValue)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Home Price</span>
                      <span className="font-medium text-gray-900">{formatCurrency(values.principal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Down Payment</span>
                      <span className="font-medium text-gray-900">{formatCurrency(values.downPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Loan Amount</span>
                      <span className="font-medium text-gray-900">{formatCurrency(results.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Interest Rate</span>
                      <span className="font-medium text-gray-900">{values.rate}% per annum</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Loan Term</span>
                      <span className="font-medium text-gray-900">{values.years} years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Loan-to-Value Ratio</h4>
                      <p className="text-2xl font-bold text-gray-900">{formatPercentage(results.loanToValue)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {results.loanToValue > 80 ? "PMI may be required" : "No PMI required"}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Interest vs Principal</h4>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPercentage((results.totalInterest / results.totalPayment) * 100)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        of total payments go to interest
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="my-8">
          <AdsPlaceholder position="below-results" size="728x90" />
        </div>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>Understanding Your Mortgage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-none">
              <p className="text-body mb-6">
                This mortgage calculator helps you estimate your monthly payment including principal, 
                interest, property taxes, and insurance. Use it to compare different loan scenarios 
                and find the right mortgage for your budget.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Key Components:</h4>
                  <ul className="text-body-small space-y-2">
                    <li><strong>Principal:</strong> The loan amount</li>
                    <li><strong>Interest:</strong> Cost of borrowing money</li>
                    <li><strong>Property Tax:</strong> Annual tax on your home</li>
                    <li><strong>Insurance:</strong> Homeowner's insurance premium</li>
                    <li><strong>PMI:</strong> Required if down payment &lt; 20%</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tips for Buyers:</h4>
                  <ul className="text-body-small space-y-2">
                    <li>• Aim for 20% down payment to avoid PMI</li>
                    <li>• Consider 15-year loans for less total interest</li>
                    <li>• Shop around for the best interest rates</li>
                    <li>• Factor in closing costs (2-5% of home price)</li>
                    <li>• Get pre-approved to strengthen your offer</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
}