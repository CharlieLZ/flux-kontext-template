import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

// 西班牙语页面SEO元数据
export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'es',
  title: 'Flux Kontext AI - Generación Profesional de Imágenes IA | Crea Imágenes Impresionantes',
  description: 'Transforma tus ideas en imágenes profesionales con nuestra tecnología de IA de vanguardia. Genera imágenes desde texto, edita imágenes existentes y procesa múltiples imágenes con el poder de Flux Kontext AI.',
  keywords: ['generación de imágenes IA', 'texto a imagen', 'edición de imágenes', 'Flux Kontext', 'inteligencia artificial', 'imágenes profesionales'],
})

// 西班牙语内容字典
const esDictionary = {
  hero: {
    badge: "Plataforma Profesional de Generación de Imágenes IA",
    title: "Crea Imágenes Impresionantes con",
    subtitle: "Flux Kontext AI",
    description: "Transforma tus ideas en imágenes profesionales con nuestra tecnología de IA de vanguardia. Genera imágenes desde texto, edita imágenes existentes y procesa múltiples imágenes con el poder de Flux Kontext AI.",
    cta: {
      primary: "Comenzar a Crear",
      secondary: "Ver Precios"
    }
  },
  features: {
    title: "Características Principales de la Plataforma Flux Kontext AI",
    subtitle: "Nuestra Flux Kontext AI combina tecnología de vanguardia para ofrecer generación y edición de imágenes profesionales en una plataforma perfecta.",
    items: [
      {
        title: "Generación de Texto a Imagen",
        description: "Transforma tus descripciones de texto en imágenes impresionantes y de alta calidad con tecnología de IA avanzada."
      },
      {
        title: "Edición Profesional de Imágenes",
        description: "Edita imágenes existentes con instrucciones en lenguaje natural para modificaciones precisas."
      },
      {
        title: "Procesamiento Multi-Imagen",
        description: "Procesa múltiples imágenes simultáneamente con estilo y calidad consistentes."
      }
    ]
  },
  faq: {
    title: "Preguntas Frecuentes",
    subtitle: "Encuentra respuestas a preguntas comunes sobre nuestra plataforma Flux Kontext AI y sus potentes características de generación de imágenes.",
    items: [
      {
        question: "¿Qué es Flux Kontext AI?",
        answer: "Flux Kontext AI es una plataforma avanzada de generación de imágenes que utiliza inteligencia artificial de vanguardia para crear imágenes impresionantes desde descripciones de texto, editar imágenes existentes y procesar múltiples imágenes simultáneamente."
      },
      {
        question: "¿Cómo funciona la generación de texto a imagen?",
        answer: "Nuestra IA analiza tu descripción de texto y genera imágenes de alta calidad usando modelos avanzados Flux Pro y Max. Simplemente describe lo que quieres ver, y nuestra IA crea imágenes de calidad profesional en segundos."
      }
    ]
  },
  cta: {
    title: "¿Listo para Crear Imágenes Increíbles?",
    subtitle: "Únete a miles de creadores que usan Flux Kontext AI para dar vida a sus ideas.",
    button: "Empezar Ahora"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "Plataforma profesional de generación de imágenes IA. Crea imágenes impresionantes desde texto, edita imágenes existentes y procesa múltiples imágenes con tecnología de IA avanzada.",
      copyright: "© 2025 Flux Kontext. Todos los derechos reservados."
    },
    contact: {
      title: "Contacto",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "Legal",
      terms: "Términos de Servicio",
      privacy: "Política de Privacidad",
      refund: "Política de Reembolso"
    },
    languages: {
      title: "Idiomas"
    },
    social: {
      builtWith: "Construido con ❤️ para creadores de todo el mundo",
      followUs: "Síguenos en"
    }
  }
}

export default function EspanolPage() {
  return <HomeContentSimple dictionary={esDictionary} />
} 
