import type { Metadata } from "next";
import { CalculatorLayout } from "@/components/layout/calculator-layout";
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
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1">Subject</label>
              <select 
                id="subject" 
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              >
                <option>General Inquiry</option>
                <option>Bug Report</option>
                <option>Feature Suggestion</option>
                <option>Partnership</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
              <textarea 
                id="message" 
                rows={4} 
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </CalculatorLayout>
  );
}
