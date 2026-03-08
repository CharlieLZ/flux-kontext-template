"use client"

import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
}

export function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<Point[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>()

  useEffect(() => {
    const theme = getComputedStyle(document.documentElement)
    const token = (name: string, fallback: string, alpha = 0.9) => {
      const value = theme.getPropertyValue(name).trim()
      const rgbTriplet = value || fallback
      return `rgba(${rgbTriplet.replace(/\s+/g, ", ")}, ${alpha})`
    }
    const colors = [
      token('--primary', '10 132 255', 0.92),
      token('--accent', '94 211 255', 0.88),
      token('--success', '52 199 89', 0.84),
      token('--warning', '255 159 10', 0.82),
      token('--destructive', '255 69 58', 0.8),
    ]
    const trailFill = token('--background', '9 13 18', 0.05)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 鼠标移动事件
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      
      // 添加更多粒子，随机颜色和大小
      for (let i = 0; i < 5; i++) {
        pointsRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 30,
          y: e.clientY + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
    }

    // 鼠标点击事件 - 爆炸效果
    const handleMouseClick = (e: MouseEvent) => {
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15
        pointsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * (Math.random() * 6 + 2),
          vy: Math.sin(angle) * (Math.random() * 6 + 2),
          life: 1,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
    }

    // 动画循环
    const animate = () => {
      // 半透明清除，创建拖尾效果
      ctx.fillStyle = trailFill
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 更新和绘制粒子
      pointsRef.current = pointsRef.current.filter(point => {
        point.x += point.vx
        point.y += point.vy
        point.life -= 0.015
        point.vx *= 0.99 // 阻力
        point.vy *= 0.99
        
        if (point.life > 0) {
          ctx.save()
          ctx.globalAlpha = point.life * 0.8
          
          // 创建径向渐变
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, point.size * 2
          )
          gradient.addColorStop(0, point.color)
          gradient.addColorStop(1, 'transparent')
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          return true
        }
        return false
      })
      
      // 限制粒子数量，避免性能问题
      if (pointsRef.current.length > 200) {
        pointsRef.current = pointsRef.current.slice(-150)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleMouseClick)
    animate()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleMouseClick)
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  )
} 
