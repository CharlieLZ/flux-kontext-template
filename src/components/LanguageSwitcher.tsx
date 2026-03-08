"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  SUPPORTED_LOCALES, 
  LOCALE_NAMES, 
  LOCALE_FLAGS, 
  getLocaleFromPathname,
  getLocalizedPath,
  removeLocaleFromPathname,
  type SupportedLocale 
} from "@/lib/content/locale"

interface LanguageSwitcherProps {
  variant?: "dropdown" | "grid"
  className?: string
}

export function LanguageSwitcher({ variant = "dropdown", className = "" }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  // 获取当前语言
  const currentLocale = getLocaleFromPathname(pathname)
  
  // 切换语言
  const switchLanguage = (newLocale: SupportedLocale) => {
    // 移除当前路径中的语言前缀
    const pathWithoutLocale = removeLocaleFromPathname(pathname)
    
    // 生成新的本地化路径
    const newPath = getLocalizedPath(pathWithoutLocale, newLocale)
    
    // 导航到新路径
    router.push(newPath)
    setIsOpen(false)
  }

  if (variant === "grid") {
    // 网格布局 - 适用于页脚
    return (
      <div className={`grid grid-cols-2 gap-1 ${className}`}>
        {SUPPORTED_LOCALES.map((locale) => (
          <button
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={`flex items-center space-x-2 transition-all duration-200 text-sm py-1 hover:font-semibold active:scale-95 ${
              locale === currentLocale 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <span>{LOCALE_FLAGS[locale]}</span>
            <span>{LOCALE_NAMES[locale]}</span>
          </button>
        ))}
      </div>
    )
  }

  // 下拉菜单布局 - 适用于导航栏
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:font-semibold active:scale-95 transition-all duration-200"
      >
        <span>{LOCALE_FLAGS[currentLocale]}</span>
        <span>{LOCALE_NAMES[currentLocale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {/* 下拉菜单 */}
      {isOpen && (
        <div className="app-floating-panel absolute top-full right-0 z-[9999] mt-2 w-40 rounded-xl py-2">
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLanguage(locale)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:bg-accent ${
                locale === currentLocale ? 'bg-accent text-primary font-medium' : ''
              }`}
            >
              <span>{LOCALE_FLAGS[locale]}</span>
              <span>{LOCALE_NAMES[locale]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 简化版本 - 只显示当前语言，点击切换
export function SimpleLanguageSwitcher({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = getLocaleFromPathname(pathname)
  
  const switchToNextLanguage = () => {
    const currentIndex = SUPPORTED_LOCALES.indexOf(currentLocale)
    const nextIndex = (currentIndex + 1) % SUPPORTED_LOCALES.length
    const nextLocale = SUPPORTED_LOCALES[nextIndex]
    
    const pathWithoutLocale = removeLocaleFromPathname(pathname)
    const newPath = getLocalizedPath(pathWithoutLocale, nextLocale)
    
    router.push(newPath)
  }
  
  return (
    <button
      onClick={switchToNextLanguage}
      className={`flex items-center space-x-2 transition-all duration-200 hover:font-semibold active:scale-95 ${className}`}
      title={`Switch to ${LOCALE_NAMES[SUPPORTED_LOCALES[(SUPPORTED_LOCALES.indexOf(currentLocale) + 1) % SUPPORTED_LOCALES.length]]}`}
    >
      <span>{LOCALE_FLAGS[currentLocale]}</span>
      <span>{LOCALE_NAMES[currentLocale]}</span>
    </button>
  )
} 
