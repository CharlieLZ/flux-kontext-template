import Link from "next/link"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import type { HomeDictionary } from "@/lib/i18n/home-config"

interface HomeContentSimpleProps {
  dictionary: HomeDictionary
}

export function HomeContentSimple({ dictionary }: HomeContentSimpleProps) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="hero-gradient absolute inset-0 pointer-events-none" />
          <div className="relative z-10">
            <div className="app-tint-badge mb-6 inline-block rounded-full px-4 py-2 text-sm">
              {dictionary.hero.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              {dictionary.hero.title}
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-primary">
              {dictionary.hero.subtitle}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4 md:px-0 leading-relaxed">
              {dictionary.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/generate">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" fill="currentColor"/>
                  </svg>
                  {dictionary.hero.cta.primary}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-primary/20 bg-background/60 px-6 py-3 text-base backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 md:px-8 md:py-4 md:text-lg"
                >
                  {dictionary.hero.cta.secondary}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {dictionary.features.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {dictionary.features.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {dictionary.features.items.map((feature, index) => (
              <div key={index} className="app-surface-card app-surface-card--interactive rounded-2xl p-6 text-center">
                <div className="app-icon-surface mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" fill="currentColor"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="app-section-shell px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {dictionary.faq.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {dictionary.faq.subtitle}
            </p>
          </div>
          <div className="space-y-6">
            {dictionary.faq.items.map((item, index) => (
              <div key={index} className="app-surface-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="app-cta-panel rounded-3xl px-6 py-12 text-center md:px-10">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {dictionary.cta.title}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {dictionary.cta.subtitle}
            </p>
            <Link href="/generate">
              <Button 
                size="lg" 
                className="bg-primary px-8 py-4 text-lg text-primary-foreground transition-all duration-200 hover:scale-105 hover:bg-primary/90 active:scale-95"
              >
                {dictionary.cta.button}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* 推特脚本 - 确保推特内容正常加载 */}
      <Script 
        src="https://platform.twitter.com/widgets.js" 
        strategy="lazyOnload"
      />
    </div>
  )
} 
