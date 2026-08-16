import type { Metadata } from "next";
import { generateMetadata } from "@/lib/seo/metadata";

export type CalculatorSEOPage = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};

export const calculatorSEOMap: Record<string, CalculatorSEOPage> = {
  "advanced-emi": {
    slug: "advanced-emi",
    title: "Advanced Loan Prepayment & EMI Calculator India",
    description: "Calculate EMI, total interest, amortization, and prepayment impact for loans in India with our advanced calculator.",
    keywords: ["advanced emi calculator", "emi calculator india", "loan prepayment calculator", "amortization schedule", "home loan prepayment"],
  },
  "balloon-loan": {
    slug: "balloon-loan",
    title: "Free Balloon Payment Loan Calculator",
    description: "Estimate regular payments, final balloon payment, total interest, and repayment risk with this free calculator.",
    keywords: ["balloon loan calculator", "balloon payment calculator", "loan calculator", "balloon mortgage calculator"],
  },
  budget: {
    slug: "budget",
    title: "Monthly Household Budget & Expense Calculator India",
    description: "Plan monthly income, expenses, savings rate, and budget health with a simple private household calculator.",
    keywords: ["budget calculator india", "monthly budget calculator", "expense calculator", "household budget planner"],
  },
  "business-loan": {
    slug: "business-loan",
    title: "Business Loan EMI & Affordability Calculator India",
    description: "Calculate business loan EMI, total interest, and repayment affordability for Indian businesses.",
    keywords: ["business loan emi calculator", "business loan calculator india", "commercial loan emi calculator"],
  },
  "car-loan": {
    slug: "car-loan",
    title: "Instant Car Loan EMI & Interest Calculator India",
    description: "Calculate car loan EMI, total interest cost, and loan affordability before buying your new or used vehicle.",
    keywords: ["car loan emi calculator", "vehicle loan calculator", "car loan calculator india", "auto loan emi"],
  },
  "compound-interest": {
    slug: "compound-interest",
    title: "Daily Compound Interest & Wealth Growth Calculator",
    description: "Calculate compound interest, maturity value, and wealth growth across daily, monthly, and yearly compounding frequencies.",
    keywords: ["compound interest calculator", "compound interest calculator india", "investment growth calculator", "daily compound interest"],
  },
  "debt-payoff": {
    slug: "debt-payoff",
    title: "Debt Snowball & Payoff Strategy Calculator",
    description: "Compare debt payoff strategies, repayment timelines, and interest savings using the snowball or avalanche method.",
    keywords: ["debt payoff calculator", "debt snowball calculator", "debt avalanche calculator", "credit card payoff calculator"],
  },
  "dividend-yield": {
    slug: "dividend-yield",
    title: "Stock Dividend Yield & Income Calculator",
    description: "Calculate dividend yield, annual dividend income, and stock income potential for your portfolio.",
    keywords: ["dividend yield calculator", "dividend income calculator", "stock dividend calculator", "dividend portfolio tracker"],
  },
  "education-goal": {
    slug: "education-goal",
    title: "Child Future Education Cost Calculator India",
    description: "Plan future higher education costs with inflation, investment returns, and monthly SIP savings estimates.",
    keywords: ["education goal calculator", "child education calculator india", "education planning calculator", "college savings calculator"],
  },
  "education-loan": {
    slug: "education-loan",
    title: "Student Education Loan EMI Calculator India",
    description: "Calculate education loan EMI, moratorium period impact, total repayment, and interest cost.",
    keywords: ["education loan emi calculator", "student loan calculator india", "education loan repayment calculator"],
  },
  "emergency-fund": {
    slug: "emergency-fund",
    title: "Personal Emergency Fund Savings Calculator India",
    description: "Estimate how much emergency fund you need based on monthly expenses, dependents, and job stability.",
    keywords: ["emergency fund calculator", "emergency savings calculator", "personal finance india", "contingency fund calculator"],
  },
  epf: {
    slug: "epf",
    title: "EPF Maturity & Pension Fund Calculator India",
    description: "Estimate Employees' Provident Fund (EPF) maturity value, employer/employee contribution, and retirement savings.",
    keywords: ["epf calculator", "epf calculator india", "provident fund calculator", "pf balance calculator"],
  },
  fd: {
    slug: "fd",
    title: "Bank Fixed Deposit (FD) Maturity Calculator India",
    description: "Calculate bank fixed deposit maturity value, interest earned, and quarterly compounding impact.",
    keywords: ["fd calculator", "fixed deposit calculator india", "fd maturity calculator", "bank fd return calculator"],
  },
  "financial-health": {
    slug: "financial-health",
    title: "Personal Financial Health Score Calculator",
    description: "Assess your savings, debt ratio, insurance cover, emergency fund, and overall financial health score.",
    keywords: ["financial health calculator", "financial health score", "personal finance calculator", "financial wellness check"],
  },
  "goal-planning": {
    slug: "goal-planning",
    title: "Financial Goal Planning & Investment Calculator",
    description: "Plan financial goals with target amount, inflation, time horizon, and monthly SIP investment needs.",
    keywords: ["goal planning calculator", "financial goal calculator india", "goal investment calculator", "target corpus calculator"],
  },
  gold: {
    slug: "gold",
    title: "Gold Investment Return & Future Value Calculator",
    description: "Estimate future physical and digital gold investment value, expected returns, and long-term growth.",
    keywords: ["gold investment calculator", "gold return calculator india", "gold price calculator", "sovereign gold bond calculator"],
  },
  gst: {
    slug: "gst",
    title: "Free GST Inclusive & Exclusive Price Calculator India",
    description: "Instantly calculate GST-inclusive and GST-exclusive prices across 5%, 12%, 18%, and 28% Indian GST tax slabs.",
    keywords: ["gst calculator", "gst calculator india", "cgst sgst calculator", "reverse gst calculator"],
  },
  "home-loan": {
    slug: "home-loan",
    title: "Home Loan EMI & Amortization Calculator India",
    description: "Calculate housing loan EMI, total interest, full repayment schedule, and property affordability.",
    keywords: ["home loan emi calculator", "home loan calculator india", "housing loan emi calculator", "mortgage amortization india"],
  },
  hra: {
    slug: "hra",
    title: "Income Tax HRA Exemption Calculator India",
    description: "Calculate your House Rent Allowance (HRA) exemption under Indian income tax rules and optimize taxable salary.",
    keywords: ["hra calculator", "hra exemption calculator", "hra calculator india", "tax saving rent calculator"],
  },
  "income-tax": {
    slug: "income-tax",
    title: "Old vs New Regime Income Tax Calculator India",
    description: "Estimate your income tax under Indian tax slabs and directly compare the old and new tax regimes to save money.",
    keywords: ["income tax calculator india", "old vs new tax regime calculator", "tax calculator india", "salary tax calculator"],
  },
  insurance: {
    slug: "insurance",
    title: "Term Life Insurance Cover Need Calculator India",
    description: "Accurately estimate your life insurance and protection needs based on income, liabilities, dependents, and future goals.",
    keywords: ["insurance calculator", "term insurance calculator india", "life insurance need calculator", "human life value calculator"],
  },
  investment: {
    slug: "investment",
    title: "Future Value Investment Growth Calculator India",
    description: "Calculate future investment portfolio value with monthly contributions, expected returns, time horizon, and compounding.",
    keywords: ["investment calculator india", "future value calculator", "wealth growth calculator", "portfolio return calculator"],
  },
  loan: {
    slug: "loan",
    title: "Simple EMI & Loan Repayment Calculator India",
    description: "Calculate basic loan EMI, total interest payable, and full repayment schedule for any generic loan type.",
    keywords: ["loan emi calculator", "loan calculator india", "emi calculator", "simple loan calculator"],
  },
  lumpsum: {
    slug: "lumpsum",
    title: "Mutual Fund Lumpsum Investment Return Calculator",
    description: "Calculate future maturity value and estimated returns from one-time mutual fund lumpsum investments.",
    keywords: ["lumpsum calculator", "lumpsum investment calculator", "mutual fund lumpsum calculator", "one time investment calculator"],
  },
  mortgage: {
    slug: "mortgage",
    title: "Real Estate Mortgage EMI Calculator India",
    description: "Estimate property mortgage payments, total interest over time, and repayment schedule for real estate loans.",
    keywords: ["mortgage calculator", "mortgage calculator india", "home loan calculator", "property loan calculator"],
  },
  "mutual-fund": {
    slug: "mutual-fund",
    title: "Historical Mutual Fund Returns & CAGR Calculator",
    description: "Calculate mutual fund returns, maturity value, Compound Annual Growth Rate (CAGR), and long-term wealth growth.",
    keywords: ["mutual fund calculator", "mutual fund returns calculator india", "cagr calculator", "mutual fund cagr"],
  },
  "personal-loan": {
    slug: "personal-loan",
    title: "Instant Personal Loan EMI Calculator India",
    description: "Calculate personal loan EMI installments, total interest cost, repayment amount, and borrowing affordability.",
    keywords: ["personal loan emi calculator", "personal loan calculator india", "emi calculator", "unsecured loan calculator"],
  },
  ppf: {
    slug: "ppf",
    title: "PPF Account Maturity & Interest Calculator India",
    description: "Calculate Public Provident Fund (PPF) maturity value, yearly contributions, tax-free interest, and long-term growth.",
    keywords: ["ppf calculator", "ppf calculator india", "public provident fund calculator", "ppf interest calculator"],
  },
  rd: {
    slug: "rd",
    title: "Recurring Deposit (RD) Maturity Calculator India",
    description: "Calculate post office and bank recurring deposit (RD) maturity value, monthly deposits, and total interest earned.",
    keywords: ["rd calculator", "recurring deposit calculator india", "rd maturity calculator", "post office rd calculator"],
  },
  retirement: {
    slug: "retirement",
    title: "Retirement Corpus & Pension Planning Calculator",
    description: "Estimate your target retirement corpus, monthly SIP investment needs, inflation impact, and post-retirement expenses.",
    keywords: ["retirement calculator india", "retirement corpus calculator", "financial planning calculator", "pension calculator"],
  },
  roi: {
    slug: "roi",
    title: "Simple Return on Investment (ROI) Calculator",
    description: "Calculate return on investment percentage, absolute gain, and overall investment performance metrics.",
    keywords: ["roi calculator", "return on investment calculator", "investment return calculator", "profit percentage calculator"],
  },
  salary: {
    slug: "salary",
    title: "In-Hand Salary & CTC Breakdown Calculator India",
    description: "Estimate your net take-home salary, PF deductions, tax impact, and comprehensive CTC breakup.",
    keywords: ["salary calculator india", "ctc to in hand salary calculator", "take home salary calculator", "net salary calculator"],
  },
  savings: {
    slug: "savings",
    title: "Monthly Savings Goal & Target Calculator",
    description: "Plan short and long-term savings goals, monthly bank contributions, interest growth, and target timelines.",
    keywords: ["savings calculator", "savings goal calculator india", "monthly savings calculator", "target savings calculator"],
  },
  "simple-interest": {
    slug: "simple-interest",
    title: "Free Simple Interest & Principal Calculator",
    description: "Easily calculate simple interest, principal amount, interest rate, time period, and total maturity value.",
    keywords: ["simple interest calculator", "interest calculator", "simple interest formula", "basic interest calculator"],
  },
  sip: {
    slug: "sip",
    title: "Free Mutual Fund SIP Return Calculator India",
    description: "Calculate mutual fund SIP maturity value, total investment, estimated returns, and wealth growth with our free step-by-step calculator.",
    keywords: ["sip return calculator", "mutual fund sip calculator india", "free sip calculator", "systematic investment plan calculator"],
  },
  swp: {
    slug: "swp",
    title: "Mutual Fund SWP (Systematic Withdrawal Plan) Calculator",
    description: "Plan systematic mutual fund withdrawals, monthly retirement income, remaining corpus, and withdrawal sustainability.",
    keywords: ["swp calculator", "systematic withdrawal plan calculator", "retirement withdrawal calculator", "mutual fund swp"],
  },
  tax: {
    slug: "tax",
    title: "Personal Income Tax Liability Calculator India",
    description: "Estimate your annual Indian tax liability, total taxable income, standard deductions, and post-tax net income.",
    keywords: ["tax calculator india", "income tax calculator", "tax planning calculator", "tax liability calculator"],
  },
  "tax-planning": {
    slug: "tax-planning",
    title: "Tax Saving Investment Planning Calculator India",
    description: "Compare old vs new tax regimes and estimate your 80C, 80D tax-saving investment opportunities.",
    keywords: ["tax planning calculator", "old vs new tax regime", "income tax planning india", "80c tax saving calculator"],
  },
  "break-even": {
    slug: "break-even",
    title: "Business Break-Even Point & Profitability Calculator",
    description: "Calculate your business break-even point in units or revenue, required sales, fixed costs, variable costs, and profit margin.",
    keywords: ["break even calculator", "business break even calculator", "profit calculator", "break even analysis"],
  },
};

export function getCalculatorSEO(slug: string): CalculatorSEOPage {
  return calculatorSEOMap[slug] || {
    slug,
    title: `${slug.replace(/-/g, " ")} Calculator India`,
    description: "Use this free financial calculator from WealthWiseGrow to estimate results and compare planning scenarios.",
    keywords: ["financial calculator", "calculator india", "personal finance"],
  };
}

export function getCalculatorPageMetadata(slug: string): Metadata {
  const page = getCalculatorSEO(slug);

  return generateMetadata({
    title: page.title,
    description: page.description,
    keywords: [
      ...page.keywords,
      "WealthWiseGrow",
      "free financial calculator",
      "personal finance India",
    ],
    path: `/calculators/${slug}`,
  });
}
