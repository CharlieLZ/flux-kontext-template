import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'tr',
  title: 'Flux Kontext AI - Profesyonel AI Görüntü Üretim Platformu | Çarpıcı Görüntüler Oluşturun',
  description: 'Fikirlerinizi son teknoloji AI teknolojimizle profesyonel görüntülere dönüştürün. Metinden görüntü üretin, mevcut görüntüleri düzenleyin ve Flux Kontext AI\'nin gücüyle birden fazla görüntüyü işleyin.',
})

const trDictionary = {
  hero: {
    badge: "Profesyonel AI Görüntü Üretim Platformu",
    title: "Çarpıcı Görüntüler Oluşturun",
    subtitle: "Flux Kontext AI",
    description: "Fikirlerinizi son teknoloji AI teknolojimizle profesyonel görüntülere dönüştürün. Metinden görüntü üretin, mevcut görüntüleri düzenleyin ve Flux Kontext AI'nin gücüyle birden fazla görüntüyü işleyin.",
    cta: {
      primary: "Oluşturmaya Başla",
      secondary: "Fiyatları Gör"
    }
  },
  features: {
    title: "Flux Kontext AI Platformunun Ana Özellikleri",
    subtitle: "Flux Kontext AI'mız, tek bir kusursuz platformda profesyonel görüntü üretimi ve düzenleme sunmak için son teknoloji teknolojiyi birleştirir.",
    items: [
      {
        title: "Metin-Görüntü Üretimi",
        description: "Metin açıklamalarınızı gelişmiş AI teknolojisiyle çarpıcı, yüksek kaliteli görüntülere dönüştürün."
      },
      {
        title: "Profesyonel Görüntü Düzenleme",
        description: "Doğal dil talimatlarıyla mevcut görüntüleri hassas değişiklikler için düzenleyin."
      },
      {
        title: "Çoklu Görüntü İşleme",
        description: "Tutarlı stil ve kaliteyle birden fazla görüntüyü aynı anda işleyin."
      }
    ]
  },
  faq: {
    title: "Sık Sorulan Sorular",
    subtitle: "Flux Kontext AI platformumuz ve güçlü görüntü üretim özelliklerimiz hakkında yaygın soruların yanıtlarını bulun.",
    items: [
      {
        question: "Flux Kontext AI nedir?",
        answer: "Flux Kontext AI, metin açıklamalarından çarpıcı görüntüler oluşturmak, mevcut görüntüleri düzenlemek ve birden fazla görüntüyü aynı anda işlemek için son teknoloji yapay zeka kullanan gelişmiş bir görüntü üretim platformudur."
      }
    ]
  },
  cta: {
    title: "Harika Görüntüler Oluşturmaya Hazır mısınız?",
    subtitle: "Fikirlerini hayata geçirmek için Flux Kontext AI kullanan binlerce yaratıcıya katılın.",
    button: "Şimdi Başla"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "Profesyonel AI görüntü üretim platformu.",
      copyright: "© 2025 Flux Kontext. Tüm hakları saklıdır."
    },
    contact: {
      title: "İletişim",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "Yasal",
      terms: "Hizmet Şartları",
      privacy: "Gizlilik Politikası",
      refund: "İade Politikası"
    },
    languages: {
      title: "Diller"
    },
    social: {
      builtWith: "Dünya çapındaki yaratıcılar için ❤️ ile inşa edildi",
      followUs: "Bizi takip edin"
    }
  }
}

export default function TurkishPage() {
  return <HomeContentSimple dictionary={trDictionary} />
} 
