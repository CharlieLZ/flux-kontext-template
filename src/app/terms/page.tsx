import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Flux Kontext',
  description: 'Terms of Service for Flux Kontext AI image generation platform. Read our terms and conditions for using our professional AI image generation service.',
  keywords: ['terms of service', 'flux kontext terms', 'ai image generation terms', 'flux ai terms'],
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service | Flux Kontext',
    description: 'Terms of Service for Flux Kontext AI image generation platform.',
    url: '/terms',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | Flux Kontext',
    description: 'Terms of Service for Flux Kontext AI image generation platform',
  },
}

export default function TermsPage() {
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
              <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            
            <div className="text-sm text-muted-foreground mb-8">
              <p>Posted on: January 20, 2025</p>
              <p>Last updated: January 20, 2025</p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                This website is operated by Flux Kontext. Throughout the site, the terms "we", "us", and "our" refer to Flux Kontext. 
                Flux Kontext provides this website, including all information, tools, and services available from this site to you, 
                the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
              </p>
              <p className="mb-4">
                By accessing our site and/or using our AI image generation service, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Use of the Service</h2>
              <p className="mb-4">
                You are permitted to use this website for generating and editing images using our AI technology. The Service must not be used for any illegal or unauthorized purposes. You agree to comply with all applicable laws, rules, and regulations in connection with your use of the website and its content.
              </p>
              <p className="mb-4">
                You may not use our AI image generator to create content that is harmful, offensive, violates any third-party rights, or infringes on intellectual property.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Access</h2>
              <p className="mb-4">
                We reserve the right, at our sole discretion, to withdraw or modify this website and any service or material we provide on the website, without notice. We will not be liable if, for any reason, all or any part of the website is unavailable at any time or for any duration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property Rights</h2>
              <p className="mb-4">
                All content and materials on this website are the property of Flux Kontext and are protected by copyright, trademark, and other relevant laws. You may view, copy, and print materials from the website strictly in accordance with these Terms of Service.
              </p>
              <p className="mb-4">
                Images generated using our AI image generation service belong to you, the user, subject to our usage policies and applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Disclaimer of Warranties & Limitations of Liability</h2>
              <p className="mb-4">
                This website, along with all the information, content, and materials, is provided by Flux Kontext on an "as is" and "as available" basis. Flux Kontext makes no representations or warranties of any kind, whether express or implied.
              </p>
              <p className="mb-4">
                Flux Kontext will not be liable for any damages of any kind arising from your use of this website or our AI image generation service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
              <p className="mb-4">
                These Terms will be governed by and interpreted in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Changes To Terms of Service</h2>
                <p className="mb-4">
                  The most current version of the Terms of Service can always be reviewed on this page. We reserve the right, at our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website.
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
