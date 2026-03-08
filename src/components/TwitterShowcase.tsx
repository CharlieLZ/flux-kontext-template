"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
// 导入文案系统
import { twitterShowcase } from "@/lib/content"

interface TwitterEmbed {
  id: string
  url: string
  embedHtml: string
}

const twitterEmbeds: TwitterEmbed[] = [
  {
    id: "1", 
    url: "https://x.com/replicate/status/1928140479809605978",
    embedHtml: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Breakthrough in AI image technology! <a href="https://t.co/example1">pic.twitter.com/example1</a></p>&mdash; Replicate (@replicate) <a href="https://twitter.com/replicate/status/1928140479809605978?ref_src=twsrc%5Etfw">November 26, 2024</a></blockquote>`
  },
  {
    id: "2",
    url: "https://x.com/FAL/status/1928140080494866738",
    embedHtml: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Next-generation image AI in action! <a href="https://t.co/example2">pic.twitter.com/example2</a></p>&mdash; FAL (@FAL) <a href="https://twitter.com/FAL/status/1928140080494866738?ref_src=twsrc%5Etfw">November 26, 2024</a></blockquote>`
  },
  {
    id: "3",
    url: "https://x.com/FAL/status/1928140082742993156",
    embedHtml: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Impressive AI image generation showcase! <a href="https://t.co/example3">pic.twitter.com/example3</a></p>&mdash; FAL (@FAL) <a href="https://twitter.com/FAL/status/1928140082742993156?ref_src=twsrc%5Etfw">November 26, 2024</a></blockquote>`
  },
  {
    id: "4",
    url: "https://x.com/bfl_ml/status/1928143010811748863",
    embedHtml: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Exciting AI image generation results! <a href="https://t.co/example4">pic.twitter.com/example4</a></p>&mdash; BFL (@bfl_ml) <a href="https://twitter.com/bfl_ml/status/1928143010811748863?ref_src=twsrc%5Etfw">November 26, 2024</a></blockquote>`
  },
  {
    id: "5",
    url: "https://x.com/RunwareAI/status/1928143259718799858",
    embedHtml: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Amazing AI image capabilities showcased! <a href="https://t.co/example5">pic.twitter.com/example5</a></p>&mdash; Runware AI (@RunwareAI) <a href="https://twitter.com/RunwareAI/status/1928143259718799858?ref_src=twsrc%5Etfw">November 26, 2024</a></blockquote>`
  },
  {
    id: "6", 
    url: "https://x.com/FAL/status/1928140078607651095",
    embedHtml: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Incredible image generation technology in action! <a href="https://t.co/example6">pic.twitter.com/example6</a></p>&mdash; FAL (@FAL) <a href="https://twitter.com/FAL/status/1928140078607651095?ref_src=twsrc%5Etfw">November 26, 2024</a></blockquote>`
  },
  {
    id: "7",
    url: "https://x.com/replicate/status/1928140447664456129",
    embedHtml: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Revolutionary AI image generation results! <a href="https://t.co/example7">pic.twitter.com/example7</a></p>&mdash; Replicate (@replicate) <a href="https://twitter.com/replicate/status/1928140447664456129?ref_src=twsrc%5Etfw">November 26, 2024</a></blockquote>`
  }
]

export function TwitterShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null)

  // 滚动函数
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400 // 滚动距离
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'auto' // 改为auto，减少动画卡顿
      })
    }
  }

  useEffect(() => {
    // 检查是否已经加载了推特脚本
    if (document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
      // 如果已经存在，直接渲染
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load()
      }
      return
    }

    // 添加推特脚本
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.charset = 'utf-8'
    
    script.onload = () => {
      console.log('Twitter widgets script loaded')
      // 脚本加载完成后渲染推特内容
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load()
      }
    }
    
    document.head.appendChild(script)
  }, [])

  return (
    <section className="px-4 py-8 bg-background">
      <div className="container mx-auto">
        {/* 标题区域 - 简化布局，更好居中 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text">
              {twitterShowcase.title}
            </h2>
            {/* 滚动按钮 - 移到右侧 */}
            <div className="flex space-x-2 ml-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('left')}
                className="app-floating-panel h-10 w-10 p-0 text-foreground hover:border-primary/40 hover:bg-primary/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('right')}
                className="app-floating-panel h-10 w-10 p-0 text-foreground hover:border-primary/40 hover:bg-primary/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </div>
          
          <p className="text-lg text-foreground/90 max-w-4xl mx-auto leading-relaxed mb-4">
            {twitterShowcase.description}
          </p>
          
          {/* 滑动提示 - 简化样式 */}
          <div className="flex items-center justify-center space-x-2 text-primary/70 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{twitterShowcase.scrollHint}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* 横向滑动容器 - 优化高度和间距 */}
        <div 
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-4 pb-4">
            {twitterEmbeds.map((embed) => (
              <div 
                key={embed.id} 
                className="app-surface-card flex-none w-80 rounded-2xl p-4"
                style={{ minHeight: '500px' }} // 固定最小高度，避免空白
              >
                <div 
                  className="twitter-content w-full h-full"
                  dangerouslySetInnerHTML={{ __html: embed.embedHtml }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// 扩展Window接口以支持推特API
declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void
      }
    }
  }
} 
