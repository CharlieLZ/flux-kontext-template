import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

// 中文页面SEO元数据
export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'zh',
  title: 'Flux Kontext AI - 专业AI图像生成平台 | 创建令人惊艳的图像',
  description: '使用我们尖端的AI技术将您的想法转化为专业图像。从文本生成图像，编辑现有图像，并使用Flux Kontext AI的强大功能处理多张图像。',
  keywords: ['AI图像生成', '文本转图像', '图像编辑', 'Flux Kontext', '人工智能', '专业图像'],
})

// 中文内容字典
const zhDictionary = {
  hero: {
    badge: "专业AI图像生成平台",
    title: "使用以下工具创建令人惊艳的图像",
    subtitle: "Flux Kontext AI",
    description: "使用我们尖端的AI技术将您的想法转化为专业图像。从文本生成图像，编辑现有图像，并使用Flux Kontext AI的强大功能处理多张图像。",
    cta: {
      primary: "开始创建",
      secondary: "查看价格"
    }
  },
  features: {
    title: "Flux Kontext AI平台的主要功能",
    subtitle: "我们的Flux Kontext AI结合尖端技术，在一个无缝平台中提供专业的图像生成和编辑。",
    items: [
      {
        title: "文本转图像生成",
        description: "使用先进的AI技术将您的文本描述转换为令人惊艳的高质量图像。"
      },
      {
        title: "专业图像编辑",
        description: "使用自然语言指令编辑现有图像，实现精确修改。"
      },
      {
        title: "多图像处理",
        description: "同时处理多张图像，保持一致的风格和质量。"
      }
    ]
  },
  faq: {
    title: "常见问题",
    subtitle: "找到关于我们Flux Kontext AI平台及其强大图像生成功能的常见问题答案。",
    items: [
      {
        question: "什么是Flux Kontext AI？",
        answer: "Flux Kontext AI是一个先进的图像生成平台，使用尖端人工智能从文本描述创建令人惊艳的图像，编辑现有图像，并同时处理多张图像。"
      },
      {
        question: "文本转图像生成是如何工作的？",
        answer: "我们的AI分析您的文本描述，并使用先进的Flux Pro和Max模型生成高质量图像。只需描述您想看到的内容，我们的AI就会在几秒钟内创建专业级图像。"
      }
    ]
  },
  cta: {
    title: "准备创建令人惊艳的图像了吗？",
    subtitle: "加入成千上万使用Flux Kontext AI将想法变为现实的创作者。",
    button: "立即开始"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "专业AI图像生成平台。从文本创建令人惊艳的图像，编辑现有图像，并使用先进的AI技术处理多张图像。",
      copyright: "© 2025 Flux Kontext. 保留所有权利。"
    },
    contact: {
      title: "联系我们",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "法律条款",
      terms: "服务条款",
      privacy: "隐私政策",
      refund: "退款政策"
    },
    languages: {
      title: "语言"
    },
    social: {
      builtWith: "用❤️为全世界的创作者打造",
      followUs: "关注我们"
    }
  }
}

export default function ChinesePage() {
  return <HomeContentSimple dictionary={zhDictionary} />
} 
