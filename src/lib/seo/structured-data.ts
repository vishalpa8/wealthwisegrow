export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "WealthWiseGrow",
  "url": "https://wealthwisegrow.com",
  "logo": "https://wealthwisegrow.com/favicon.ico",
  "description": "India-focused financial calculator platform for loans, SIP, tax, salary, retirement, savings, and personal finance planning.",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@wealthwisegrow.com",
    "areaServed": "IN",
    "availableLanguage": ["en"]
  }
};

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "WealthWiseGrow",
  "url": "https://wealthwisegrow.com",
  "description": "Access India-focused financial calculators and personal finance guides for loans, SIP, tax, salary, retirement, savings, and wealth planning."
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
    "priceCurrency": "INR"
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
