import { buildCalculatorExport } from "../../src/hooks/use-calculator-actions";

describe("calculator export", () => {
  it("includes the entered inputs and the calculated results", () => {
    const { text, csv } = buildCalculatorExport(
      "Loan Calculator",
      [{ label: "Loan Amount", value: "500000" }],
      [{ label: "Monthly EMI", value: "10,749.22" }]
    );

    expect(text).toContain("Inputs");
    expect(text).toContain("Loan Amount: 500000");
    expect(text).toContain("Results");
    expect(text).toContain("Monthly EMI: 10,749.22");
    expect(csv).toContain('"Inputs","Loan Amount","500000"');
    expect(csv).toContain('"Results","Monthly EMI","10,749.22"');
  });
});
