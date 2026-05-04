import Link from "next/link";

type CalculatorSEOContentProps = {
  slug: string;
  title: string;
  description?: string;
};

type CalculatorTopic = {
  category: string;
  intent: string;
  formula: string;
  assumptions: string[];
  example: string;
  mistakes: string[];
  related: Array<{ label: string; href: string }>;
};

const topicDefaults: Record<string, CalculatorTopic> = {
  loans: {
    category: "Loans and EMI",
    intent: "compare monthly affordability, total interest, repayment pressure, and the effect of tenure before taking a loan.",
    formula: "For reducing-balance loans, EMI = P x R x (1 + R)^N / ((1 + R)^N - 1), where P is principal, R is monthly interest rate, and N is total number of months.",
    assumptions: [
      "Interest is compounded monthly unless the calculator specifically states otherwise.",
      "Processing fees, insurance, foreclosure charges, stamp duty, and bank-specific fees may not be included in the base result.",
      "Changing tenure can reduce EMI but may increase total interest substantially.",
    ],
    example: "For example, a Rs 10 lakh loan at 10% annual interest for 5 years has a very different total cost from the same loan stretched to 7 years. The longer tenure may look comfortable every month, but the extra interest can reduce your long-term savings capacity.",
    mistakes: [
      "Choosing the lowest EMI without checking total interest.",
      "Ignoring prepayment rules and foreclosure charges.",
      "Comparing loans only by interest rate instead of total cost.",
    ],
    related: [
      { label: "Advanced EMI Calculator", href: "/calculators/advanced-emi" },
      { label: "Personal Loan Calculator", href: "/calculators/personal-loan" },
      { label: "Home Loan Calculator", href: "/calculators/home-loan" },
    ],
  },
  investments: {
    category: "Investments and wealth building",
    intent: "estimate future value, compare contribution amounts, understand compounding, and set realistic expectations before investing.",
    formula: "Future value depends on contribution amount, expected annual return, compounding frequency, and time invested. For SIPs, the calculator uses periodic investment compounding rather than treating all money as invested on day one.",
    assumptions: [
      "Expected return is an estimate, not a guarantee.",
      "Taxes, exit loads, expense ratios, brokerage, and market volatility can reduce real returns.",
      "Inflation should be considered when converting future value into today's purchasing power.",
    ],
    example: "For example, increasing a monthly SIP from Rs 5,000 to Rs 7,500 can have a larger long-term impact than chasing an extra 1% return, especially over 10 to 15 years. The calculator helps you test those trade-offs before committing money.",
    mistakes: [
      "Treating projected returns as guaranteed outcomes.",
      "Ignoring inflation and tax impact.",
      "Stopping long-term investments because of short-term market movement.",
    ],
    related: [
      { label: "SIP Calculator", href: "/calculators/sip" },
      { label: "Mutual Fund Calculator", href: "/calculators/mutual-fund" },
      { label: "Lumpsum Calculator", href: "/calculators/lumpsum" },
    ],
  },
  savings: {
    category: "Savings and fixed income",
    intent: "estimate maturity value, compare safe-saving options, and plan goal-based savings with interest and time clearly separated.",
    formula: "Savings products usually use simple interest, compound interest, or scheme-specific rules. The calculator applies the relevant formula based on the selected tool and input frequency.",
    assumptions: [
      "Interest rates may change for new deposits or future contributions.",
      "Tax treatment can vary based on income slab, product type, and holding period.",
      "Premature withdrawal rules may reduce the final value.",
    ],
    example: "For example, two deposits with the same annual rate can produce different maturity amounts if one compounds quarterly and the other annually. Use the calculator to compare real maturity value, not only the headline rate.",
    mistakes: [
      "Comparing only the advertised interest rate.",
      "Forgetting tax on interest income.",
      "Using long lock-in products for short-term emergency money.",
    ],
    related: [
      { label: "FD Calculator", href: "/calculators/fd" },
      { label: "RD Calculator", href: "/calculators/rd" },
      { label: "PPF Calculator", href: "/calculators/ppf" },
    ],
  },
  tax: {
    category: "Tax planning India",
    intent: "estimate tax impact, compare regimes, and understand deductions before making salary or investment decisions.",
    formula: "Tax calculators apply slab-based rules, eligible deductions, exemptions, surcharge or cess assumptions where relevant, and then estimate net liability from the entered income details.",
    assumptions: [
      "Tax rules can change after the Union Budget or official notifications.",
      "The result is an estimate and should be verified with Form 16, AIS, or a qualified tax professional before filing.",
      "State-specific, employer-specific, or special-case rules may need manual adjustment.",
    ],
    example: "For example, the new regime may look simpler, but the old regime can still work better for users with HRA, 80C, home loan interest, medical insurance, or other deductions. A calculator makes the comparison visible.",
    mistakes: [
      "Choosing a tax regime without comparing deductions.",
      "Assuming every allowance is automatically tax-free.",
      "Using outdated slab information after a Budget change.",
    ],
    related: [
      { label: "Income Tax Calculator", href: "/calculators/income-tax" },
      { label: "HRA Calculator", href: "/calculators/hra" },
      { label: "Tax Planning Calculator", href: "/calculators/tax-planning" },
    ],
  },
  planning: {
    category: "Personal finance planning",
    intent: "turn income, expenses, goals, risk, and time horizon into a practical money decision.",
    formula: "Planning calculators combine cash flow, inflation, expected return, savings rate, and target amount to estimate the monthly action needed to reach a goal.",
    assumptions: [
      "Inflation and future returns are estimates and should be reviewed at least once a year.",
      "Emergency needs, insurance, debt, and dependents can change the recommended amount.",
      "A calculator is a planning aid, not personalized financial advice.",
    ],
    example: "For example, a retirement target that looks large today may become manageable when broken into monthly investing, annual step-ups, and inflation-adjusted milestones. The calculator helps convert a vague goal into a visible plan.",
    mistakes: [
      "Ignoring inflation for long-term goals.",
      "Planning investments before building an emergency fund.",
      "Using the same return assumption for every goal and risk level.",
    ],
    related: [
      { label: "Retirement Calculator", href: "/calculators/retirement" },
      { label: "Budget Calculator", href: "/calculators/budget" },
      { label: "Emergency Fund Calculator", href: "/calculators/emergency-fund" },
    ],
  },
};

