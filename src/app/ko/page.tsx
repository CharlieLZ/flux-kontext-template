import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'ko',
  title: 'Flux Kontext AI - 전문 AI 이미지 생성 플랫폼 | 놀라운 이미지 만들기',
  description: '최첨단 AI 기술로 아이디어를 전문적인 이미지로 변환하세요. 텍스트에서 이미지를 생성하고, 기존 이미지를 편집하며, Flux Kontext AI의 힘으로 여러 이미지를 처리하세요.',
})

const koDictionary = {
  hero: {
    badge: "전문 AI 이미지 생성 플랫폼",
    title: "놀라운 이미지 만들기",
    subtitle: "Flux Kontext AI",
    description: "최첨단 AI 기술로 아이디어를 전문적인 이미지로 변환하세요. 텍스트에서 이미지를 생성하고, 기존 이미지를 편집하며, Flux Kontext AI의 힘으로 여러 이미지를 처리하세요.",
    cta: {
      primary: "만들기 시작",
      secondary: "가격 보기"
    }
  },
  features: {
    title: "Flux Kontext AI 플랫폼의 주요 기능",
    subtitle: "우리의 Flux Kontext AI는 최첨단 기술을 결합하여 하나의 완벽한 플랫폼에서 전문적인 이미지 생성과 편집을 제공합니다.",
    items: [
      {
        title: "텍스트-이미지 생성",
        description: "고급 AI 기술로 텍스트 설명을 놀랍고 고품질의 이미지로 변환하세요."
      },
      {
        title: "전문 이미지 편집",
        description: "자연어 지시로 기존 이미지를 편집하여 정확한 수정을 하세요."
      },
      {
        title: "다중 이미지 처리",
        description: "일관된 스타일과 품질로 여러 이미지를 동시에 처리하세요."
      }
    ]
  },
  faq: {
    title: "자주 묻는 질문",
    subtitle: "Flux Kontext AI 플랫폼과 강력한 이미지 생성 기능에 대한 일반적인 질문의 답변을 찾아보세요.",
    items: [
      {
        question: "Flux Kontext AI란 무엇인가요?",
        answer: "Flux Kontext AI는 최첨단 인공지능을 사용하여 텍스트 설명에서 놀라운 이미지를 만들고, 기존 이미지를 편집하며, 여러 이미지를 동시에 처리하는 고급 이미지 생성 플랫폼입니다."
      }
    ]
  },
  cta: {
    title: "놀라운 이미지를 만들 준비가 되셨나요?",
    subtitle: "Flux Kontext AI를 사용하여 아이디어를 실현하는 수천 명의 크리에이터들과 함께하세요.",
    button: "지금 시작하기"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "전문 AI 이미지 생성 플랫폼.",
      copyright: "© 2025 Flux Kontext. 모든 권리 보유."
    },
    contact: {
      title: "연락처",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "법적 고지",
      terms: "서비스 약관",
      privacy: "개인정보 보호정책",
      refund: "환불 정책"
    },
    languages: {
      title: "언어"
    },
    social: {
      builtWith: "전 세계 크리에이터를 위해 ❤️로 제작",
      followUs: "팔로우하기"
    }
  }
}

export default function KoreanPage() {
  return <HomeContentSimple dictionary={koDictionary} />
} 
