export type GuideExtra = {
  example: { heading: string; body: string[] };
  faqs: Array<{ question: string; answer: string }>;
};

export const guideExtras: Record<string, GuideExtra> = {
  investment: {
    example: {
      heading: "Worked example: a 10-year goal",
      body: [
        "Suppose you want Rs 20 lakh in today's money in 10 years for a home down payment. At 6% inflation, that target becomes roughly Rs 36 lakh in future rupees. If you assume a 10% annual return, you would need to invest a little under Rs 18,000 a month to get there.",
        "Now test a weaker case. At an 8% return, the monthly amount rises to roughly Rs 19,500. Planning with the more conservative number gives you a buffer if markets underperform, and any extra return becomes a bonus rather than a requirement.",
      ],
    },
    faqs: [
      {
        question: "How much should I invest each month as a beginner?",
        answer: "Start with an amount you can sustain even in a tight month, commonly 10% to 20% of take-home pay after building an emergency fund. Consistency matters more than the starting amount, and you can increase it each year as income grows.",
      },
      {
        question: "Should I wait for the market to fall before investing?",
        answer: "Timing the market consistently is very difficult. For long-term goals, investing regularly through a SIP spreads your purchases over time and reduces the risk of investing everything at a market peak.",
      },
    ],
  },
  loan: {
    example: {
      heading: "Worked example: choosing a tenure",
      body: [
        "A Rs 10 lakh loan at 10% costs about Rs 21,250 a month over 5 years, with total interest of roughly Rs 2.75 lakh. Stretched to 7 years, the EMI falls to about Rs 16,600, but total interest rises to roughly Rs 3.95 lakh.",
        "The longer tenure saves about Rs 4,650 a month but costs around Rs 1.2 lakh more overall. If the lower EMI is needed to stay safe, it can still be the right choice, but you can reduce the extra cost by prepaying whenever you receive a bonus.",
      ],
    },
    faqs: [
      {
        question: "What share of income should go to EMIs?",
        answer: "Many planners suggest keeping total EMIs below about 40% of take-home pay, and lower if you have dependents or variable income. Lenders may approve more, but your own comfort level should account for savings and emergencies.",
      },
      {
        question: "Is it better to prepay a loan or invest the money?",
        answer: "Prepaying gives a guaranteed saving equal to the loan rate. Investing may earn more but carries risk. High-interest debt such as credit cards and personal loans is almost always worth clearing first.",
      },
    ],
  },
  budget: {
    example: {
      heading: "Worked example: a Rs 80,000 monthly budget",
      body: [
        "A household taking home Rs 80,000 might spend Rs 25,000 on rent, Rs 12,000 on groceries and utilities, and Rs 8,000 on transport and school costs, for Rs 45,000 of needs. That is above the 50% guideline, which is common in large cities.",
        "Instead of forcing the 50/30/20 split, they can fix savings first at Rs 14,000 (about 17.5%) through an automatic transfer on salary day, keep Rs 5,000 a month for annual expenses such as insurance and festivals, and leave about Rs 16,000 for flexible spending.",
      ],
    },
    faqs: [
      {
        question: "What if my needs take more than 50% of income?",
        answer: "That is common with high rent or family responsibilities. Protect a minimum savings rate first, even if it starts at 10%, and look for one or two large fixed costs to reduce rather than cutting every small expense.",
      },
      {
        question: "How often should I review my budget?",
        answer: "Track spending closely for the first two or three months, then review monthly. Revisit the whole plan after a salary change, a new loan, a move, or a change in family size.",
      },
    ],
  },
  retirement: {
    example: {
      heading: "Worked example: estimating a retirement target",
      body: [
        "A 35-year-old spending Rs 50,000 a month today plans to retire at 60. At 6% inflation, the same lifestyle would cost about Rs 2.15 lakh a month, or roughly Rs 26 lakh a year, at retirement.",
        "If that spending must last 25 to 30 years, the corpus needed can run into several crores. Breaking it into a monthly investment amount with an annual step-up of 5% to 10% makes the target far more manageable than a single large number.",
      ],
    },
    faqs: [
      {
        question: "How much of my income should I save for retirement?",
        answer: "It depends on your age and existing savings, but many people aim for 15% or more of income in their 30s. Starting later usually means a higher savings rate is needed to reach the same target.",
      },
      {
        question: "Is EPF enough for retirement?",
        answer: "For many salaried people, EPF alone may not cover a full retirement at current lifestyle levels. It is a strong foundation, and is often combined with PPF, NPS and equity mutual funds.",
      },
    ],
  },
  mortgage: {
    example: {
      heading: "Worked example: the cost of a longer home loan",
      body: [
        "A Rs 50 lakh home loan at 8.5% for 20 years has an EMI of about Rs 43,390 and total interest of about Rs 54 lakh. Over 25 years, the EMI drops to about Rs 40,260 while total interest grows to about Rs 71 lakh.",
        "In the first month of the 20-year loan, around Rs 35,400 of the EMI is interest. That is why prepayments in the early years have such a large effect on total interest and tenure.",
      ],
    },
    faqs: [
      {
        question: "Should I choose a fixed or floating rate home loan?",
        answer: "Floating rates move with the lender's benchmark and have historically been more common in India, with no prepayment penalty for individual borrowers. Fixed rates offer certainty but are often higher and may reset after a few years.",
      },
      {
        question: "How much down payment should I make?",
        answer: "Lenders typically finance up to 75% to 90% of the property value depending on the loan size. A larger down payment reduces EMI and interest, but do not use your emergency fund to increase it.",
      },
    ],
  },
  sip: {
    example: {
      heading: "Worked example: the power of a step-up",
      body: [
        "A Rs 5,000 monthly SIP for 10 years at an assumed 12% return could grow to about Rs 11.6 lakh on Rs 6 lakh invested.",
        "If you increase the SIP by 10% every year instead, the total invested rises and the final value grows much faster, because each year's larger contributions also compound. A small annual increase that tracks salary hikes is one of the easiest ways to accelerate a goal.",
      ],
    },
    faqs: [
      {
        question: "What happens if I miss a SIP instalment?",
        answer: "Most fund houses simply skip the missed instalment, though your bank may charge a fee for a failed auto-debit. Repeated failures can cause the SIP to be cancelled, so keep enough balance on the debit date.",
      },
      {
        question: "Should I stop my SIP when markets fall?",
        answer: "A falling market means your SIP buys more units at lower prices. Stopping during a fall often locks in losses and misses the recovery. Review the plan if your goal or risk tolerance changes, not because of short-term market moves.",
      },
    ],
  },
  emi: {
    example: {
      heading: "Worked example: how an EMI is split",
      body: [
        "On a Rs 5 lakh loan at 11% for 3 years, the EMI is about Rs 16,370. In the first month, about Rs 4,580 is interest and the rest reduces the principal.",
        "By the final year, most of each EMI goes toward principal because the outstanding balance is smaller. This is why the amortization schedule matters when you plan prepayments or foreclosure.",
      ],
    },
    faqs: [
      {
        question: "Does a lower EMI always mean a cheaper loan?",
        answer: "No. A lower EMI often comes from a longer tenure, which increases total interest. Always compare the total amount repaid along with fees.",
      },
      {
        question: "Can my EMI change during the loan?",
        answer: "On floating-rate loans, a rate change can alter either the EMI or the remaining tenure depending on your lender's policy. Ask your lender which one changes and check your loan statement after any rate revision.",
      },
    ],
  },
  "income-tax": {
    example: {
      heading: "Worked example: comparing regimes",
      body: [
        "Under the new regime announced in Budget 2025, salaried income up to about Rs 12.75 lakh can be tax-free after the Rs 75,000 standard deduction and the Section 87A rebate. For many salaried people without large deductions, the new regime is now the simpler and cheaper choice.",
        "Someone who claims HRA, the full Rs 1.5 lakh under Section 80C, health insurance under 80D and home loan interest may still pay less under the old regime. The only reliable way to know is to calculate both with your actual numbers.",
      ],
    },
    faqs: [
      {
        question: "Can I switch between the old and new tax regimes?",
        answer: "Salaried individuals without business income can generally choose the regime each year when filing their return. People with business income have more limited options to switch back and forth.",
      },
      {
        question: "Why does my calculated tax differ from my employer's TDS?",
        answer: "Employers calculate TDS from the declarations and proofs you submit, and may not include other income such as FD interest or capital gains. Check Form 26AS and AIS before filing your return.",
      },
    ],
  },
  "mutual-funds": {
    example: {
      heading: "Worked example: why costs matter",
      body: [
        "Rs 10 lakh growing at 12% a year for 20 years becomes about Rs 96 lakh. If fees reduce the net return to 11%, the result is about Rs 81 lakh, roughly Rs 16 lakh less.",
        "Direct plans usually have lower expense ratios than regular plans because they do not include distributor commission. Over long periods, that small annual difference can add up to a large amount.",
      ],
    },
    faqs: [
      {
        question: "How many mutual funds should I own?",
        answer: "For most investors, a small number of well-chosen funds across equity and debt is enough. Owning many similar funds often adds overlap without adding real diversification.",
      },
      {
        question: "Are mutual fund returns guaranteed?",
        answer: "No. Mutual fund returns depend on the underlying investments and can be negative, especially in the short term. Past performance does not guarantee future results.",
      },
    ],
  },
  ppf: {
    example: {
      heading: "Worked example: maximising PPF",
      body: [
        "Depositing Rs 1.5 lakh every year for 15 years at 7.1% can build a maturity value of roughly Rs 40.7 lakh on Rs 22.5 lakh invested. The interest is tax-free, and the deposit can qualify for Section 80C in the old regime.",
        "Interest is calculated on the lowest balance between the 5th and the last day of each month. Depositing the yearly amount before 5 April earns interest on the full amount for the entire year.",
      ],
    },
    faqs: [
      {
        question: "Can I withdraw from PPF before 15 years?",
        answer: "Partial withdrawals are allowed from the 7th financial year under set limits, and premature closure is allowed in specific cases after 5 years. The account can also be extended in blocks of 5 years after maturity.",
      },
      {
        question: "Is the PPF interest rate fixed for 15 years?",
        answer: "No. The government reviews the rate every quarter, and the current rate applies to the whole balance. Update the calculator when a new rate is announced.",
      },
    ],
  },
  "fd-rd": {
    example: {
      heading: "Worked example: FD versus RD for a short goal",
      body: [
        "If you already have Rs 3 lakh, an FD at 7% for 5 years with quarterly compounding could grow to about Rs 4.24 lakh. If you are saving Rs 5,000 a month instead, a 5-year RD at 7% would put in Rs 3 lakh and return roughly Rs 3.6 lakh.",
        "The FD earns more because all the money is invested from day one. The RD is useful when the money comes from monthly income rather than a lump sum.",
      ],
    },
    faqs: [
      {
        question: "Is FD interest taxable?",
        answer: "Yes. FD and RD interest is added to your income and taxed at your slab rate. Banks may deduct TDS above a threshold, and you can submit Form 15G or 15H if you are eligible.",
      },
      {
        question: "Are bank deposits safe?",
        answer: "Deposits in banks covered by DICGC are insured up to Rs 5 lakh per depositor per bank, including principal and interest. Spreading large amounts across banks can keep you within that limit.",
      },
    ],
  },
  salary: {
    example: {
      heading: "Worked example: reading a CTC offer",
      body: [
        "A Rs 12 lakh CTC might include employer PF, gratuity, insurance premiums and a variable bonus. None of these arrive as monthly salary, so the fixed monthly pay before tax is usually well below Rs 1 lakh.",
        "After employee PF, professional tax and income tax, the in-hand amount can be significantly lower again. Always ask for the fixed monthly salary and the breakdown of variable pay before accepting an offer.",
      ],
    },
    faqs: [
      {
        question: "Why is my in-hand salary so different from CTC?",
        answer: "CTC is the total cost to your employer, including benefits and contributions you do not receive monthly. In-hand salary is what reaches your bank account after deductions.",
      },
      {
        question: "Does the salary structure affect my tax?",
        answer: "Yes, especially under the old regime, where components such as HRA and certain allowances can reduce taxable income. Under the new regime, most exemptions are not available.",
      },
    ],
  },
  "emergency-fund": {
    example: {
      heading: "Worked example: sizing your fund",
      body: [
        "If rent, groceries, utilities, EMIs, insurance premiums and school fees total Rs 50,000 a month, a six-month emergency fund is Rs 3 lakh.",
        "A single-income family or a freelancer with irregular income might target nine to twelve months, or Rs 4.5 to 6 lakh. Build it gradually, for example Rs 15,000 a month, before starting aggressive investing.",
      ],
    },
    faqs: [
      {
        question: "Where should I keep my emergency fund?",
        answer: "Choose options you can access quickly with minimal risk, such as a high-interest savings account, a sweep-in FD or a liquid fund. Avoid putting emergency money in equity.",
      },
      {
        question: "Should I invest or build an emergency fund first?",
        answer: "Build at least a basic emergency fund first. Without it, an unexpected expense can force you to sell investments at a bad time or take expensive debt.",
      },
    ],
  },
  fire: {
    example: {
      heading: "Worked example: a FIRE number",
      body: [
        "A common starting point is to target a corpus of about 25 to 33 times your annual expenses. With annual spending of Rs 8 lakh, that suggests roughly Rs 2 to 2.6 crore.",
        "Indian investors often use the higher end of that range, because inflation, healthcare costs and a longer retirement increase the risk of running out of money. Test your number against several return and inflation assumptions.",
      ],
    },
    faqs: [
      {
        question: "Is the 4% withdrawal rule safe in India?",
        answer: "The 4% rule came from US market data. Higher inflation in India and very long early retirements mean many planners suggest a lower withdrawal rate, such as 3% to 3.5%, for extra safety.",
      },
      {
        question: "What savings rate does FIRE require?",
        answer: "Early retirement usually requires a high savings rate, often 40% to 60% of income, sustained for many years. The higher your savings rate, the sooner you can reach your target.",
      },
    ],
  },
  insurance: {
    example: {
      heading: "Worked example: how much term cover",
      body: [
        "Someone earning Rs 12 lakh a year with a Rs 30 lakh home loan and two young children might start with 10 to 15 times income, or Rs 1.2 to 1.8 crore, and then add the outstanding loan.",
        "Existing savings and investments can reduce the cover needed. Review the amount after marriage, a child, a new loan or a large income change.",
      ],
    },
    faqs: [
      {
        question: "Is term insurance better than endowment or ULIP plans?",
        answer: "Term insurance provides much higher life cover for the premium because it has no investment component. Many planners recommend buying term cover and investing separately.",
      },
      {
        question: "Is employer health insurance enough?",
        answer: "Employer cover usually ends when you leave the job and may be too small for a family. A personal health policy keeps you covered between jobs and into retirement.",
      },
    ],
  },
  "gold-investment": {
    example: {
      heading: "Worked example: gold in a portfolio",
      body: [
        "An investor with Rs 10 lakh in savings might hold 5% to 10%, or Rs 50,000 to Rs 1 lakh, in gold as a diversifier, with the rest in equity and debt based on goals.",
        "If gold rises sharply in one year, the portfolio can drift above that range. Rebalancing once a year keeps gold at its intended share instead of chasing recent returns.",
      ],
    },
    faqs: [
      {
        question: "Is digital gold regulated?",
        answer: "Digital gold sold through apps is not regulated by SEBI or RBI. Gold ETFs and gold mutual funds are regulated by SEBI and may be a better fit for financial investing.",
      },
      {
        question: "Should I buy jewellery as an investment?",
        answer: "Jewellery includes making charges and is often sold back at a discount, which lowers the return. For investment purposes, financial forms of gold are usually more efficient.",
      },
    ],
  },
};
