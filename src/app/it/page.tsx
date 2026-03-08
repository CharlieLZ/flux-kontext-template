import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'it',
  title: 'Flux Kontext AI - Generazione Professionale di Immagini IA | Crea Immagini Straordinarie',
  description: 'Trasforma le tue idee in immagini professionali con la nostra tecnologia IA all\'avanguardia. Genera immagini dal testo, modifica immagini esistenti e elabora più immagini con la potenza di Flux Kontext AI.',
})

const itDictionary = {
  hero: {
    badge: "Piattaforma Professionale di Generazione Immagini IA",
    title: "Crea Immagini Straordinarie con",
    subtitle: "Flux Kontext AI",
    description: "Trasforma le tue idee in immagini professionali con la nostra tecnologia IA all'avanguardia. Genera immagini dal testo, modifica immagini esistenti e elabora più immagini con la potenza di Flux Kontext AI.",
    cta: {
      primary: "Inizia a Creare",
      secondary: "Vedi Prezzi"
    }
  },
  features: {
    title: "Caratteristiche Principali della Piattaforma Flux Kontext AI",
    subtitle: "La nostra Flux Kontext AI combina tecnologia all'avanguardia per offrire generazione e modifica di immagini professionali in una piattaforma senza soluzione di continuità.",
    items: [
      {
        title: "Generazione Testo-Immagine",
        description: "Trasforma le tue descrizioni testuali in immagini straordinarie e di alta qualità con tecnologia IA avanzata."
      },
      {
        title: "Modifica Professionale di Immagini",
        description: "Modifica immagini esistenti con istruzioni in linguaggio naturale per modifiche precise."
      },
      {
        title: "Elaborazione Multi-Immagine",
        description: "Elabora più immagini simultaneamente con stile e qualità coerenti."
      }
    ]
  },
  faq: {
    title: "Domande Frequenti",
    subtitle: "Trova risposte alle domande comuni sulla nostra piattaforma Flux Kontext AI e le sue potenti funzionalità di generazione immagini.",
    items: [
      {
        question: "Cos'è Flux Kontext AI?",
        answer: "Flux Kontext AI è una piattaforma avanzata di generazione immagini che utilizza intelligenza artificiale all'avanguardia per creare immagini straordinarie da descrizioni testuali, modificare immagini esistenti ed elaborare più immagini simultaneamente."
      }
    ]
  },
  cta: {
    title: "Pronto a Creare Immagini Incredibili?",
    subtitle: "Unisciti a migliaia di creatori che usano Flux Kontext AI per dare vita alle loro idee.",
    button: "Inizia Ora"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "Piattaforma professionale di generazione immagini IA.",
      copyright: "© 2025 Flux Kontext. Tutti i diritti riservati."
    },
    contact: {
      title: "Contatto",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "Legale",
      terms: "Termini di Servizio",
      privacy: "Politica sulla Privacy",
      refund: "Politica di Rimborso"
    },
    languages: {
      title: "Lingue"
    },
    social: {
      builtWith: "Costruito con ❤️ per creatori in tutto il mondo",
      followUs: "Seguici su"
    }
  }
}

export default function ItalianoPage() {
  return <HomeContentSimple dictionary={itDictionary} />
} 
