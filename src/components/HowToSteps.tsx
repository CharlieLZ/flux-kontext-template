import Link from "next/link"
import { Button } from "@/components/ui/button"
// 导入文案系统
import { home, common } from "@/lib/content"

interface Step {
  number: string
  icon: string
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: home.howTo.steps[0].number,
    icon: "https://ext.same-assets.com/3508820607/2306923860.svg",
    title: home.howTo.steps[0].title,
    description: home.howTo.steps[0].description
  },
  {
    number: home.howTo.steps[1].number,
    icon: "https://ext.same-assets.com/3508820607/1729729583.svg",
    title: home.howTo.steps[1].title,
    description: home.howTo.steps[1].description
  },
  {
    number: home.howTo.steps[2].number,
    icon: "https://ext.same-assets.com/3508820607/3141040381.svg",
    title: home.howTo.steps[2].title,
    description: home.howTo.steps[2].description
  },
  {
    number: home.howTo.steps[3].number,
    icon: "https://ext.same-assets.com/3508820607/416511638.svg",
    title: home.howTo.steps[3].title,
    description: home.howTo.steps[3].description
  }
]

export function HowToSteps() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            {home.howTo.alternativeTitle}
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            {home.howTo.alternativeDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={`step-${step.number}-${step.title.replace(/\s+/g, '-').toLowerCase()}`} className="text-center group">
              <div className="relative mb-6">
                {/* Step Number Circle */}
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-primary-foreground">{step.number}</span>
                </div>

                {/* Step Icon */}
                <div className="app-icon-surface app-icon-surface--accent mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
                  <img
                    src={step.icon}
                    alt={`${step.title} - AI Image Generation Step ${step.number} Icon`}
                    className="w-6 h-6 filter brightness-0 invert opacity-80"
                    style={{
                      filter: 'brightness(0) saturate(100%) invert(54%) sepia(91%) saturate(2046%) hue-rotate(191deg) brightness(101%) contrast(103%)'
                    }}
                    loading="lazy"
                    width="24"
                    height="24"
                  />
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary/30 transform -translate-y-1/2" />
                )}
              </div>

              <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/generate">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" fill="currentColor"/>
              </svg>
              {common.buttons.startCreatingAI}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
