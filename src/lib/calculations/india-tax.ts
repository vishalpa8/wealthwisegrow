export type IndiaTaxRegime = "old" | "new";

export const INDIA_TAX_YEAR = {
  financialYear: "2025-26",
  assessmentYear: "2026-27",
  sourceUrl:
    "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1",
} as const;

export type IndiaIncomeTaxInput = {
  grossIncome: number;
  age: number;
  regime: IndiaTaxRegime;
  deductions?: number;
  salaried?: boolean;
  resident?: boolean;
};

export type IndiaTaxSlabResult = {
  range: string;
  rate: number;
  taxableAmount: number;
  tax: number;
};

export type IndiaIncomeTaxResult = {
  grossIncome: number;
  standardDeduction: number;
  allowedDeductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate: number;
  incomeTax: number;
  cess: number;
  totalTax: number;
  netIncome: number;
  marginalRate: number;
  taxBrackets: IndiaTaxSlabResult[];
};

type Slab = { min: number; max: number; rate: number };

const NEW_REGIME_SLABS: Slab[] = [
  { min: 0, max: 400_000, rate: 0 },
  { min: 400_000, max: 800_000, rate: 5 },
  { min: 800_000, max: 1_200_000, rate: 10 },
  { min: 1_200_000, max: 1_600_000, rate: 15 },
  { min: 1_600_000, max: 2_000_000, rate: 20 },
  { min: 2_000_000, max: 2_400_000, rate: 25 },
  { min: 2_400_000, max: Number.POSITIVE_INFINITY, rate: 30 },
];

function oldRegimeSlabs(age: number): Slab[] {
  if (age >= 80) {
    return [
      { min: 0, max: 500_000, rate: 0 },
      { min: 500_000, max: 1_000_000, rate: 20 },
      { min: 1_000_000, max: Number.POSITIVE_INFINITY, rate: 30 },
    ];
  }

  const exemption = age >= 60 ? 300_000 : 250_000;
  return [
    { min: 0, max: exemption, rate: 0 },
    { min: exemption, max: 500_000, rate: 5 },
    { min: 500_000, max: 1_000_000, rate: 20 },
    { min: 1_000_000, max: Number.POSITIVE_INFINITY, rate: 30 },
  ];
}

function applySlabs(taxableIncome: number, slabs: Slab[]) {
  let tax = 0;
  let marginalRate = 0;
  const taxBrackets: IndiaTaxSlabResult[] = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.min) continue;
    const taxableAmount = Math.min(taxableIncome, slab.max) - slab.min;
    const slabTax = (taxableAmount * slab.rate) / 100;
    tax += slabTax;
    marginalRate = slab.rate;
    taxBrackets.push({
      range: Number.isFinite(slab.max)
        ? `₹${slab.min.toLocaleString("en-IN")} - ₹${slab.max.toLocaleString("en-IN")}`
        : `₹${slab.min.toLocaleString("en-IN")}+`,
      rate: slab.rate,
      taxableAmount,
      tax: slabTax,
    });
  }

  return { tax, marginalRate, taxBrackets };
}

export function calculateIndiaIncomeTax(
  input: IndiaIncomeTaxInput,
): IndiaIncomeTaxResult {
  const grossIncome = Math.max(0, Number(input.grossIncome) || 0);
  const age = Math.min(120, Math.max(18, Number(input.age) || 18));
  const regime: IndiaTaxRegime = input.regime === "old" ? "old" : "new";
  const salaried = input.salaried !== false;
  const resident = input.resident !== false;
  const standardDeduction = salaried
    ? regime === "new"
      ? 75_000
      : 50_000
    : 0;
  const allowedDeductions =
    regime === "old" ? Math.max(0, Number(input.deductions) || 0) : 0;
  const taxableIncome = Math.max(
    0,
    grossIncome - standardDeduction - allowedDeductions,
  );
  const slabs = regime === "new" ? NEW_REGIME_SLABS : oldRegimeSlabs(age);
  const {
    tax: taxBeforeRebate,
    marginalRate,
    taxBrackets,
  } = applySlabs(taxableIncome, slabs);

  let rebate = 0;
  if (resident && regime === "new") {
    if (taxableIncome <= 1_200_000) {
      rebate = Math.min(60_000, taxBeforeRebate);
    } else {
      const excessIncome = taxableIncome - 1_200_000;
      rebate = Math.max(0, taxBeforeRebate - excessIncome);
    }
  } else if (resident && regime === "old" && taxableIncome <= 500_000) {
    rebate = Math.min(12_500, taxBeforeRebate);
  }

  const incomeTax = Math.max(0, taxBeforeRebate - rebate);
  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;

  return {
    grossIncome,
    standardDeduction,
    allowedDeductions,
    taxableIncome,
    taxBeforeRebate,
    rebate,
    incomeTax,
    cess,
    totalTax,
    netIncome: grossIncome - totalTax,
    marginalRate,
    taxBrackets,
  };
}
