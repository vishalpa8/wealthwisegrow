"use client";

import React from "react";
import Link from "next/link";
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  PiggyBank, 
  Calculator,
  DollarSign,
  Target,
  Shield,
  Percent,
  Building
} from "lucide-react";

const calculators = [
  { name: "Mortgage Calculator", href: "/calculators/mortgage", icon: Home },
  { name: "Loan Calculator", href: "/calculators/loan", icon: CreditCard },
  { name: "Investment Calculator", href: "/calculators/investment", icon: TrendingUp },
  { name: "Retirement Calculator", href: "/calculators/retirement", icon: PiggyBank },
  { name: "Budget Calculator", href: "/calculators/budget", icon: Calculator },
  { name: "Savings Calculator", href: "/calculators/savings", icon: DollarSign },
  { name: "Debt Payoff Calculator", href: "/calculators/debt-payoff", icon: Target },
  { name: "Insurance Calculator", href: "/calculators/insurance", icon: Shield },
  { name: "Tax Calculator", href: "/calculators/tax", icon: Percent },
  { name: "Business Loan Calculator", href: "/calculators/business-loan", icon: Building },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 bg-white rounded-xl shadow-sm p-6 border border-gray-100 self-start sticky top-24">
      <div className="space-y-6">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">
            Financial Calculators
          </h2>
          <nav className="space-y-1">
            {calculators.map((calculator) => {
              const Icon = calculator.icon;
              return (
                <Link
                  key={calculator.href}
                  href={calculator.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 group"
                >
                  <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                  <span className="truncate">{calculator.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-medium text-gray-900 text-sm mb-3">
            Quick Tips
          </h3>
          <div className="space-y-3 text-xs text-gray-600">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-900 mb-1">💡 Pro Tip</p>
              <p>Use multiple calculators to get a complete financial picture.</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-medium text-green-900 mb-1">📊 Track Progress</p>
              <p>Save your calculations to monitor your financial goals.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}