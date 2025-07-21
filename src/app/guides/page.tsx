import Link from "next/link";

const guides = [
  { title: "How to Use the Mortgage Calculator", href: "/guides/mortgage" },
  { title: "How to Use the Loan Calculator", href: "/guides/loan" },
  { title: "How to Use the Investment Calculator", href: "/guides/investment" },
  { title: "How to Use the Retirement Calculator", href: "/guides/retirement" },
  { title: "How to Use the Budget Calculator", href: "/guides/budget" },
];

export default function GuidesPage() {
  return (
    <section className="max-w-3xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-700">Educational Guides</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {guides.map(guide => (
          <div key={guide.href} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <Link href={guide.href} className="text-lg font-semibold text-blue-700 hover:underline mb-2">{guide.title}</Link>
            <span className="text-gray-500 text-sm">Step-by-step instructions</span>
          </div>
        ))}
      </div>
    </section>
  );
} 