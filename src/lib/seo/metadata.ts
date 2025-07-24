import { Metadata } from 'next';

interface SEOConfig {
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  siteUrl: string;
}

export const seoConfig: SEOConfig = {
  titleTemplate: '%s | WealthWiseGrow',
  defaultDescription: 'Comprehensive financial calculators for loans, investments, taxes, and retirement planning in India.',
  defaultKeywords: [
    'financial calculator',
    'loan calculator',
    'investment calculator',
    'tax calculator',
    'retirement planning',
    'EMI calculator',
    'SIP calculator',
    'mutual funds',
    'personal finance',
    'wealth management'
  ],
  siteUrl: 'https://wealthwisegrow.com'
};

interface GenerateMetadataProps {
  title: string;
  description?: string;
  keywords?: string[];
  path?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description = seoConfig.defaultDescription,
  keywords = seoConfig.defaultKeywords,
  path = '',
  noIndex = false
}: GenerateMetadataProps): Metadata {
  const url = `${seoConfig.siteUrl}${path}`;
  
  return {
    title: title ? seoConfig.titleTemplate.replace('%s', title) : 'WealthWiseGrow',
    description,
    keywords: keywords.join(', '),
    metadataBase: new URL(seoConfig.siteUrl),
    openGraph: {
      title: title ? seoConfig.titleTemplate.replace('%s', title) : 'WealthWiseGrow',
      description,
      url,
      siteName: 'WealthWiseGrow',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? seoConfig.titleTemplate.replace('%s', title) : 'WealthWiseGrow',
      description,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Calculator-specific metadata
export function generateCalculatorMetadata(
  calculatorType: string,
  title: string,
  description: string
): Metadata {
  return generateMetadata({
    title,
    description,
    keywords: [
      ...seoConfig.defaultKeywords,
      `${calculatorType} calculator`,
      `${calculatorType} calculation`,
      `online ${calculatorType} calculator`,
      'financial planning',
      'finance tools'
    ],
    path: `/calculators/${calculatorType}`
  });
}

// Structured data for calculators
export function generateCalculatorStructuredData(
  calculatorType: string,
  name: string,
  description: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR'
    },
    url: `${seoConfig.siteUrl}/calculators/${calculatorType}`
  };
}
