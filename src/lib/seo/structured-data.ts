import { siteConfig } from "@/lib/site";

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "WealthWiseGrow",
  "url": "https://wealthwisegrow.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://wealthwisegrow.com/icon.png",
    "width": 512,
    "height": 512
  },
  "description": "Financial calculator platform with global planning tools and clearly identified India-specific tax and savings tools.",
  ...(siteConfig.contactEmail ? { "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": siteConfig.contactEmail,
    "areaServed": "Worldwide",
    "availableLanguage": ["en"]
  }} : {})
};

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "WealthWiseGrow",
  "url": "https://wealthwisegrow.com",
  "description": "Access financial calculators and personal finance guides for loans, SIP, tax, salary, retirement, savings, and wealth planning."
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
