export interface SitemapUrl {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (urls: SitemapUrl[]): string => {
  const urlElements = urls.map(({ url, lastModified, changeFrequency, priority }) => {
    const lastMod = lastModified ? lastModified.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFrequency || 'weekly'}</changefreq>
    <priority>${priority || 0.5}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
};

export const siteUrls: SitemapUrl[] = [
  // Main Pages
  {
    url: 'https://wealthwisegrow.com',
    changeFrequency: 'daily',
    priority: 1.0
  },
  {
    url: 'https://wealthwisegrow.com/calculators',
    changeFrequency: 'weekly',
    priority: 0.9
  },
  {
    url: 'https://wealthwisegrow.com/guides',
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: 'https://wealthwisegrow.com/privacy-policy',
    changeFrequency: 'yearly',
    priority: 0.3
  },
  
  // Calculator Pages - Core Financial Tools
  {
    url: 'https://wealthwisegrow.com/calculators/mortgage',
    changeFrequency: 'monthly',
    priority: 0.8
  },
  {
    url: 'https://wealthwisegrow.com/calculators/loan',
    changeFrequency: 'monthly',
    priority: 0.8
  },
  {
    url: 'https://wealthwisegrow.com/calculators/investment',
    changeFrequency: 'monthly',
    priority: 0.8
  },
  {
    url: 'https://wealthwisegrow.com/calculators/retirement',
    changeFrequency: 'monthly',
    priority: 0.8
  },
  {
    url: 'https://wealthwisegrow.com/calculators/budget',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  
  // Calculator Pages - Interest & Savings
  {
    url: 'https://wealthwisegrow.com/calculators/compound-interest',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/simple-interest',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/sip',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/ppf',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/fd',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/rd',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/epf',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/savings',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  
  // Calculator Pages - Loan Types
  {
    url: 'https://wealthwisegrow.com/calculators/car-loan',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/personal-loan',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/home-loan',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/business-loan',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/education-loan',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/advanced-emi',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: 'https://wealthwisegrow.com/calculators/balloon-loan',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: 'https://wealthwisegrow.com/calculators/debt-payoff',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  
  // Calculator Pages - Investment & Mutual Funds
  {
    url: 'https://wealthwisegrow.com/calculators/mutual-fund',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/lumpsum',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/swp',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/dividend-yield',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: 'https://wealthwisegrow.com/calculators/roi',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: 'https://wealthwisegrow.com/calculators/gold',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  
  // Calculator Pages - Planning & Goals
  {
    url: 'https://wealthwisegrow.com/calculators/education-goal',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/goal-planning',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/emergency-fund',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/financial-health',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: 'https://wealthwisegrow.com/calculators/insurance',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  
  // Calculator Pages - Tax & Salary
  {
    url: 'https://wealthwisegrow.com/calculators/income-tax',
    changeFrequency: 'yearly',
    priority: 0.8
  },
  {
    url: 'https://wealthwisegrow.com/calculators/gst',
    changeFrequency: 'yearly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/hra',
    changeFrequency: 'yearly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/tax',
    changeFrequency: 'yearly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/tax-planning',
    changeFrequency: 'yearly',
    priority: 0.7
  },
  {
    url: 'https://wealthwisegrow.com/calculators/salary',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  
  // Calculator Pages - Business & Analysis
  {
    url: 'https://wealthwisegrow.com/calculators/break-even',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  
  // Guide Pages
  {
    url: 'https://wealthwisegrow.com/guides/investment',
    changeFrequency: 'weekly',
    priority: 0.6
  },
  {
    url: 'https://wealthwisegrow.com/guides/mortgage',
    changeFrequency: 'weekly',
    priority: 0.6
  },
  {
    url: 'https://wealthwisegrow.com/guides/loan',
    changeFrequency: 'weekly',
    priority: 0.6
  },
  {
    url: 'https://wealthwisegrow.com/guides/budget',
    changeFrequency: 'weekly',
    priority: 0.6
  },
  {
    url: 'https://wealthwisegrow.com/guides/retirement',
    changeFrequency: 'weekly',
    priority: 0.6
  }
];