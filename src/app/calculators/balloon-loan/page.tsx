'use client';

import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, TrendingDown, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function BalloonLoanCalculatorPage() {
  const relatedCalculators = [
    {
      name: 'Loan Calculator',
      path: '/calculators/loan',
      description: 'Universal loan calculator with balloon payment options',
      badge: 'Recommended'
    },
    {
      name: 'Personal Loan EMI Calculator',
      path: '/calculators/personal-loan-emi',
      description: 'Calculate structured loan payments with custom terms',
      badge: 'Flexible'
    },
    {
      name: 'Compound Interest Calculator',
      path: '/calculators/compound-interest',
      description: 'Calculate growth for balloon payment planning',
      badge: 'Planning'
    }
  ];

  const balloonLoanFeatures = [
    {
      title: 'Lower Monthly Payments',
      description: 'Reduced periodic payments during the loan term',
      icon: '💰'
    },
    {
      title: 'Large Final Payment',
      description: 'Substantial balloon payment due at loan maturity',
      icon: '🎈'
    },
    {
      title: 'Interest-Heavy Structure',
      description: 'Most payments go toward interest, not principal',
      icon: '📊'
    },
    {
      title: 'Refinancing Options',
      description: 'Often refinanced before balloon payment is due',
      icon: '🔄'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900">Balloon Loan Calculator</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Calculate balloon loan payments, interest costs, and plan for the large final payment using our comprehensive loan calculators.
        </p>
      </div>

      {/* Warning Alert */}
      <Card className="mb-8 border-orange-200 bg-orange-50">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">Important: Balloon Loan Considerations</h3>
            <p className="text-orange-800 text-sm mb-3">
              Balloon loans require careful planning due to the large final payment. Our loan calculators 
              help you understand the payment structure and plan for refinancing or payment strategies.
            </p>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• Plan for refinancing before balloon payment due date</li>
              <li>• Consider interest rate changes for ARM balloon loans</li>
              <li>• Ensure sufficient funds or refinancing options</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Balloon Loan Features */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            How Balloon Loans Work
          </CardTitle>
          <CardDescription>
            Understanding the structure and characteristics of balloon loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {balloonLoanFeatures.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Calculators */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recommended Calculators for Balloon Loans
          </CardTitle>
          <CardDescription>
            Use these calculators to analyze balloon loan scenarios and payment structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {relatedCalculators.map((calc, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-orange-300">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{calc.name}</h4>
                  <Badge variant={calc.badge === 'Recommended' ? 'default' : 'secondary'}>
                    {calc.badge}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">{calc.description}</p>
                <Link href={calc.path}>
                  <Button className="w-full" variant="outline">
                    Use This Calculator
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calculation Guide */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Balloon Loan Calculation Guide</CardTitle>
          <CardDescription>
            How to use our calculators for balloon loan scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Step 1: Use the Loan Calculator</h4>
              <p className="text-sm text-gray-600 mb-2">
                Enter your loan amount, interest rate, and term. For balloon calculations:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Set the amortization period longer than the actual term</li>
                <li>• The difference shows your balloon payment amount</li>
                <li>• Calculate monthly payments based on full amortization</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Step 2: Plan Your Strategy</h4>
              <p className="text-sm text-gray-600 mb-2">
                Use the Compound Interest Calculator to:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Calculate savings growth for balloon payment</li>
                <li>• Plan investment strategy to meet payment deadline</li>
                <li>• Compare refinancing vs. payment scenarios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Common Balloon Loan Scenarios</CardTitle>
          <CardDescription>
            When balloon loans are typically used and how to calculate them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Real Estate:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Commercial property financing</li>
                <li>• Bridge loans for property transactions</li>
                <li>• Investment property acquisitions</li>
                <li>• Construction-to-permanent loans</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Business & Auto:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Equipment financing with residual value</li>
                <li>• Business expansion funding</li>
                <li>• Auto loans with guaranteed future value</li>
                <li>• Short-term business capital needs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
