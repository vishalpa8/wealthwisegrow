'use client';

import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function BusinessLoanCalculatorPage() {
  const relatedCalculators = [
    {
      name: 'Personal Loan EMI Calculator',
      path: '/calculators/personal-loan-emi',
      description: 'Calculate EMIs for business loans with flexible terms',
      badge: 'Recommended'
    },
    {
      name: 'Loan Calculator',
      path: '/calculators/loan',
      description: 'Generic loan calculator for all business financing needs',
      badge: 'Universal'
    },
    {
      name: 'Simple Interest Calculator',
      path: '/calculators/simple-interest',
      description: 'Calculate simple interest for short-term business loans',
      badge: 'Quick'
    }
  ];

  const businessLoanTypes = [
    { type: 'Term Loans', description: 'Fixed repayment schedule with competitive rates' },
    { type: 'Working Capital Loans', description: 'Flexible credit for operational expenses' },
    { type: 'Equipment Financing', description: 'Asset-backed loans for machinery and equipment' },
    { type: 'Invoice Financing', description: 'Advance against outstanding invoices' },
    { type: 'Line of Credit', description: 'Revolving credit facility for business needs' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Business Loan Calculator</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Calculate EMIs, interest, and repayment schedules for various business loan types using our specialized calculators.
        </p>
      </div>

      {/* Info Alert */}
      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Why Use Our Loan Calculators?</h3>
            <p className="text-blue-800 text-sm">
              Our loan calculators are designed to handle all types of business financing scenarios. 
              They provide accurate calculations for EMIs, total interest, and repayment schedules 
              with support for various loan structures and terms.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Loan Types */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Types of Business Loans We Support
          </CardTitle>
          <CardDescription>
            Calculate EMIs and interest for various business financing options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {businessLoanTypes.map((loan, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">{loan.type}</h4>
                <p className="text-sm text-gray-600">{loan.description}</p>
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
            Recommended Calculators for Business Loans
          </CardTitle>
          <CardDescription>
            Choose the most suitable calculator based on your business loan requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {relatedCalculators.map((calc, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-blue-300">
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

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>What Our Loan Calculators Can Do</CardTitle>
          <CardDescription>
            Comprehensive features for all your business loan calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Calculation Features:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ EMI calculation with precise interest rates</li>
                <li>✓ Total interest and principal breakdown</li>
                <li>✓ Amortization schedule generation</li>
                <li>✓ Prepayment impact analysis</li>
                <li>✓ Flexible tenure options</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Advanced Features:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Multi-currency support</li>
                <li>✓ Comparison between loan options</li>
                <li>✓ Error handling for edge cases</li>
                <li>✓ Responsive design for all devices</li>
                <li>✓ Export results to PDF/Excel</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
