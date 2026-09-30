import { permanentRedirect } from "next/navigation";

export default function TaxCalculatorRedirect() {
  permanentRedirect("/calculators/income-tax");
}
