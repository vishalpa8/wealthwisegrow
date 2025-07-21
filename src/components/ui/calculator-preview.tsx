"use client";

import { useState } from 'react';
import { Button } from './button';

interface CalculatorPreviewProps {
  calculatorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CalculatorPreview({ calculatorName, isOpen, onClose }: CalculatorPreviewProps) {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(5);

  if (!isOpen) return null;

  // Simple EMI calculation for preview
  const monthlyRate = rate / 100 / 12;
  const numPayments = years * 12;
  const emi = amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
              (Math.pow(1 + monthlyRate, numPayments) - 1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {calculatorName} Preview
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Try a quick calculation to see how this calculator works
          </p>

          {/* Simple Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Term (years)
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              />
            </div>
          </div>

          {/* Result */}
          <div className="bg-gray-900 rounded-lg p-4 text-center text-white">
            <div className="text-sm font-medium mb-1">Monthly EMI</div>
            <div className="text-2xl font-bold">{formatCurrency(emi)}</div>
            <div className="text-sm opacity-80">Principal + Interest</div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full" size="lg">
              <span className="mr-2">🚀</span>
              Use Full Calculator
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close Preview
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This is a simplified preview. The full calculator includes more features and detailed analysis.
          </p>
        </div>
      </div>
    </div>
  );
}"