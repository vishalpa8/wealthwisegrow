export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "WealthWiseGrow",
  "url": "https://wealthwisegrow.com",
  "logo": "https://wealthwisegrow.com/logo.png",
  "description": "Comprehensive financial calculator platform for mortgages, loans, investments, retirement planning, and wealth growth.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-WEALTH",
    "contactType": "customer service",
    "email": "contact@wealthwisegrow.com"
  },
  "sameAs": [
    "https://twitter.com/wealthwisegrow",
    "https://facebook.com/wealthwisegrow",
    "https://linkedin.com/company/wealthwisegrow"
  ]
};

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "WealthWiseGrow",
  "url": "https://wealthwisegrow.com",
  "description": "Access a comprehensive suite of financial calculators and investment tools for mortgages, loans, investments, retirement planning, and wealth growth.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://wealthwisegrow.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const breadcrumbStructuredData = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const calculatorStructuredData = (calculatorName: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": calculatorName,
  "description": description,
  "url": url,
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "provider": {
    "@type": "Organization",
    "name": "WealthWiseGrow",
    "url": "https://wealthwisegrow.com"
  }
});

export const faqStructuredData = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});