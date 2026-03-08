import { NextRequest, NextResponse } from 'next/server'

// 简单的内存速率限制器 (生产环境建议使用Redis)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

function rateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const record = rateLimitMap.get(ip)
  
  if (!record || record.lastReset < windowStart) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const debugRoutesEnabled =
    process.env.ENABLE_DEBUG_ROUTES === 'true' &&
    process.env.NODE_ENV !== 'production'

  if (pathname.startsWith('/api/debug/') && !debugRoutesEnabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  // 强制HTTPS重定向 (生产环境)
  if (process.env.NODE_ENV === 'production') {
    const proto = request.headers.get('x-forwarded-proto')
    if (proto === 'http') {
      return NextResponse.redirect(`https://fluxkontext.space${pathname}`, 301)
    }
  }
  
  // API v1 路由重写 - 将文档中的API端点映射到实际实现
  if (pathname.startsWith('/api/v1/')) {
    let newPath = '/api/flux-kontext'
    let action = ''
    
    // 根据URL路径确定action类型
    if (pathname.includes('/text-to-image/pro')) {
      action = 'text-to-image-pro'
    } else if (pathname.includes('/text-to-image/max')) {
      action = 'text-to-image-max'
    } else if (pathname.includes('/image-edit/pro')) {
      action = 'edit-image-pro'
    } else if (pathname.includes('/image-edit/max')) {
      action = 'edit-image-max'
    }
    
    // 创建新的URL并添加action参数
    const url = request.nextUrl.clone()
    url.pathname = newPath
    
    // 如果确定了action，添加到查询参数中
    if (action) {
      url.searchParams.set('action', action)
    }
    
    return NextResponse.rewrite(url)
  }
  
  const response = NextResponse.next()
  
  // 添加安全头
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  
  // 内容安全策略 - 修复Google OAuth和TrustedScript问题
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
    "https://platform.twitter.com " +
    "https://www.googletagmanager.com " +
    "https://accounts.google.com " +
    "https://apis.google.com " +
    "https://www.gstatic.com " +
    "https://gstatic.com " +
    "https://challenges.cloudflare.com " +
    "https://static.cloudflareinsights.com " +
    "data: blob:; " +
    "style-src 'self' 'unsafe-inline' " +
    "https://fonts.googleapis.com " +
    "https://accounts.google.com " +
    "https://www.gstatic.com; " +
    "font-src 'self' " +
    "https://fonts.gstatic.com " +
    "https://accounts.google.com " +
    "data:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https: " +
    "https://accounts.google.com " +
    "https://www.googleapis.com " +
    "https://challenges.cloudflare.com " +
    "wss: ws:; " +
    "frame-src 'self' " +
    "https://accounts.google.com " +
    "https://www.google.com " +
    "https://challenges.cloudflare.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self' https:; " +
    "frame-ancestors 'self';"
  )
  
  // API路由速率限制
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') ?? 
               '127.0.0.1'
    
    // 不同API端点不同的限制
    let limit = 10
    let windowMs = 60000 // 1分钟
    
    if (request.nextUrl.pathname.includes('/auth/')) {
      limit = 5 // 认证相关更严格
      windowMs = 300000 // 5分钟
    } else if (request.nextUrl.pathname.includes('/payment/')) {
      limit = 3 // 支付相关最严格
      windowMs = 600000 // 10分钟
    }
    
    if (!rateLimit(ip, limit, windowMs)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
  }
  
  return response
}

export const config = {
  matcher: [
    // 暂时禁用middleware，只匹配API路由进行测试
    '/api/(.*)',
  ],
}
