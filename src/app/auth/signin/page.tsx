import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignInContent } from '@/components/SignInContent'

export const metadata: Metadata = {
  title: 'Sign In - Access Your AI Image Generation Account | Flux Kontext',
  description: 'Sign in to your Flux Kontext account to access AI-powered image generation tools. Create professional images with advanced AI technology instantly.',
  keywords: [
    'sign in',
    'login',
    'flux kontext account',
    'ai image generator login',
    'flux kontext sign in',
    'image creation account',
    'ai image generation login'
  ],
  alternates: {
    canonical: '/auth/signin',
  },
  openGraph: {
    title: 'Sign In to Flux Kontext',
    description: 'Access your AI image generation account',
    url: '/auth/signin',
  },
  robots: {
    index: false, // 登录页面不需要被搜索引擎索引
    follow: true,
  }
}

// 加载组件
function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading sign in page...</p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  )
} 
