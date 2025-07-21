import Link from "next/link";
import { ComparisonToolSkeleton } from "@/components/ui/comparison-tool-skeleton";
import { MarketUpdatePlaceholder } from "@/components/ui/market-update-placeholder";

const calculators = [
  { name: "Mortgage Calculator", href: "/calculators/mortgage", category: "Loans & Home" },
  { name: "Loan Calculator", href: "/calculators/loan", category: "Loans & Home" },
  { name: "Investment Calculator", href: "/calculators/investment", category: "Investing" },
  { name: "Retirement Calculator", href: "/calculators/retirement", category: "Retirement" },
  { name: "Budget Calculator", href: "/calculators/budget", category: "Budgeting" },
  { name: "Debt Payoff Calculator", href: "/calculators/debt-payoff", category: "Loans & Home" },
  { name: "Savings Calculator", href: "/calculators/savings", category: "Investing" },
  { name: "Tax Calculator", href: "/calculators/tax", category: "Budgeting" },
  { name: "Insurance Calculator", href: "/calculators/insurance", category: "Budgeting" },
];

const categories = [
  "Loans & Home",
  "Investing",
  "Retirement",
  "Budgeting",
];

export default function CalculatorsPage() {
  return (
    <section className="max-w-4xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-700">All Calculators</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search calculators..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-lg"
          // For demo, not wired up
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map(cat => (
          <div key={cat} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{cat}</h2>
            <ul className="space-y-3">
              {calculators.filter(c => c.category === cat).map(calc => (
                <li key={calc.href}>
                  <Link href={calc.href} className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-medium transition">
                    {calc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ComparisonToolSkeleton />
      <MarketUpdatePlaceholder />
    </section>
  );
} 