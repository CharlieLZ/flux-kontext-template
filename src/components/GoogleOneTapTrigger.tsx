"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function GoogleOneTapTrigger() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isTriggering, setIsTriggering] = useState(false)

  // 🔧 只在未登录且不在认证页面时显示
  const shouldShow = 
    !session && 
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    !pathname?.startsWith('/auth/') &&
    pathname !== '/dashboard'

  if (!shouldShow) {
    return null
  }

  const handleManualTrigger = async () => {
    setIsTriggering(true)
    
    try {
      // 🎯 直接使用标准Google登录，不再尝试One Tap
      console.log("Direct Google OAuth login triggered")
      await signIn("google", { callbackUrl: "/generate" })
    } catch (error) {
      console.error("Google OAuth login failed:", error)
      // 出错时重试
      await signIn("google", { callbackUrl: "/generate" })
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        onClick={handleManualTrigger}
        disabled={isTriggering}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-card/95 text-foreground shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-primary/30 hover:shadow-xl active:scale-95 disabled:opacity-50"
        title="Quick Google Sign In"
        aria-label="Quick Google Sign In"
      >
        {isTriggering ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
      </button>
    </div>
  )
} 
