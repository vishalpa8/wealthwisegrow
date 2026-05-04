import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Link from "next/link";
import { AdSenseWrapper } from "@/components/ui/adsense-wrapper";
import { CurrencyProvider } from "@/contexts/currency-context";
import { Footer } from "@/components/layout/footer";
import { organizationStructuredData, websiteStructuredData } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "WealthWiseGrow - Financial Calculators & Investment Tools",
  description: "Access a comprehensive suite of financial calculators and investment tools for mortgages, loans, investments, retirement planning, and wealth growth. Make smarter financial decisions with WealthWiseGrow.",
  keywords: "financial calculator, mortgage calculator, loan calculator, investment calculator, retirement planning, personal finance",
  authors: [{ name: 'WealthWiseGrow' }],
  metadataBase: new URL('https://wealthwisegrow.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'WealthWiseGrow - Financial Calculators & Investment Tools',
    description: 'Access a comprehensive suite of financial calculators and investment tools for mortgages, loans, investments, retirement planning, and wealth growth.',
    url: 'https://wealthwisegrow.com',
    siteName: 'WealthWiseGrow',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WealthWiseGrow - Financial Calculators & Investment Tools',
    description: 'Comprehensive financial calculators and guides for better money management',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const adsenseScriptEnabled = process.env.NEXT_PUBLIC_ADSENSE_SCRIPT_ENABLED !== 'false';

  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
        {adsenseScriptEnabled && (
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3402658627618101"
       crossOrigin="anonymous"></script>
        )}
        <CurrencyProvider>
        {/* Simple Header */}
        <header className="w-full bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="flex items-center space-x-3" aria-label="WealthWiseGrow home">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">
              WealthWiseGrow
            </div>
          </Link>
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
          {/* Mobile menu - Simple responsive navigation */}
          <div className="md:hidden">
            <div className="flex items-center space-x-4">
              <Link
                href="/calculators"
                className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium text-sm"
              >
                Calculators
              </Link>
              <Link
                href="/guides"
                className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium text-sm"
              >
                Guides
              </Link>
            </div>
          </div>
        </header>
        
        <AdSenseWrapper adSlot="header-ad" className="w-full h-[90px] max-w-[728px] mx-auto mt-4" />
        
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
              <AdSenseWrapper adSlot="sidebar-ad" className="w-full h-[250px] max-w-[300px]" />
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
        
        <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
