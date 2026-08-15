import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AdSenseWrapper } from "@/components/molecules/adsense-wrapper";
import { CurrencyProvider } from "@/contexts/currency-context";
import { Header } from "@/components/organisms/header";
import { Footer } from "@/components/organisms/footer";
import { GA4 } from "@/components/analytics/ga4";
import { organizationStructuredData, websiteStructuredData } from "@/lib/seo/structured-data";
import Link from "next/link";

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
    images: [
      {
        url: 'https://wealthwisegrow.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WealthWiseGrow - Financial Calculators & Investment Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@WealthWiseGrow',
    title: 'WealthWiseGrow - Financial Calculators & Investment Tools',
    description: 'Comprehensive financial calculators and guides for better money management',
    images: ['https://wealthwisegrow.com/og-image.png'],
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? 'BQbxAlPpr1EKvw8az0zGMf9Yw5rTS19XNb0zBRTIvO8',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const adsenseScriptEnabled = process.env.NEXT_PUBLIC_ADSENSE_SCRIPT_ENABLED !== 'false';

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans" suppressHydrationWarning>
        <GA4 />
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
          {/* Unified Header — replaces the previous inline header */}
          <Header />

          <AdSenseWrapper adSlot="header-ad" className="w-full h-[90px] max-w-[728px] mx-auto mt-4" />

          <div className="flex flex-1 w-full container-wide gap-8 py-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-80 space-y-4 flex-shrink-0">
              <div className="card">
                <h3 className="text-base font-semibold text-neutral-900 mb-4">
                  Popular Calculators
                </h3>
                <nav aria-label="Popular calculators">
                  <ul className="space-y-1">
                    {[
                      { href: "/calculators/mortgage", emoji: "🏠", label: "Mortgage Calculator" },
                      { href: "/calculators/loan", emoji: "💳", label: "Loan Calculator" },
                      { href: "/calculators/investment", emoji: "📈", label: "Investment Calculator" },
                      { href: "/calculators/retirement", emoji: "🧓", label: "Retirement Calculator" },
                      { href: "/calculators/budget", emoji: "💰", label: "Budget Calculator" },
                    ].map(({ href, emoji, label }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="flex items-center px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          <span className="text-lg mr-3" aria-hidden="true">{emoji}</span>
                          <span className="text-sm font-medium text-neutral-700">{label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
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
