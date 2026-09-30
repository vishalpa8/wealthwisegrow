import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/templates/calculator-layout";
import { Mail, MessageSquare, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | WealthWiseGrow",
  description: "Get in touch with WealthWiseGrow for feedback, suggestions, or inquiries about our financial tools.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <CalculatorLayout
      title="Contact Us"
      description="We're here to help and listen to your feedback."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Get in Touch</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Email</h3>
                <p className="text-neutral-600 text-sm">support@wealthwisegrow.com</p>
                <p className="text-neutral-500 text-xs mt-1">We typically respond within 24-48 hours.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Feedback</h3>
                <p className="text-neutral-600 text-sm">Your feedback helps us improve our tools.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Location</h3>
                <p className="text-neutral-600 text-sm">Digital First - Serving users across India.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send a Message</h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            The fastest way to reach us is by email. To help us respond quickly, please include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-600 mb-6">
            <li><strong>Calculation issues:</strong> the calculator link, the inputs you used, and the result you expected.</li>
            <li><strong>Content corrections:</strong> the page, the statement, and a source such as an official circular or notification.</li>
            <li><strong>Suggestions:</strong> the calculator or guide you would like us to add or improve.</li>
          </ul>
          <a
            href="mailto:support@wealthwisegrow.com?subject=WealthWiseGrow%20feedback"
            className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Email support@wealthwisegrow.com
          </a>
          <p className="text-neutral-500 text-sm mt-4">
            See our <a href="/corrections" className="text-primary-600 hover:underline">corrections policy</a> for how reported errors are reviewed and fixed.
          </p>
        </div>
      </div>
    </CalculatorLayout>
  );
}
