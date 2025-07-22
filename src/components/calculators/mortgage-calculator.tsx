"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { NumericInput } from "@/components/ui/numeric-input";
import { useCurrency } from "@/contexts/currency-context";
import { calculateMortgage } from "@/lib/calculations/mortgage";
import type { MortgageInputs } from "@/lib/validations/calculator";
import { roundToPrecision } from "@/lib/utils/number";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Using the MortgageInputs type from the validation schema

const initialValues: MortgageInputs = {
  principal: 500000,
  downPayment: 100000,
  rate: 7.5,
  years: 30,
  propertyTax: 6000,
  insurance: 1500,
  pmi: 0,
};

// Using the mortgage calculator from the calculations utility

export function MortgageCalculator() {
  const [values, setValues] = useState<MortgageInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [suggestedDownPayment, setSuggestedDownPayment] = useState<number>(0);

  const results = useMemo(() => {
    try {
      // Allow zero values to be used in calculations
      if (values.principal >= 0 && values.rate >= 0 && values.years >= 0) {
        return calculateMortgage(values);
      }
    } catch (error) {
      console.error('Error calculating mortgage:', error);
    }
    return null;
  }, [values]);

  const handleInputChange = (field: keyof MortgageInputs, value: number | null) => {
    // Clear validation error for this field when the user changes the input
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
    
    const numericValue = value === null ? 0 : value;
    
    // If user is changing principal, calculate suggested 20% down payment
    if (field === 'principal' && numericValue > 0) {
      const suggested = roundToPrecision(numericValue * 0.2, 2);
      setSuggestedDownPayment(suggested);
      setShowSuggestion(true);
    }
    
    setValues(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const handleCalculate = () => {
    setLoading(true);
    // Reset validation errors
    setValidationErrors({});
    
    // Validate inputs
    const errors: Record<string, string> = {};
    
    // Principal validation
    if (values.principal <= 0) {
      errors.principal = "Home price must be greater than 0";
    } else if (values.principal > 1e15) {
      errors.principal = "Home price is too large";
    }
    
    // Down payment validation
    if (values.downPayment < 0) {
      errors.downPayment = "Down payment can't be negative";
    } else if (values.downPayment >= values.principal) {
      errors.downPayment = "Down payment can't exceed home price";
    }
    
    // Interest rate validation
    if (values.rate < 0) {
      errors.rate = "Interest rate can't be negative";
    } else if (values.rate > 50) {
      errors.rate = "Interest rate is too high";
    }
    
    // Years validation
    if (values.years <= 0) {
      errors.years = "Loan term must be at least 1 year";
    } else if (values.years > 50) {
      errors.years = "Loan term can't exceed 50 years";
    }
    
    // Property tax validation
    if (values.propertyTax < 0) {
      errors.propertyTax = "Property tax can't be negative";
    }
    
    // Insurance validation
    if (values.insurance < 0) {
      errors.insurance = "Insurance amount can't be negative";
    }
    
    // PMI validation
    if (values.pmi < 0) {
      errors.pmi = "PMI amount can't be negative";
    }
    
    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }
    
    // Add a small delay for UI feedback
    setTimeout(() => {
      try {
        // This will trigger a re-render with the updated results
        setValues({...values});
      } catch (error) {
        console.error('Error calculating mortgage:', error);
        setValidationErrors({
          general: "An error occurred while calculating the mortgage. Please check your inputs."
        });
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const { formatCurrency, currency } = useCurrency();

  const formatPercentage = (value: number) => {
    return `${roundToPrecision(value, 2).toFixed(2)}%`;
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
              <NumericInput
                label="Home Price"
                value={values.principal}
                onValueChange={(value) => handleInputChange('principal', value)}
                placeholder="500000"
                helpText="Total purchase price of the home"
                showCurrencySymbol
                decimalPlaces={2}
                min={0}
                allowZero={false}
                isValid={!validationErrors.principal}
                errorText={validationErrors.principal}
              />

              <div className="space-y-1">
                <NumericInput
                  label="Down Payment"
                  value={values.downPayment}
                  onValueChange={(value) => handleInputChange('downPayment', value)}
                  placeholder="100000"
                  helpText="Amount paid upfront (typically 10-20%)"
                  showCurrencySymbol
                  decimalPlaces={2}
                  min={0}
                  allowZero={true}
                  isValid={!validationErrors.downPayment}
                  errorText={validationErrors.downPayment}
                />
                {showSuggestion && (
                  <div className="flex justify-between items-center mt-1 text-xs text-blue-600">
                    <span>Suggested 20% down payment: {formatCurrency(suggestedDownPayment)}</span>
                    <button 
                      className="text-blue-700 hover:text-blue-900 font-medium"
                      onClick={() => {
                        handleInputChange('downPayment', suggestedDownPayment);
                        setShowSuggestion(false);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <NumericInput
                label="Interest Rate"
                value={values.rate}
                onValueChange={(value) => handleInputChange('rate', value)}
                placeholder="7.5"
                helpText="Annual interest rate"
                decimalPlaces={3}
                min={0}
                max={50}
                allowZero={true}
                isValid={!validationErrors.rate}
                errorText={validationErrors.rate}
              />

              <NumericInput
                label="Loan Term"
                value={values.years}
                onValueChange={(value) => handleInputChange('years', value)}
                placeholder="30"
                helpText="Length of the mortgage in years"
                decimalPlaces={0}
                min={1}
                max={50}
                isValid={!validationErrors.years}
                errorText={validationErrors.years}
              />

              <NumericInput
                label="Annual Property Tax"
                value={values.propertyTax}
                onValueChange={(value) => handleInputChange('propertyTax', value)}
                placeholder="6000"
                helpText="Yearly property tax amount"
                showCurrencySymbol
                decimalPlaces={2}
                min={0}
                allowZero={true}
                isValid={!validationErrors.propertyTax}
                errorText={validationErrors.propertyTax}
              />

              <NumericInput
                label="Annual Home Insurance"
                value={values.insurance}
                onValueChange={(value) => handleInputChange('insurance', value)}
                placeholder="1500"
                helpText="Yearly homeowner's insurance"
                showCurrencySymbol
                decimalPlaces={2}
                min={0}
                allowZero={true}
                isValid={!validationErrors.insurance}
                errorText={validationErrors.insurance}
              />
              
              <NumericInput
                label="Private Mortgage Insurance (PMI)"
                value={values.pmi}
                onValueChange={(value) => handleInputChange('pmi', value)}
                placeholder="0"
                helpText="Annual PMI (if down payment < 20%)"
                showCurrencySymbol
                decimalPlaces={2}
                min={0}
                allowZero={true}
                isValid={!validationErrors.pmi}
                errorText={validationErrors.pmi}
              />
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleCalculate}
                loading={loading}
                className="w-full md:w-auto"
                size="lg"
              >
                Calculate Mortgage
              </Button>
              
              {validationErrors.general && (
                <div className="text-red-500 text-sm mt-2">{validationErrors.general}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-4 text-center sm:col-span-3">
                <div className="text-sm text-primary-700 font-medium mb-1">Monthly Payment</div>
                <div className="text-3xl font-bold text-primary-900 mb-1">{formatCurrency(results.monthlyPayment)}</div>
                <div className="text-xs text-primary-700">Principal, Interest, Tax & Insurance</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1">Total Interest</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(results.totalInterest)}</div>
                <div className="text-xs text-gray-500">Over {values.years} years</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-500 font-medium mb-1">Loan Amount</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(results.loanAmount)}</div>
                <div className="text-xs text-gray-500">LTV: {formatPercentage(results.loanToValue)}</div>
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

        {/* Amortization Schedule */}
        {results && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Mortgage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="py-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Payment Distribution</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Principal</span>
                            <span className="font-semibold">
                              {formatCurrency(results.loanAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Interest</span>
                            <span className="font-semibold">
                              {formatCurrency(results.totalInterest)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span>Total Cost</span>
                            <span className="font-semibold">
                              {formatCurrency(results.totalPayment)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Monthly Payment</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Principal & Interest</span>
                            <span className="font-semibold">
                              {formatCurrency(results.monthlyPrincipalAndInterest)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Property Tax</span>
                            <span className="font-semibold">
                              {formatCurrency(results.monthlyPropertyTax)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Insurance</span>
                            <span className="font-semibold">
                              {formatCurrency(results.monthlyInsurance)}
                            </span>
                          </div>
                          {results.monthlyPMI > 0 && (
                            <div className="flex justify-between">
                              <span>PMI</span>
                              <span className="font-semibold">
                                {formatCurrency(results.monthlyPMI)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span>Total Monthly Payment</span>
                            <span className="font-semibold">
                              {formatCurrency(results.monthlyPayment)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="schedule" className="py-4">
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[600px]">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left font-medium">Year</th>
                            <th className="px-4 py-2 text-right font-medium">Payment</th>
                            <th className="px-4 py-2 text-right font-medium">Principal</th>
                            <th className="px-4 py-2 text-right font-medium">Interest</th>
                            <th className="px-4 py-2 text-right font-medium">Remaining Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.paymentSchedule
                            .filter((item, index) => {
                              // Show only year-end entries unless showFullSchedule is true
                              return showFullSchedule || (item.month % 12 === 0 || 
                                index === results.paymentSchedule.length - 1);
                            })
                            .map((item) => {
                              const year = Math.ceil(item.month / 12);
                              return (
                                <tr key={item.month} className="border-b border-gray-100">
                                  <td className="px-4 py-2">{year}</td>
                                  <td className="px-4 py-2 text-right">{formatCurrency(item.payment)}</td>
                                  <td className="px-4 py-2 text-right">{formatCurrency(item.principal)}</td>
                                  <td className="px-4 py-2 text-right">{formatCurrency(item.interest)}</td>
                                  <td className="px-4 py-2 text-right">{formatCurrency(item.balance)}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowFullSchedule(!showFullSchedule)}
                      >
                        {showFullSchedule ? "Show Yearly Summary" : "Show Monthly Details"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
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