import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Link from "next/link";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { FooterYear } from "@/components/ui/footer-year";
import { CurrencyProvider } from "@/contexts/currency-context";

export const metadata: Metadata = {
  title: "WealthWise Hub",
  description: "Personal Calculator Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <CurrencyProvider>
        {/* Simple Header */}
        <header className="w-full bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">
              WealthWise Hub
            </div>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link
              href="/"
              className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/calculators"
              className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
            >
              Calculators
            </Link>
            <Link
              href="/guides"
              className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
            >
              Guides
            </Link>
          </nav>
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        
        <AdsPlaceholder position="header" size="728x90" />
        
        <div className="flex flex-1 w-full container-wide gap-8 py-8">
          {/* Simple Sidebar */}
          <aside className="hidden lg:block w-80 space-y-4 flex-shrink-0">
            <div className="card">
              <h3 className="text-base font-semibold text-neutral-900 mb-4">
                Popular Calculators
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/calculators/mortgage"
                    className="flex items-center px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-lg mr-3">🏠</span>
                    <span className="text-sm font-medium text-neutral-700">Mortgage Calculator</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calculators/loan"
                    className="flex items-center px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-lg mr-3">💳</span>
                    <span className="text-sm font-medium text-neutral-700">Loan Calculator</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calculators/investment"
                    className="flex items-center px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-lg mr-3">📈</span>
                    <span className="text-sm font-medium text-neutral-700">Investment Calculator</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calculators/retirement"
                    className="flex items-center px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-lg mr-3">🧓</span>
                    <span className="text-sm font-medium text-neutral-700">Retirement Calculator</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calculators/budget"
                    className="flex items-center px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-lg mr-3">💰</span>
                    <span className="text-sm font-medium text-neutral-700">Budget Calculator</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="card">
              <AdsPlaceholder position="sidebar" size="300x250" />
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
        
        {/* Simple Footer */}
        <footer className="w-full bg-white border-t border-neutral-200 mt-16">
          <div className="container-wide py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">W</span>
                </div>
                <span className="text-neutral-700 font-medium">WealthWise Hub</span>
              </div>
              <div className="text-sm text-neutral-500">
                &copy; <FooterYear /> WealthWise Hub. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
        </CurrencyProvider>
      </body>
    </html>
  );
}