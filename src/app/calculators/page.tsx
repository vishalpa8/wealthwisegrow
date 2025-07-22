import React from 'react';
import Link from 'next/link';
import { CalculatorList } from "@/components/ui/calculator-list";
import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/layout/calculator-layout";

export const metadata: Metadata = {
  title: "Financial Calculators | WealthWise Hub",
  description: "Comprehensive collection of 26+ financial calculators for mortgages, loans, investments, retirement planning, and more. Free, accurate, and easy to use.",
  keywords: ["financial calculators", "mortgage calculator", "loan calculator", "investment calculator", "retirement planning"],
  openGraph: {
    title: "Financial Calculators | WealthWise Hub",
    description: "Comprehensive collection of 26+ financial calculators for mortgages, loans, investments, retirement planning, and more.",
    type: "website",
  },
};

export default function CalculatorsPage() {
  const sidebar = (
    <div className="space-y-4">
      {/* You can add specific sidebar content for the main calculators page here */}
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Quick Links</h3>
        <ul className="space-y-2">
          <li><Link href="/calculators/mortgage" className="text-blue-600 hover:underline">Mortgage Calculator</Link></li>
          <li><Link href="/calculators/loan" className="text-blue-600 hover:underline">Loan Calculator</Link></li>
          <li><Link href="/calculators/investment" className="text-blue-600 hover:underline">Investment Calculator</Link></li>
          <li><Link href="/calculators/retirement" className="text-blue-600 hover:underline">Retirement Calculator</Link></li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Financial Calculators"
      description="Make informed financial decisions with our comprehensive suite of calculators. From mortgages to investments, we've got you covered."
      sidebar={sidebar}
      containerSize="full"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-16 sm:py-20 lg:py-24 mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative container-wide text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
            <span className="mr-2">🧮</span>
            26+ Professional Calculators
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Financial Calculators
            <span className="block text-blue-200 text-3xl sm:text-4xl lg:text-5xl mt-2">
              Made Simple
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
            Make informed financial decisions with our comprehensive suite of calculators. 
            From mortgages to investments, we've got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center text-white/90">
              <span className="mr-2">✓</span>
              <span>Free to Use</span>
            </div>
            <div className="flex items-center text-white/90">
              <span className="mr-2">✓</span>
              <span>Accurate Results</span>
            </div>
            <div className="flex items-center text-white/90">
              <span className="mr-2">✓</span>
              <span>No Registration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative -mt-16 z-10 mb-8">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">26+</div>
              <div className="text-sm text-gray-600 font-medium">Calculators</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-sm text-gray-600 font-medium">Free</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">4</div>
              <div className="text-sm text-gray-600 font-medium">Categories</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600 font-medium">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive collection of financial calculators organized by category
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Loans Category */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                🏠
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Loans & Mortgages</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Calculate EMIs, interest rates, and payment schedules for all types of loans.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">Mortgage</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">Personal</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">Car</span>
              </div>
            </div>

            {/* Investments Category */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                📈
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Investments</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Plan your investments and calculate returns on various financial instruments.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">SIP</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Mutual Funds</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">FD</span>
              </div>
            </div>

            {/* Planning Category */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                💰
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Planning</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Plan for your future with retirement, budget, and goal-based calculators.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">Retirement</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">Budget</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">Insurance</span>
              </div>
            </div>

            {/* Tax Category */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                📋
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tax Calculators</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Calculate your tax liability and optimize your tax planning strategies.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">Income Tax</span>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">GST</span>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">HRA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Grid */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              All Calculators
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse through our complete collection of financial calculators
            </p>
          </div>
          
          <CalculatorList />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Calculators?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with precision and designed for ease of use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl mx-auto mb-6">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant results with our optimized calculation engines. No waiting, no delays.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-2xl mx-auto mb-6">
                🎯
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Highly Accurate</h3>
              <p className="text-gray-600 leading-relaxed">
                Built using industry-standard formulas and validated by financial experts.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 text-2xl mx-auto mb-6">
                📱
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Friendly</h3>
              <p className="text-gray-600 leading-relaxed">
                Responsive design that works perfectly on all devices, from mobile to desktop.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 text-2xl mx-auto mb-6">
                🔒
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data stays on your device. We don't store or track your calculations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 text-2xl mx-auto mb-6">
                💡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy to Use</h3>
              <p className="text-gray-600 leading-relaxed">
                Intuitive interface designed for both beginners and financial professionals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-6">
                🆓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Completely Free</h3>
              <p className="text-gray-600 leading-relaxed">
                No hidden fees, no subscriptions. All calculators are free to use forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container-wide text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start using our calculators today and make informed financial decisions with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#calculators" 
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-blue-50 transition-colors duration-200"
            >
              <span className="mr-2">🧮</span>
              Browse All Calculators
            </a>
            <Link 
              href="/calculators/mortgage" 
              className="inline-flex items-center px-8 py-4 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-400 transition-colors duration-200"
            >
              <span className="mr-2">🏠</span>
              Start with Mortgage
            </Link>
          </div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
