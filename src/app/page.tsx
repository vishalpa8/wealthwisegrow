import { ComparisonToolSkeleton } from "@/components/ui/comparison-tool-skeleton";
import { MarketUpdatePlaceholder } from "@/components/ui/market-update-placeholder";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-10 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-700 leading-tight">Personal Finance Calculator Hub</h1>
        <p className="text-xl text-gray-600 mb-8">
          25+ interactive calculators for mortgages, loans, investments, retirement, debt payoff, and budgeting. Get instant results, actionable insights, and track your financial progress—all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/calculators" className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold text-lg shadow hover:bg-blue-700 transition">Explore Calculators</a>
          <a href="/guides" className="px-8 py-3 bg-white border border-blue-600 text-blue-700 rounded-full font-semibold text-lg shadow hover:bg-blue-50 transition">Read Guides</a>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100">
          <span className="text-3xl font-bold text-blue-600">20+</span>
          <span className="text-sm text-gray-500 mt-1">Calculators</span>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100">
          <span className="text-3xl font-bold text-green-600">Instant</span>
          <span className="text-sm text-gray-500 mt-1">Results</span>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100">
          <span className="text-3xl font-bold text-purple-600">Track</span>
          <span className="text-sm text-gray-500 mt-1">Progress</span>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-100">
          <span className="text-3xl font-bold text-yellow-600">Free</span>
          <span className="text-sm text-gray-500 mt-1">& No Signup</span>
        </div>
      </div>
      <ComparisonToolSkeleton />
      <MarketUpdatePlaceholder />
    </section>
  );
}
