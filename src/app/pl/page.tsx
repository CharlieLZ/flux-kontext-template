import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'pl',
  title: 'Flux Kontext AI - Profesjonalna Platforma Generowania Obrazów AI | Twórz Oszałamiające Obrazy',
  description: 'Przekształć swoje pomysły w profesjonalne obrazy dzięki naszej najnowocześniejszej technologii AI. Generuj obrazy z tekstu, edytuj istniejące obrazy i przetwarzaj wiele obrazów z mocą Flux Kontext AI.',
})

const plDictionary = {
  hero: {
    badge: "Profesjonalna Platforma Generowania Obrazów AI",
    title: "Twórz Oszałamiające Obrazy z",
    subtitle: "Flux Kontext AI",
    description: "Przekształć swoje pomysły w profesjonalne obrazy dzięki naszej najnowocześniejszej technologii AI. Generuj obrazy z tekstu, edytuj istniejące obrazy i przetwarzaj wiele obrazów z mocą Flux Kontext AI.",
    cta: {
      primary: "Zacznij Tworzyć",
      secondary: "Zobacz Ceny"
    }
  },
  features: {
    title: "Główne Funkcje Platformy Flux Kontext AI",
    subtitle: "Nasza Flux Kontext AI łączy najnowocześniejszą technologię, aby dostarczyć profesjonalne generowanie i edycję obrazów w jednej płynnej platformie.",
    items: [
      {
        title: "Generowanie Tekst-Obraz",
        description: "Przekształć swoje opisy tekstowe w oszałamiające, wysokiej jakości obrazy dzięki zaawansowanej technologii AI."
      },
      {
        title: "Profesjonalna Edycja Obrazów",
        description: "Edytuj istniejące obrazy za pomocą instrukcji w języku naturalnym dla precyzyjnych modyfikacji."
      },
      {
        title: "Przetwarzanie Wielu Obrazów",
        description: "Przetwarzaj wiele obrazów jednocześnie z konsekwentnym stylem i jakością."
      }
    ]
  },
  faq: {
    title: "Często Zadawane Pytania",
    subtitle: "Znajdź odpowiedzi na często zadawane pytania dotyczące naszej platformy Flux Kontext AI i jej potężnych funkcji generowania obrazów.",
    items: [
      {
        question: "Czym jest Flux Kontext AI?",
        answer: "Flux Kontext AI to zaawansowana platforma generowania obrazów, która wykorzystuje najnowocześniejszą sztuczną inteligencję do tworzenia oszałamiających obrazów z opisów tekstowych, edycji istniejących obrazów i przetwarzania wielu obrazów jednocześnie."
      }
    ]
  },
  cta: {
    title: "Gotowy na Tworzenie Niesamowitych Obrazów?",
    subtitle: "Dołącz do tysięcy twórców, którzy używają Flux Kontext AI, aby ożywić swoje pomysły.",
    button: "Zacznij Teraz"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "Profesjonalna platforma generowania obrazów AI.",
      copyright: "© 2025 Flux Kontext. Wszelkie prawa zastrzeżone."
    },
    contact: {
      title: "Kontakt",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "Prawne",
      terms: "Warunki Usługi",
      privacy: "Polityka Prywatności",
      refund: "Polityka Zwrotów"
    },
    languages: {
      title: "Języki"
    },
    social: {
      builtWith: "Zbudowane z ❤️ dla twórców na całym świecie",
      followUs: "Śledź nas na"
    }
  }
}

export default function PolishPage() {
  return <HomeContentSimple dictionary={plDictionary} />
} 
