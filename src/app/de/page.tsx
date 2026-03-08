import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

// 德语页面SEO元数据
export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'de',
  title: 'Flux Kontext AI - Professionelle KI-Bildgenerierung | Erstelle beeindruckende Bilder',
  description: 'Verwandle deine Ideen in professionelle Bilder mit unserer hochmodernen KI-Technologie. Generiere Bilder aus Text, bearbeite vorhandene Bilder und verarbeite mehrere Bilder mit der Kraft von Flux Kontext AI.',
  keywords: ['KI Bildgenerierung', 'Text zu Bild', 'Bildbearbeitung', 'Flux Kontext', 'künstliche Intelligenz', 'professionelle Bilder'],
})

// 德语内容字典
const deDictionary = {
  hero: {
    badge: "Professionelle KI-Bildgenerierungsplattform",
    title: "Erstelle beeindruckende Bilder mit",
    subtitle: "Flux Kontext AI",
    description: "Verwandle deine Ideen in professionelle Bilder mit unserer hochmodernen KI-Technologie. Generiere Bilder aus Text, bearbeite vorhandene Bilder und verarbeite mehrere Bilder mit der Kraft von Flux Kontext AI.",
    cta: {
      primary: "Jetzt erstellen",
      secondary: "Preise ansehen"
    }
  },
  features: {
    title: "Hauptfunktionen der Flux Kontext AI Plattform",
    subtitle: "Unsere Flux Kontext AI kombiniert modernste Technologie, um professionelle Bildgenerierung und -bearbeitung in einer nahtlosen Plattform zu liefern.",
    items: [
      {
        title: "Text-zu-Bild-Generierung",
        description: "Verwandle deine Textbeschreibungen in atemberaubende, hochwertige Bilder mit fortschrittlicher KI-Technologie."
      },
      {
        title: "Professionelle Bildbearbeitung",
        description: "Bearbeite vorhandene Bilder mit natürlichsprachlichen Anweisungen für präzise Änderungen."
      },
      {
        title: "Multi-Bild-Verarbeitung",
        description: "Verarbeite mehrere Bilder gleichzeitig mit konsistentem Stil und Qualität."
      }
    ]
  },
  faq: {
    title: "Häufig gestellte Fragen",
    subtitle: "Finde Antworten auf häufige Fragen zu unserer Flux Kontext AI Plattform und ihren leistungsstarken Bildgenerierungsfunktionen.",
    items: [
      {
        question: "Was ist Flux Kontext AI?",
        answer: "Flux Kontext AI ist eine fortschrittliche Bildgenerierungsplattform, die modernste künstliche Intelligenz nutzt, um atemberaubende Bilder aus Textbeschreibungen zu erstellen, vorhandene Bilder zu bearbeiten und mehrere Bilder gleichzeitig zu verarbeiten."
      },
      {
        question: "Wie funktioniert die Text-zu-Bild-Generierung?",
        answer: "Unsere KI analysiert deine Textbeschreibung und generiert hochwertige Bilder mit fortschrittlichen Flux Pro und Max Modellen. Beschreibe einfach, was du sehen möchtest, und unsere KI erstellt professionelle Bilder in Sekunden."
      }
    ]
  },
  cta: {
    title: "Bereit, erstaunliche Bilder zu erstellen?",
    subtitle: "Schließe dich Tausenden von Kreativen an, die Flux Kontext AI nutzen, um ihre Ideen zum Leben zu erwecken.",
    button: "Jetzt loslegen"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "Professionelle KI-Bildgenerierungsplattform. Erstelle atemberaubende Bilder aus Text, bearbeite vorhandene Bilder und verarbeite mehrere Bilder mit fortschrittlicher KI-Technologie.",
      copyright: "© 2025 Flux Kontext. Alle Rechte vorbehalten."
    },
    contact: {
      title: "Kontakt",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "Rechtliches",
      terms: "Nutzungsbedingungen",
      privacy: "Datenschutzrichtlinie",
      refund: "Rückerstattungsrichtlinie"
    },
    languages: {
      title: "Sprachen"
    },
    social: {
      builtWith: "Mit ❤️ für Kreative weltweit entwickelt",
      followUs: "Folge uns auf"
    }
  }
}

export default function DeutschPage() {
  return <HomeContentSimple dictionary={deDictionary} />
} 
