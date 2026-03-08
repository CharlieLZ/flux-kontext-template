// 多语言SEO元数据生成器
// 统一管理canonical链接和hreflang配置，避免配置错误

import { Metadata } from 'next'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_NAMES } from '@/lib/content/locale'
import { siteConfig } from '@/lib/site-config'

interface MetadataConfig {
  title: string
  description: string
  keywords?: string[]
  path: string
  locale?: string
  images?: string[]
  type?: 'website' | 'article'
}

/**
 * 生成多语言SEO元数据
 * 自动处理canonical链接和hreflang配置
 * @param config 页面配置
 * @returns 完整的Next.js Metadata对象
 */
export function generateMultilingualMetadata(config: MetadataConfig): Metadata {
  const { 
    title, 
    description, 
    keywords = [], 
    path, 
    locale = DEFAULT_LOCALE, 
    images = [],
    type = 'website'
  } = config
  
  // 强制使用HTTPS协议，确保SEO和安全性
  const baseUrl = siteConfig.siteUrl
  
  // 生成当前页面的canonical URL
  const canonicalPath = locale === DEFAULT_LOCALE ? path : `/${locale}${path}`
  const canonicalUrl = `${baseUrl}${canonicalPath}`
  
  // 生成所有语言的hreflang链接
  const languages: Record<string, string> = {}
  
  // x-default始终指向默认语言版本
  languages['x-default'] = `${baseUrl}${path}`
  
  // 为每种支持的语言生成链接
  SUPPORTED_LOCALES.forEach(lang => {
    if (lang === DEFAULT_LOCALE) {
      // 默认语言不带前缀
      languages[lang] = `${baseUrl}${path}`
    } else {
      // 其他语言带语言前缀
      languages[lang] = `${baseUrl}/${lang}${path}`
    }
  })
  
  // 处理OpenGraph locale格式
  const getOpenGraphLocale = (locale: string): string => {
    const localeMap: Record<string, string> = {
      'en': 'en_US',
      'zh': 'zh_CN',
      'de': 'de_DE',
      'es': 'es_ES',
      'fr': 'fr_FR',
      'it': 'it_IT',
      'ja': 'ja_JP',
      'ko': 'ko_KR',
      'nl': 'nl_NL',
      'pl': 'pl_PL',
      'pt': 'pt_BR',
      'ru': 'ru_RU',
      'tr': 'tr_TR',
      'ar': 'ar_SA',
      'hi': 'hi_IN',
      'bn': 'bn_BD'
    }
    return localeMap[locale] || 'en_US'
  }
  
  // 生成其他语言的OpenGraph alternateLocale
  const alternateLocales = SUPPORTED_LOCALES
    .filter(l => l !== locale)
    .map(l => getOpenGraphLocale(l))
  
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type,
      locale: getOpenGraphLocale(locale),
      alternateLocale: alternateLocales,
      siteName: 'Flux Kontext',
      images: images.map(img => ({
        url: img.startsWith('http') ? img : `${baseUrl}${img}`,
        width: 1200,
        height: 630,
        alt: title,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
      creator: '@fluxkontext',
      site: '@fluxkontext',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },
  }
}

/**
 * 生成多语言sitemap数据
 * @param pages 页面配置数组
 * @returns sitemap URL数组
 */
export function generateMultilingualSitemap(pages: Array<{path: string, priority?: number, changeFreq?: string}>) {
  // 强制使用HTTPS协议，确保SEO和安全性
  const baseUrl = siteConfig.siteUrl
  const urls: Array<{
    url: string
    lastModified: Date
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority: number
    alternates?: {
      languages: Record<string, string>
    }
  }> = []
  
  pages.forEach(page => {
    // 为每个页面生成所有语言版本
    SUPPORTED_LOCALES.forEach(locale => {
      const path = locale === DEFAULT_LOCALE ? page.path : `/${locale}${page.path}`
      const url = `${baseUrl}${path}`
      
      // 生成该页面所有语言版本的链接
      const languages: Record<string, string> = {}
      SUPPORTED_LOCALES.forEach(lang => {
        const langPath = lang === DEFAULT_LOCALE ? page.path : `/${lang}${page.path}`
        languages[lang] = `${baseUrl}${langPath}`
      })
      languages['x-default'] = `${baseUrl}${page.path}`
      
      urls.push({
        url,
        lastModified: new Date(),
        changeFrequency: (page.changeFreq as any) || 'weekly',
        priority: page.priority || 0.8,
        alternates: {
          languages
        }
      })
    })
  })
  
  return urls
}

export function generateLocalizedHomeMetadata(config: Omit<MetadataConfig, 'path'>) {
  return generateMultilingualMetadata({
    ...config,
    path: '/',
  })
}

/**
 * 验证hreflang配置
 * 用于开发时检查配置是否正确
 * @param metadata Metadata对象
 * @returns 验证结果
 */
export function validateHreflangConfig(metadata: Metadata): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!metadata.alternates?.canonical) {
    errors.push('缺少canonical链接')
  }
  
  if (!metadata.alternates?.languages) {
    errors.push('缺少hreflang配置')
  } else {
    const languages = metadata.alternates.languages
    
    // 检查是否有x-default
    if (!languages['x-default']) {
      errors.push('缺少x-default hreflang')
    }
    
    // 检查是否包含所有支持的语言
    SUPPORTED_LOCALES.forEach(locale => {
      if (!languages[locale]) {
        warnings.push(`缺少${locale}语言的hreflang`)
      }
    })
    
    // 检查URL格式
    Object.entries(languages).forEach(([lang, url]) => {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        errors.push(`${lang}的hreflang URL格式错误: ${url}`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// 预定义的页面配置
export const PAGE_CONFIGS = {
  home: {
    path: '/',
    priority: 1.0,
    changeFreq: 'daily'
  },
  generate: {
    path: '/generate',
    priority: 0.9,
    changeFreq: 'daily'
  },
  pricing: {
    path: '/pricing',
    priority: 0.8,
    changeFreq: 'weekly'
  },
  resources: {
    path: '/resources',
    priority: 0.7,
    changeFreq: 'weekly'
  },
  dashboard: {
    path: '/dashboard',
    priority: 0.6,
    changeFreq: 'daily'
  },
  auth: {
    path: '/auth/signin',
    priority: 0.5,
    changeFreq: 'monthly'
  }
} as const 
