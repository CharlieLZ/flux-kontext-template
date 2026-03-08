import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'fr',
  title: 'Flux Kontext AI - Génération Professionnelle d\'Images IA | Créez des Images Époustouflantes',
  description: 'Transformez vos idées en images professionnelles avec notre technologie IA de pointe. Générez des images à partir de texte, éditez des images existantes et traitez plusieurs images avec la puissance de Flux Kontext AI.',
  keywords: ['génération d\'images IA', 'texte vers image', 'édition d\'images', 'Flux Kontext', 'intelligence artificielle', 'images professionnelles'],
})

const frDictionary = {
  hero: {
    badge: "Plateforme Professionnelle de Génération d'Images IA",
    title: "Créez des Images Époustouflantes avec",
    subtitle: "Flux Kontext AI",
    description: "Transformez vos idées en images professionnelles avec notre technologie IA de pointe. Générez des images à partir de texte, éditez des images existantes et traitez plusieurs images avec la puissance de Flux Kontext AI.",
    cta: {
      primary: "Commencer à Créer",
      secondary: "Voir les Prix"
    }
  },
  features: {
    title: "Fonctionnalités Principales de la Plateforme Flux Kontext AI",
    subtitle: "Notre Flux Kontext AI combine une technologie de pointe pour offrir une génération et une édition d'images professionnelles dans une plateforme transparente.",
    items: [
      {
        title: "Génération Texte vers Image",
        description: "Transformez vos descriptions textuelles en images époustouflantes et de haute qualité avec une technologie IA avancée."
      },
      {
        title: "Édition Professionnelle d'Images",
        description: "Éditez des images existantes avec des instructions en langage naturel pour des modifications précises."
      },
      {
        title: "Traitement Multi-Images",
        description: "Traitez plusieurs images simultanément avec un style et une qualité cohérents."
      }
    ]
  },
  faq: {
    title: "Questions Fréquemment Posées",
    subtitle: "Trouvez des réponses aux questions courantes sur notre plateforme Flux Kontext AI et ses puissantes fonctionnalités de génération d'images.",
    items: [
      {
        question: "Qu'est-ce que Flux Kontext AI ?",
        answer: "Flux Kontext AI est une plateforme avancée de génération d'images qui utilise l'intelligence artificielle de pointe pour créer des images époustouflantes à partir de descriptions textuelles, éditer des images existantes et traiter plusieurs images simultanément."
      },
      {
        question: "Comment fonctionne la génération texte vers image ?",
        answer: "Notre IA analyse votre description textuelle et génère des images de haute qualité en utilisant des modèles avancés Flux Pro et Max. Décrivez simplement ce que vous voulez voir, et notre IA crée des images de qualité professionnelle en quelques secondes."
      }
    ]
  },
  cta: {
    title: "Prêt à Créer des Images Incroyables ?",
    subtitle: "Rejoignez des milliers de créateurs qui utilisent Flux Kontext AI pour donner vie à leurs idées.",
    button: "Commencer Maintenant"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "Plateforme professionnelle de génération d'images IA. Créez des images époustouflantes à partir de texte, éditez des images existantes et traitez plusieurs images avec une technologie IA avancée.",
      copyright: "© 2025 Flux Kontext. Tous droits réservés."
    },
    contact: {
      title: "Contact",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "Légal",
      terms: "Conditions de Service",
      privacy: "Politique de Confidentialité",
      refund: "Politique de Remboursement"
    },
    languages: {
      title: "Langues"
    },
    social: {
      builtWith: "Construit avec ❤️ pour les créateurs du monde entier",
      followUs: "Suivez-nous sur"
    }
  }
}

export default function FrancaisPage() {
  return <HomeContentSimple dictionary={frDictionary} />
} 
