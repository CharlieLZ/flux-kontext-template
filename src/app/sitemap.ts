import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.siteUrl
  
  // 支持的语言列表
  const languages = ['en', 'de', 'es', 'zh', 'fr', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru', 'tr', 'ar', 'hi', 'bn']
  
  // 核心页面路径
  const corePages = [
    { path: '/', priority: 1.0, changeFreq: 'daily' },
    { path: '/generate', priority: 0.9, changeFreq: 'daily' },
    { path: '/pricing', priority: 0.8, changeFreq: 'weekly' },
    { path: '/resources', priority: 0.7, changeFreq: 'weekly' },
    { path: '/features', priority: 0.7, changeFreq: 'weekly' },
  ]
  
  // 法律页面
  const legalPages = [
    { path: '/terms', priority: 0.3, changeFreq: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFreq: 'monthly' },
    { path: '/refund', priority: 0.3, changeFreq: 'monthly' },
  ]
  
  // 认证和仪表板页面
  const authPages = [
    { path: '/dashboard', priority: 0.6, changeFreq: 'daily' },
  ]
  
  const sitemap: MetadataRoute.Sitemap = []
  
  // 生成英语版本（默认语言）
  const allPages = [...corePages, ...legalPages, ...authPages]
  allPages.forEach(page => {
    // 为首页生成hreflang配置
    if (page.path === '/') {
      const languagesMap: Record<string, string> = {}
      languages.forEach(lang => {
        if (lang === 'en') {
          languagesMap[lang] = baseUrl
        } else {
          languagesMap[lang] = `${baseUrl}/${lang}`
        }
      })
      languagesMap['x-default'] = baseUrl
      
      sitemap.push({
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: page.changeFreq as 'daily' | 'weekly' | 'monthly',
        priority: page.priority,
        alternates: {
          languages: languagesMap
        }
      })
    } else {
      sitemap.push({
        url: `${baseUrl}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq as 'daily' | 'weekly' | 'monthly',
        priority: page.priority,
      })
    }
  })
  
  // 生成多语言首页版本（除英语外的15种语言）
  languages.filter(lang => lang !== 'en').forEach(lang => {
    const languagesMap: Record<string, string> = {}
    languages.forEach(l => {
      if (l === 'en') {
        languagesMap[l] = baseUrl
      } else {
        languagesMap[l] = `${baseUrl}/${l}`
      }
    })
    languagesMap['x-default'] = baseUrl
    
    sitemap.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8, // 多语言首页优先级稍低于英语首页
      alternates: {
        languages: languagesMap
      }
    })
  })
  
  return sitemap
} 
