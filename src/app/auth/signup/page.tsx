import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignUpContent } from '@/components/SignUpContent'

export const metadata: Metadata = {
  title: 'Sign Up - Create Your AI Image Generation Account | Flux Kontext',
  description: 'Create your free Flux Kontext account to access professional AI image generation tools. Start creating stunning images with advanced AI technology today.',
  keywords: [
    'sign up',
    'create account',
    'flux kontext registration',
    'ai image generator account',
    'flux kontext sign up',
    'free ai image generation',
    'ai image creation account'
  ],
  alternates: {
    canonical: '/auth/signup',
  },
  openGraph: {
    title: 'Sign Up for Flux Kontext',
    description: 'Create your free AI image generation account',
    url: '/auth/signup',
  },
  robots: {
    index: false,
    follow: true,
  },
}

// 加载组件
function SignUpLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading sign up page...</p>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpLoading />}>
      <SignUpContent />
    </Suspense>
  )
} 
