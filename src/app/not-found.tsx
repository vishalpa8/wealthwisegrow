import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-narrow py-16 text-center">
      <div className="animate-fade-in">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-heading-2 mb-4">Page Not Found</h1>
        <p className="text-body-large mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link href="/calculators" className="btn btn-outline">
            Browse Calculators
          </Link>
        </div>
      </div>
    </div>
  );
}