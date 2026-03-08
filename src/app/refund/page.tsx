import type { Metadata } from 'next'
import Link from 'next/link'
import { mailtoSupport, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Refund Policy | Flux Kontext',
  description: 'Refund Policy for Flux Kontext AI image generation platform. Learn about our refund terms for subscription plans and credit purchases.',
  keywords: ['refund policy', 'flux kontext refund', 'ai image generation refund', 'flux ai refund'],
  alternates: {
    canonical: '/refund',
  },
  openGraph: {
    title: 'Refund Policy | Flux Kontext',
    description: 'Refund Policy for Flux Kontext AI image generation platform.',
    url: '/refund',
  },
  twitter: {
    card: 'summary',
    title: 'Refund Policy | Flux Kontext',
    description: 'Refund Policy for Flux Kontext AI image generation platform',
  },
}

export default function RefundPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/78 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl md:text-2xl font-bold text-primary">
              Flux Kontext
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
              <Link href="/generate" className="text-foreground hover:text-primary transition-colors">Generate</Link>
              <Link href="/pricing" className="text-foreground hover:text-primary transition-colors">Pricing</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="app-surface-card rounded-3xl px-6 py-8 md:px-10">
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
            
            <div className="text-sm text-muted-foreground mb-8">
              <p>Posted on: January 20, 2025</p>
              <p>Last updated: January 20, 2025</p>
            </div>

            <p className="mb-8">
              At Flux Kontext, we aim to ensure complete satisfaction with our AI image generation services. This policy outlines our terms and conditions for subscription plan changes and refunds.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Subscription Refunds</h2>
              <p className="mb-4">
                We offer full refunds for AI image generation subscription purchases under the following conditions:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Request must be made within 3 days of purchase</li>
                <li className="mb-2">Usage must be limited to 200 credits or fewer for AI image generation</li>
                <li className="mb-2">Processing fees will be deducted from the refund amount</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Credit Purchases</h2>
              <p className="mb-4">
                Credit purchases for our AI image generation platform are non-refundable. Please carefully consider your credit needs before making a purchase, as we cannot provide refunds for any credits once purchased, regardless of usage status.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Subscription Plan Changes</h2>
              <p className="mb-4">
                If you have accidentally purchased an annual subscription plan instead of a monthly plan for our AI image generation service, we offer the following accommodation:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">We will convert your annual plan to a monthly plan</li>
                <li className="mb-2">One month of subscription fee plus processing fees will be deducted</li>
                <li className="mb-2">The remaining balance will be refunded to your original payment method</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Non-Refundable Items</h2>
              <p className="mb-4">
                The following items are not eligible for refunds under any circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Credit purchases for AI image generation</li>
                <li className="mb-2">Subscription time that has already passed</li>
                <li className="mb-2">Processing fees</li>
                <li className="mb-2">Subscriptions beyond the 3-day window</li>
                <li className="mb-2">Subscriptions with more than 200 credits used for AI image generation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Refund Process</h2>
              <p className="mb-4">
                To request a refund for eligible AI image generation subscription items, please contact our support team with the following information:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Your account email</li>
                <li className="mb-2">Order number or transaction ID</li>
                <li className="mb-2">Reason for the refund request</li>
                <li className="mb-2">Date of purchase</li>
              </ul>
              <p className="mb-4">
                Refund requests are typically processed within 5-7 business days. The actual time for the refund to appear in your account may vary depending on your payment method and financial institution.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Changes to This Refund Policy</h2>
              <p className="mb-4">
                We reserve the right to update our Refund Policy to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically for any updates.
              </p>
            </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about our refund policy or need to request a refund for our AI image generation services, please contact our support team at <a href={mailtoSupport()} className="text-primary hover:underline">{siteConfig.supportEmail}</a>.
                </p>
                <p className="mb-4">
                  By using our AI image generation services, you acknowledge that you have read and understand this Refund Policy.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-[linear-gradient(180deg,rgb(var(--card)/0.9)_0%,rgb(var(--background)/0.96)_100%)]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-xl font-bold text-primary mb-4">Flux Kontext</div>
            <p className="text-muted-foreground text-sm mb-4">
              Professional AI image generation platform. Create stunning images with advanced AI technology.
            </p>
            <div className="text-sm text-muted-foreground">
              © 2025 Flux Kontext. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
