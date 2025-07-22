"use client";

import { useMemo, useState } from "react";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateMortgage } from "@/lib/calculations/mortgage";
import type { MortgageInputs } from "@/lib/validations/calculator";
import { roundToPrecision } from "@/lib/utils/number";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialValues: MortgageInputs = {
  principal: 500000,
  downPayment: 100000,
  rate: 7.5,
  years: 30,
  propertyTax: 6000,
  insurance: 1500,
  pmi: 0,
};

export function MortgageCalculator() {
  const [values, setValues] = useState<MortgageInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [suggestedDownPayment, setSuggestedDownPayment] = useState<number>(0);
  const [currentStep] = useState(1);

  const results = useMemo(() => {
    try {
      setValidationErrors({});
      if (values.principal >= 0 && values.rate >= 0 && values.years >= 0) {
        return calculateMortgage(values);
      }
    } catch (error) {
      console.error("Error calculating mortgage:", error);
    }
    return null;
  }, [values]);

  const handleInputChange = (
    field: keyof MortgageInputs,
    value: number | null
  ) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    const numericValue = value === null ? 0 : value;

    if (field === "principal" && numericValue > 0) {
      const suggested = roundToPrecision(numericValue * 0.2, 2);
      setSuggestedDownPayment(suggested);
      setShowSuggestion(true);
    }

    setValues((prev) => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  const handleCalculate = () => {
    setLoading(true);
    setValidationErrors({});

    const errors: Record<string, string> = {};

    if (values.principal <= 0) {
      errors.principal = "Home price must be greater than 0";
    }

    if (values.downPayment < 0) {
      errors.downPayment = "Down payment can't be negative";
    } else if (values.downPayment >= values.principal) {
      errors.downPayment = "Down payment can't exceed home price";
    }

    if (values.rate < 0) {
      errors.rate = "Interest rate can't be negative";
    }

    if (values.years <= 0) {
      errors.years = "Loan term must be at least 1 year";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const { formatCurrency } = useCurrency();

  const formatPercentage = (value: number) => {
    return `${roundToPrecision(value, 2).toFixed(2)}%`;
  };

  const sidebar = (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>

      <div className="modern-card p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🏠</span>
          <h3 className="text-lg font-bold text-gray-900">Mortgage Info</h3>
        </div>
        {results && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-3 text-sm uppercase tracking-wide">
                Payment Breakdown
              </h4>
              <div className="space-y-3">
                {[
                  {
                    label: "Principal & Interest",
                    value: results.monthlyPrincipalAndInterest,
                  },
                  { label: "Property Tax", value: results.monthlyPropertyTax },
                  { label: "Insurance", value: results.monthlyInsurance },
                  ...(results.monthlyPMI > 0
                    ? [{ label: "PMI", value: results.monthlyPMI }]
                    : []),
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-blue-700 text-sm">{item.label}:</span>
                    <span className="font-bold text-blue-800 text-sm">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-blue-200 pt-3 flex justify-between items-center font-bold text-blue-900">
                  <span>Total Monthly:</span>
                  <span>{formatCurrency(results.monthlyPayment)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="modern-card p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">💡</span>
          <h3 className="text-lg font-bold text-gray-900">Mortgage Tips</h3>
        </div>
        <div className="space-y-3">
          {[
            "20% down payment avoids PMI",
            "Compare rates from multiple lenders",
            "Consider 15-year vs 30-year terms",
            "Factor in closing costs",
            "Get pre-approved before house hunting",
          ].map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="text-green-500 text-lg">✓</span>
              <p className="text-sm text-gray-600">{tip}</p>
            </div>
          ))}
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
              Mortgage Calculator
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI.
            </p>
          </div>
        </div>
      </div>

      <div className="container-content-heavy py-12">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Main Calculator */}
          <div className="xl:col-span-3">
            <div className="space-y-8">
              {/* Step Progress */}
              <div className="modern-card p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Mortgage Details
                  </h2>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4].map((stepNum) => (
                      <div
                        key={stepNum}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          stepNum <= currentStep
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Home Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        value={values.principal}
                        onChange={(e) =>
                          handleInputChange("principal", Number(e.target.value))
                        }
                        className="modern-input pl-8"
                        placeholder="500,000"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Total purchase price of the home
                    </p>
                    {validationErrors.principal && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.principal}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Down Payment
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        value={values.downPayment}
                        onChange={(e) =>
                          handleInputChange(
                            "downPayment",
                            Number(e.target.value)
                          )
                        }
                        className="modern-input pl-8"
                        placeholder="100,000"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Amount paid upfront (typically 10-20%)
                    </p>
                    {showSuggestion && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          Suggested 20% down payment:{" "}
                          {formatCurrency(suggestedDownPayment)}
                        </p>
                        <button
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-1"
                          onClick={() => {
                            handleInputChange(
                              "downPayment",
                              suggestedDownPayment
                            );
                            setShowSuggestion(false);
                          }}
                        >
                          Apply Suggestion
                        </button>
                      </div>
                    )}
                    {validationErrors.downPayment && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.downPayment}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Interest Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={values.rate}
                        onChange={(e) =>
                          handleInputChange("rate", Number(e.target.value))
                        }
                        className="modern-input"
                        placeholder="7.5"
                        step="0.001"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        %
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Annual interest rate
                    </p>
                    {validationErrors.rate && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.rate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Loan Term
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={values.years}
                        onChange={(e) =>
                          handleInputChange("years", Number(e.target.value))
                        }
                        className="modern-input"
                        placeholder="30"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        years
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Length of the mortgage
                    </p>
                    {validationErrors.years && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.years}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Annual Property Tax
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        value={values.propertyTax}
                        onChange={(e) =>
                          handleInputChange(
                            "propertyTax",
                            Number(e.target.value)
                          )
                        }
                        className="modern-input pl-8"
                        placeholder="6,000"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Yearly property tax amount
                    </p>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Annual Home Insurance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        value={values.insurance}
                        onChange={(e) =>
                          handleInputChange("insurance", Number(e.target.value))
                        }
                        className="modern-input pl-8"
                        placeholder="1,500"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Yearly homeowner's insurance
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleCalculate}
                    disabled={loading}
                    className="modern-button-primary w-full md:w-auto min-w-[200px] flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span className="mr-2">🏠</span>
                        Calculate Mortgage
                      </>
                    )}
                  </button>

                  {validationErrors.general && (
                    <div className="text-red-500 text-sm mt-2">
                      {validationErrors.general}
                    </div>
                  )}
                </div>
              </div>

              {/* Results */}
              {results && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="modern-result-primary animate-float">
                      <div className="text-sm font-medium opacity-90 mb-2 uppercase tracking-wide">
                        Monthly Payment
                      </div>
                      <div className="text-3xl md:text-4xl font-bold mb-2">
                        {formatCurrency(results.monthlyPayment)}
                      </div>
                      <div className="text-sm opacity-80">
                        Principal, Interest, Tax & Insurance
                      </div>
                    </div>

                    <div className="modern-result-card text-center">
                      <div className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">
                        Total Interest
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {formatCurrency(results.totalInterest)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Over {values.years} years
                      </div>
                    </div>

                    <div className="modern-result-card text-center">
                      <div className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">
                        Loan Amount
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {formatCurrency(values.principal - values.downPayment)}
                      </div>
                      <div className="text-sm text-gray-500">
                        LTV: {formatPercentage(results.loanToValue)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="modern-card p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="mr-3">📋</span>
                        Loan Summary
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            label: "Home Price",
                            value: formatCurrency(values.principal),
                          },
                          {
                            label: "Down Payment",
                            value: formatCurrency(values.downPayment),
                          },
                          {
                            label: "Loan Amount",
                            value: formatCurrency(
                              values.principal - values.downPayment
                            ),
                          },
                          {
                            label: "Interest Rate",
                            value: `${values.rate}% per annum`,
                          },
                          {
                            label: "Loan Term",
                            value: `${values.years} years`,
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                          >
                            <span className="text-gray-600 font-medium">
                              {item.label}
                            </span>
                            <span className="font-bold text-gray-900">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="modern-card p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="mr-3">💡</span>
                        Key Insights
                      </h3>
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                          <h4 className="font-bold text-blue-900 mb-2">
                            Loan-to-Value Ratio
                          </h4>
                          <p className="text-3xl font-bold text-blue-800">
                            {formatPercentage(results.loanToValue)}
                          </p>
                          <p className="text-sm text-blue-700 mt-1">
                            {results.loanToValue > 80
                              ? "PMI may be required"
                              : "No PMI required"}
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
                          <h4 className="font-bold text-purple-900 mb-2">
                            Interest vs Principal
                          </h4>
                          <p className="text-3xl font-bold text-purple-800">
                            {formatPercentage(
                              (results.totalInterest / results.totalPayment) *
                                100
                            )}
                          </p>
                          <p className="text-sm text-purple-700 mt-1">
                            of total payments go to interest
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Amortization Schedule */}
              {results && (
                <div className="modern-card p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="mr-3">📊</span>
                    Mortgage Breakdown
                  </h3>
                  <Tabs
                    defaultValue="overview"
                    value={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="overview" className="text-lg py-3">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="schedule" className="text-lg py-3">
                        Amortization Schedule
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                          <h4 className="font-bold text-gray-900 mb-4">
                            Payment Distribution
                          </h4>
                          <div className="space-y-4">
                            {[
                              {
                                label: "Principal",
                                value: formatCurrency(
                                  values.principal - values.downPayment
                                ),
                              },
                              {
                                label: "Total Interest",
                                value: formatCurrency(results.totalInterest),
                              },
                              {
                                label: "Total Cost",
                                value: formatCurrency(results.totalPayment),
                                highlight: true,
                              },
                            ].map((item, index) => (
                              <div
                                key={index}
                                className={`flex justify-between ${
                                  item.highlight
                                    ? "border-t border-gray-300 pt-4 font-bold"
                                    : ""
                                }`}
                              >
                                <span
                                  className={
                                    item.highlight
                                      ? "text-gray-900"
                                      : "text-gray-600"
                                  }
                                >
                                  {item.label}
                                </span>
                                <span
                                  className={`font-semibold ${
                                    item.highlight
                                      ? "text-gray-900"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                          <h4 className="font-bold text-blue-900 mb-4">
                            Monthly Payment
                          </h4>
                          <div className="space-y-4">
                            {[
                              {
                                label: "Principal & Interest",
                                value: formatCurrency(
                                  results.monthlyPrincipalAndInterest
                                ),
                              },
                              {
                                label: "Property Tax",
                                value: formatCurrency(
                                  results.monthlyPropertyTax
                                ),
                              },
                              {
                                label: "Insurance",
                                value: formatCurrency(results.monthlyInsurance),
                              },
                              ...(results.monthlyPMI > 0
                                ? [
                                    {
                                      label: "PMI",
                                      value: formatCurrency(results.monthlyPMI),
                                    },
                                  ]
                                : []),
                              {
                                label: "Total Monthly Payment",
                                value: formatCurrency(results.monthlyPayment),
                                highlight: true,
                              },
                            ].map((item, index) => (
                              <div
                                key={index}
                                className={`flex justify-between ${
                                  item.highlight
                                    ? "border-t border-blue-300 pt-4 font-bold"
                                    : ""
                                }`}
                              >
                                <span
                                  className={
                                    item.highlight
                                      ? "text-blue-900"
                                      : "text-blue-700"
                                  }
                                >
                                  {item.label}
                                </span>
                                <span
                                  className={`font-semibold ${
                                    item.highlight
                                      ? "text-blue-900"
                                      : "text-blue-800"
                                  }`}
                                >
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="schedule" className="py-4">
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[600px]">
                            <thead>
                              <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                                <th className="px-4 py-3 text-left font-bold text-gray-900 rounded-l-lg">
                                  Year
                                </th>
                                <th className="px-4 py-3 text-right font-bold text-gray-900">
                                  Payment
                                </th>
                                <th className="px-4 py-3 text-right font-bold text-gray-900">
                                  Principal
                                </th>
                                <th className="px-4 py-3 text-right font-bold text-gray-900">
                                  Interest
                                </th>
                                <th className="px-4 py-3 text-right font-bold text-gray-900 rounded-r-lg">
                                  Balance
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.paymentSchedule
                                .filter((item, index) => {
                                  return (
                                    showFullSchedule ||
                                    item.month % 12 === 0 ||
                                    index === results.paymentSchedule.length - 1
                                  );
                                })
                                .map((item, index) => {
                                  const year = Math.ceil(item.month / 12);
                                  return (
                                    <tr
                                      key={item.month}
                                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                        index % 2 === 0
                                          ? "bg-white"
                                          : "bg-gray-50/50"
                                      }`}
                                    >
                                      <td className="px-4 py-3 font-medium text-gray-900">
                                        {year}
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                                        {formatCurrency(item.payment)}
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                                        {formatCurrency(item.principal)}
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                                        {formatCurrency(item.interest)}
                                      </td>
                                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                                        {formatCurrency(item.balance)}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-center mt-6">
                          <button
                            onClick={() =>
                              setShowFullSchedule(!showFullSchedule)
                            }
                            className="modern-button-secondary"
                          >
                            {showFullSchedule
                              ? "Show Yearly Summary"
                              : "Show Monthly Details"}
                          </button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              <div className="my-8">
                <AdsPlaceholder position="below-results" size="728x90" />
              </div>

              {/* Information */}
              <div className="modern-card p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">📚</span>
                  Understanding Your Mortgage
                </h3>
                <div className="max-w-none">
                  <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                    This mortgage calculator helps you estimate your monthly
                    payment including principal, interest, property taxes, and
                    insurance. Use it to compare different loan scenarios and
                    find the right mortgage for your budget.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                      <h4 className="font-bold text-blue-900 mb-4">
                        Key Components:
                      </h4>
                      <ul className="space-y-3">
                        {[
                          { term: "Principal", definition: "The loan amount" },
                          {
                            term: "Interest",
                            definition: "Cost of borrowing money",
                          },
                          {
                            term: "Property Tax",
                            definition: "Annual tax on your home",
                          },
                          {
                            term: "Insurance",
                            definition: "Homeowner's insurance premium",
                          },
                          {
                            term: "PMI",
                            definition: "Required if down payment < 20%",
                          },
                        ].map((item, index) => (
                          <li key={index} className="flex flex-col">
                            <span className="font-semibold text-blue-900">
                              {item.term}:
                            </span>
                            <span className="text-blue-700 text-sm">
                              {item.definition}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                      <h4 className="font-bold text-green-900 mb-4">
                        Tips for Buyers:
                      </h4>
                      <ul className="space-y-3">
                        {[
                          "Aim for 20% down payment to avoid PMI",
                          "Consider 15-year loans for less total interest",
                          "Shop around for the best interest rates",
                          "Factor in closing costs (2-5% of home price)",
                          "Get pre-approved to strengthen your offer",
                        ].map((tip, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-green-600 text-lg">•</span>
                            <span className="text-green-800 text-sm">
                              {tip}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-2">
            <div className="sticky top-8">{sidebar}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
