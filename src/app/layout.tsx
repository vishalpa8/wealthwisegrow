import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import React from "react";
import { FooterYear } from "@/components/ui/footer-year";

export const metadata: Metadata = {
  title: "WealthWise Hub",
  description: "Personal Finance Calculator Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
        {/* Header */}
        <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="text-2xl font-extrabold tracking-tight text-blue-700">WealthWise Hub</div>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-700 transition-colors font-medium border-b-2 border-transparent hover:border-blue-500 pb-1">Home</Link>
            <Link href="/calculators" className="text-gray-700 hover:text-blue-700 transition-colors font-medium border-b-2 border-transparent hover:border-blue-500 pb-1">Calculators</Link>
            <Link href="/guides" className="text-gray-700 hover:text-blue-700 transition-colors font-medium border-b-2 border-transparent hover:border-blue-500 pb-1">Guides</Link>
          </nav>
        </header>
        <AdsPlaceholder position="header" size="728x90" />
        <div className="flex flex-1 w-full max-w-7xl mx-auto gap-6 py-6 px-2 md:px-6">
          {/* Sidebar */}
          <aside className="hidden md:block w-64 bg-white rounded-xl shadow-md p-6 border border-gray-100 mt-2 self-start sticky top-24">
            <AdsPlaceholder position="sidebar" size="300x250" />
            <div className="font-semibold mb-3 text-gray-700 text-lg">Popular Calculators</div>
            <ul className="space-y-2 text-base">
              <li><Link href="/calculators/mortgage" className="block px-3 py-2 rounded-lg hover:bg-blue-50 transition">🏠 Mortgage Calculator</Link></li>
              <li><Link href="/calculators/loan" className="block px-3 py-2 rounded-lg hover:bg-blue-50 transition">💳 Loan Calculator</Link></li>
              <li><Link href="/calculators/investment" className="block px-3 py-2 rounded-lg hover:bg-blue-50 transition">📈 Investment Calculator</Link></li>
              <li><Link href="/calculators/retirement" className="block px-3 py-2 rounded-lg hover:bg-blue-50 transition">🧓 Retirement Calculator</Link></li>
              <li><Link href="/calculators/budget" className="block px-3 py-2 rounded-lg hover:bg-blue-50 transition">💰 Budget Calculator</Link></li>
            </ul>
          </aside>
          {/* Main Content */}
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
        {/* Footer */}
        <footer className="w-full bg-white border-t border-gray-100 text-center py-4 text-sm text-gray-500 mt-8">
          &copy; <FooterYear /> WealthWise Hub. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
