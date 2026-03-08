import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'nl',
  title: 'Flux Kontext AI - Professioneel AI Beeldgeneratie Platform | Maak Verbluffende Beelden',
  description: 'Transformeer je ideeën in professionele beelden met onze geavanceerde AI-technologie. Genereer beelden uit tekst, bewerk bestaande beelden en verwerk meerdere beelden met de kracht van Flux Kontext AI.',
})

const nlDictionary = {
  hero: {
    badge: "Professioneel AI Beeldgeneratie Platform",
    title: "Maak Verbluffende Beelden met",
    subtitle: "Flux Kontext AI",
    description: "Transformeer je ideeën in professionele beelden met onze geavanceerde AI-technologie. Genereer beelden uit tekst, bewerk bestaande beelden en verwerk meerdere beelden met de kracht van Flux Kontext AI.",
    cta: {
      primary: "Begin met Maken",
      secondary: "Bekijk Prijzen"
    }
  },
  features: {
    title: "Hoofdkenmerken van het Flux Kontext AI Platform",
    subtitle: "Onze Flux Kontext AI combineert geavanceerde technologie om professionele beeldgeneratie en -bewerking te leveren in één naadloos platform.",
    items: [
      {
        title: "Tekst naar Beeld Generatie",
        description: "Transformeer je tekstbeschrijvingen in verbluffende, hoogwaardige beelden met geavanceerde AI-technologie."
      },
      {
        title: "Professionele Beeldbewerking",
        description: "Bewerk bestaande beelden met natuurlijke taalinstructies voor precieze wijzigingen."
      },
      {
        title: "Multi-Beeld Verwerking",
        description: "Verwerk meerdere beelden tegelijkertijd met consistente stijl en kwaliteit."
      }
    ]
  },
  faq: {
    title: "Veelgestelde Vragen",
    subtitle: "Vind antwoorden op veelgestelde vragen over ons Flux Kontext AI platform en zijn krachtige beeldgeneratie functies.",
    items: [
      {
        question: "Wat is Flux Kontext AI?",
        answer: "Flux Kontext AI is een geavanceerd beeldgeneratie platform dat geavanceerde kunstmatige intelligentie gebruikt om verbluffende beelden te maken uit tekstbeschrijvingen, bestaande beelden te bewerken en meerdere beelden tegelijkertijd te verwerken."
      }
    ]
  },
  cta: {
    title: "Klaar om Geweldige Beelden te Maken?",
    subtitle: "Sluit je aan bij duizenden makers die Flux Kontext AI gebruiken om hun ideeën tot leven te brengen.",
    button: "Begin Nu"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "Professioneel AI beeldgeneratie platform.",
      copyright: "© 2025 Flux Kontext. Alle rechten voorbehouden."
    },
    contact: {
      title: "Contact",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "Juridisch",
      terms: "Servicevoorwaarden",
      privacy: "Privacybeleid",
      refund: "Terugbetalingsbeleid"
    },
    languages: {
      title: "Talen"
    },
    social: {
      builtWith: "Gebouwd met ❤️ voor makers wereldwijd",
      followUs: "Volg ons op"
    }
  }
}

export default function NederlandsPage() {
  return <HomeContentSimple dictionary={nlDictionary} />
} 