const slugTopic: Record<string, keyof typeof topicDefaults> = {
  "advanced-emi": "loans",
  "balloon-loan": "loans",
  "business-loan": "loans",
  "car-loan": "loans",
  "debt-payoff": "loans",
  "education-loan": "loans",
  "home-loan": "loans",
  loan: "loans",
  mortgage: "loans",
  "personal-loan": "loans",
  "compound-interest": "investments",
  "dividend-yield": "investments",
  gold: "investments",
  investment: "investments",
  lumpsum: "investments",
  "mutual-fund": "investments",
  roi: "investments",
  sip: "investments",
  swp: "investments",
  epf: "savings",
  fd: "savings",
  ppf: "savings",
  rd: "savings",
  savings: "savings",
  "simple-interest": "savings",
  gst: "tax",
  hra: "tax",
  "income-tax": "tax",
  tax: "tax",
  "tax-planning": "tax",
  budget: "planning",
  "break-even": "planning",
  "education-goal": "planning",
  "emergency-fund": "planning",
  "financial-health": "planning",
  "goal-planning": "planning",
  insurance: "planning",
  retirement: "planning",
  salary: "planning",
};

function humanizeSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function CalculatorSEOContent({ slug, title, description }: CalculatorSEOContentProps) {
  const topicKey = slugTopic[slug] || "planning";
  const fallbackTopic = topicDefaults.planning as CalculatorTopic;
  const topic: CalculatorTopic = topicDefaults[topicKey] ?? fallbackTopic;
  const displayName = title || `${humanizeSlug(slug)} Calculator`;

  return (
    <section className="mt-12 space-y-8 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
          Calculation guide
        </p>
        <h2 className="mt-2 text-2xl font-bold text-neutral-900">
          How to use the {displayName}
        </h2>
        <p className="mt-4 text-neutral-600 leading-relaxed">
          {description || `Use this ${displayName.toLowerCase()} to make a clearer financial decision.`} This tool is designed for Indian users who want a quick estimate before comparing options, speaking with an advisor, or committing money. It helps you {topic.intent}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Formula and methodology</h3>
          <p className="mt-3 text-neutral-600 leading-relaxed">{topic.formula}</p>
          <p className="mt-3 text-neutral-600 leading-relaxed">
            WealthWiseGrow keeps calculator inputs private in your browser wherever possible. The result should be treated as an educational estimate and reviewed against the official product terms, bank quote, fund document, tax rule, or salary structure that applies to your situation.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Example interpretation</h3>
          <p className="mt-3 text-neutral-600 leading-relaxed">{topic.example}</p>
          <p className="mt-3 text-neutral-600 leading-relaxed">
            After calculating, compare at least two scenarios: a conservative case and an optimistic case. This helps you avoid planning around a single number that may not survive changes in income, interest rates, inflation, tax rules, or market returns.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Key assumptions</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            {topic.assumptions.map((item) => (
              <li key={item} className="leading-relaxed">- {item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Common mistakes</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            {topic.mistakes.map((item) => (
              <li key={item} className="leading-relaxed">- {item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Related tools</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {topic.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-medium text-primary-600 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/guides" className="font-medium text-primary-600 hover:underline">
                Personal finance guides
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
        <strong className="text-neutral-900">Editorial note:</strong> Calculators on WealthWiseGrow are for education and planning. They are reviewed for formula accuracy, but they do not replace professional financial, tax, legal, or investment advice.
      </div>
    </section>
  );
}
