import Link from 'next/link';
import { Calculator } from 'lucide-react';

const popularCalculators = [
  { href: "/calculators/mortgage", label: "Mortgage Calculator", desc: "Calculate your monthly mortgage payments." },
  { href: "/calculators/investment", label: "Investment ROI", desc: "Track your investment growth over time." },
  { href: "/calculators/loan", label: "Loan EMI", desc: "Plan your loan repayment schedule." },
  { href: "/calculators/retirement", label: "Retirement Planner", desc: "Ensure you have enough for retirement." },
  { href: "/calculators/sip", label: "SIP Calculator", desc: "Calculate returns on mutual fund SIPs." },
  { href: "/calculators/income-tax", label: "Income Tax", desc: "Estimate your tax liability accurately." },
];

export function RelatedCalculators() {
  return (
    <div className="mt-12 mb-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Calculator className="w-6 h-6 mr-2 text-blue-600" />
        Explore More Calculators
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularCalculators.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="group flex flex-col p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
              {calc.label}
            </span>
            <span className="text-sm text-gray-500">
              {calc.desc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
