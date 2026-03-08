"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StandardTurnstile, verifyStandardTurnstileToken } from "@/components/StandardTurnstile"
import { UpgradePrompt, FeatureLocked } from "@/components/UpgradePrompt"
import { CreditDisplay } from "@/components/CreditDisplay"
import { SmartImagePreview } from "@/components/SmartImagePreview"
import { 
  Upload, 
  Wand2, 
  Image as ImageIcon, 
  Loader2,
  Download,
  Settings,
  Zap,
  Layers,
  Edit,
  Plus,
  X,
  AlertCircle,
  Shield,
  RefreshCw,
  Lock,
  Crown,
  Copy,
  Sparkles,
  Info,
  Eye,
  EyeOff
} from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  buildContextModels,
  getActionForModel,
  getEstimatedGenerationTime,
  getRecommendedModelValue,
} from "@/components/flux-kontext/model-config"
import type {
  FluxKontextAction,
  GeneratedImage,
  GenerationRequest,
  GeneratorModelValue,
} from "@/components/flux-kontext/types"
// İģ
import { generator, common } from "@/lib/content"

// ûֲϵ
import { 
  UserType, 
  getCurrentUserType, 
  getUserLimits, 
  getImageCountOptions, 
  getAvailableModels, 
  getAvailableAspectRatios,
  hasFeature,
  needsUpgrade
} from "@/lib/user-tiers"

export function FluxKontextGenerator() {
  const router = useRouter()
  const { data: session } = useSession()
  
  // ûֲ̬
  const [userType, setUserType] = useState<UserType>(UserType.ANONYMOUS)
  const [userLimits, setUserLimits] = useState(getUserLimits(UserType.ANONYMOUS))
  
  // 文本生成图像状态
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState("")
  
  // Turnstile验证状态
  const [turnstileToken, setTurnstileToken] = useState<string>("")
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false)
  const [turnstileError, setTurnstileError] = useState("")
  const [isTurnstileEnabled, setIsTurnstileEnabled] = useState(false)
  
  // ?? 文本生成图像状态

  // 文本生成图像状态
  const [textPrompt, setTextPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState<GeneratorModelValue>('pro')
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [guidanceScale, setGuidanceScale] = useState(3.5)
  const [numImages, setNumImages] = useState(1)
  const [safetyTolerance, setSafetyTolerance] = useState("2")
  const [outputFormat, setOutputFormat] = useState("jpeg")
  const [seed, setSeed] = useState<number | undefined>(undefined)
  
  // 文本编辑状态
  const [editPrompt, setEditPrompt] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]) // ?? 文本生成图像汾ļ
  
  // 文本生成图像状态
  const [isPrivateMode, setIsPrivateMode] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastRequest, setLastRequest] = useState<GenerationRequest | null>(null)
  
  // 复制成功状态
  const [copySuccess, setCopySuccess] = useState("")
  
  // 生成图像的倒计时
  const [countdown, setCountdown] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(6) // 预估6秒
  
  // 多文件输入引用
  const multiFileInputRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)

  // ?? 自动检测用户类型
  const detectUserType = useCallback((): UserType => {
    // 根据session判断用户是否登录
    if (session?.user?.email) {
      // ?? 打印用户登录信息
      if (process.env.NODE_ENV === 'development') {
        console.log('?? User logged in:', session.user.email)
      }
      // 判断是否为付费用户
      if ((session.user as any)?.isPremium || (session.user as any)?.subscription?.status === 'active') {
        if (process.env.NODE_ENV === 'development') {
          console.log('?? Detected as PREMIUM user')
        }
        return UserType.PREMIUM
      }
      // 未登录用户
      if (process.env.NODE_ENV === 'development') {
        console.log('?? Detected as REGISTERED user')
      }
      return UserType.REGISTERED
    }
    
    // 未登录用户
    if (process.env.NODE_ENV === 'development') {
      console.log('?? Detected as ANONYMOUS user')
    }
    return UserType.ANONYMOUS
  }, [session])

  // 初始化用户类型 - ?? 自动检测用户类型
  useEffect(() => {
    const currentUserType = detectUserType()
    setUserType(currentUserType)
    setUserLimits(getUserLimits(currentUserType))
    
    // ?? 打印用户状态检测信息
    if (process.env.NODE_ENV === 'development') {
      console.log('?? User status detection:', {
        session: !!session,
        email: session?.user?.email,
        userType: currentUserType,
        maxImages: getUserLimits(currentUserType).maxImages,
        requiresTurnstile: getUserLimits(currentUserType).requiresTurnstile
      })
    }
    
    // 判断Turnstile是否启用
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === "true"
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    setIsTurnstileEnabled(isEnabled && !!siteKey)
    
    // ?? 打印Turnstile配置信息
    if (process.env.NODE_ENV === 'development') {
      console.log('?? Turnstile config:', {
        isEnabled,
        hasSiteKey: !!siteKey,
        isTurnstileEnabled: isEnabled && !!siteKey
      })
    }
    
    // 用户选择的模型
    const availableModels = getAvailableModels(currentUserType)
    if (availableModels.includes('pro')) {
      setSelectedModel('pro') // ?? 默认使用PRO模型
    } else {
      setSelectedModel('max')
    }
  }, [session, detectUserType]) // ?? 依赖session

  // 动态获取选择
  const imageCountOptions = getImageCountOptions(userType)
  const availableModels = getAvailableModels(userType)
  const aspectRatioOptions = getAvailableAspectRatios(userType)

  // ?? 自动检测用户状态 - 仅在用户类型变化时触发一次
  useEffect(() => {
    // ?? 打印用户状态初始化信息
    if (process.env.NODE_ENV === 'development') {
      console.log('?? User status initialized:', {
        userType,
        maxImages: userLimits.maxImages,
        availableModels: availableModels.length,
        session: !!session
      })
    }
  }, [availableModels.length, session, userLimits.maxImages, userType]) // ?? 仅依赖用户态摘要

  // ?? 删除重复请求的useEffect
  // useEffect(() => {
  //   console.log('?? Current user status details:', {...})
  // }, [...]) // 删除

  // ?? 图像编辑状态 - 仅在图像变化时触发一次
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('?? Image state changed:', {
        uploadedImagesCount: uploadedImages.length,
        uploadedFilesCount: uploadedFiles.length
      })
    }
  }, [uploadedImages.length, uploadedFiles.length]) // ?? 仅依赖图像变化

  // ?? 用户状态 - useEffect仅在用户类型变化时触发一次
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('?? Current user status details:', {
        userType,
        maxImages: userLimits.maxImages,
        imageCountOptions: imageCountOptions.length,
        aspectRatioOptions: aspectRatioOptions.length,
        availableModels: availableModels.length,
        session: !!session,
        userEmail: session?.user?.email,
        uploadedImagesCount: uploadedImages.length,
        uploadedFilesCount: uploadedFiles.length
      })
    }
  }, [userType, userLimits.maxImages, imageCountOptions.length, aspectRatioOptions.length, availableModels.length, session, uploadedImages.length, uploadedFiles.length]) // ?? 仅依赖用户类型和图像变化

  // 全量选择 - 使用generator模型
  const safetyOptions = [
    { value: "1", label: generator.safetyLevels["1"] },
    { value: "2", label: generator.safetyLevels["2"] },
    { value: "3", label: generator.safetyLevels["3"] },
    { value: "4", label: generator.safetyLevels["4"] },
    { value: "5", label: generator.safetyLevels["5"] }
  ]

  // 用户是否可以使用图像数量
  const canUseImageCount = useCallback((count: number): boolean => {
    const canUse = count <= userLimits.maxImages
    // ?? 打印检查图像数量权限信息
    // console.log(`?? Check image count permission: ${count} images <= ${userLimits.maxImages} images = ${canUse}`)
    return canUse
  }, [userLimits.maxImages])

  // 获取升级信息
  const getUpgradeMessage = (count: number): string => {
    if (count <= userLimits.maxImages) return ""
    
    if (userType === UserType.ANONYMOUS) {
      return "Sign up to generate up to 4 images"
    } else if (userType === UserType.REGISTERED) {
      return "Upgrade to Premium to generate up to 12 images"
    }
    return ""
  }

  // ?? 处理本地文件预览
  const handleLocalFilePreview = useCallback((file: File): string => {
    // 生成预览URL
    const previewUrl = URL.createObjectURL(file)
    console.log(`?? Created local preview URL for: ${file.name}`)
    return previewUrl
  }, [])

  // ?? 处理文件上传
  const handleFileUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/flux-kontext', {
      method: 'PUT',
      body: formData
    })

    if (!response.ok) {
      let errorData: any = {}
      
      try {
        // 全量JSON
        const responseText = await response.text()
        if (responseText.trim()) {
          errorData = JSON.parse(responseText)
        }
      } catch (parseError) {
        console.warn('?? Failed to parse upload error response as JSON:', parseError)
        errorData = { 
          message: `Upload failed (${response.status}): ${response.statusText}`,
          error: 'JSON parse failed'
        }
      }
      
      throw new Error(errorData.message || 'File upload failed')
    }

    let data: any = {}
    try {
      // 全量JSON
      const responseText = await response.text()
      if (responseText.trim()) {
        data = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('? Failed to parse upload success response as JSON:', parseError)
      throw new Error('Invalid response format from upload server')
    }
    
    return data.url
  }, [])

  // ?? 处理多图像上传
  const handleMultiImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    // ?? 处理input的value，确保选择的是相同的文件
    if (event.target) {
      event.target.value = ''
    }
    
    if (files.length === 0) return

    try {
      // ?? 等待预览
      const previewUrls = files.map(file => handleLocalFilePreview(file))
      
      // 设置图像状态，显示预览
      setUploadedFiles(prev => [...prev, ...files])
      setUploadedImages(prev => [...prev, ...previewUrls])
      setError("")
      
      console.log(`?? Added ${files.length} files for local preview`)
      
      // ?? 开始立即上传到R2存储
      console.log(`?? Starting immediate upload to R2 storage...`)
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          console.log(`?? Uploading file ${i + 1}/${files.length}: ${file.name}`)
          const r2Url = await handleFileUpload(file)
          console.log(`? R2 Upload successful for ${file.name}:`)
          console.log(`?? R2 URL: ${r2Url}`)
          
          // 检查R2 URL是否可访问
          try {
            const testResponse = await fetch(r2Url, { method: 'HEAD', mode: 'cors' })
            console.log(`?? R2 URL test result:`, {
              url: r2Url,
              status: testResponse.status,
              ok: testResponse.ok
            })
            
            if (testResponse.ok) {
              console.log(`? R2 URL is publicly accessible: ${r2Url}`)
              
              // 替换预览URL为R2 URL
              setUploadedImages(prev => {
                const newImages = [...prev]
                const targetIndex = prev.length - files.length + i
                if (targetIndex >= 0 && targetIndex < newImages.length) {
                  if (newImages[targetIndex].startsWith('blob:')) {
                    URL.revokeObjectURL(newImages[targetIndex])
                  }
                  newImages[targetIndex] = r2Url
                  console.log(`?? Replaced blob URL with R2 URL at index ${targetIndex}`)
                }
                return newImages
              })
            } else {
              console.warn(`?? R2 URL not accessible (${testResponse.status}): ${r2Url}`)
            }
          } catch (testError) {
            console.warn(`?? R2 URL accessibility test failed:`, testError)
            console.log(`?? R2 URL (untested): ${r2Url}`)
          }
          
        } catch (uploadError: any) {
          console.error(`? R2 upload failed for ${file.name}:`, uploadError.message)
        }
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [handleLocalFilePreview, handleFileUpload])

  // ?? 处理拖放
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )

    if (files.length === 0) return

    try {
      // ?? 等待预览
      const previewUrls = files.map(file => handleLocalFilePreview(file))
      
      console.log(`?? About to update state with ${files.length} files:`, {
        fileNames: files.map(f => f.name),
        previewUrls: previewUrls.map(url => url.substring(0, 50) + '...')
      })
      
      // 设置图像状态，显示预览
      setUploadedFiles(prev => {
        const newFiles = [...prev, ...files]
        console.log(`?? Updated uploadedFiles: ${prev.length} -> ${newFiles.length}`)
        return newFiles
      })
      setUploadedImages(prev => {
        const newImages = [...prev, ...previewUrls]
        console.log(`?? Updated uploadedImages: ${prev.length} -> ${newImages.length}`)
        return newImages
      })
      setError("")
      
      console.log(`?? Dropped ${files.length} files for local preview`)
      
      // ?? 开始立即上传到R2存储
      console.log(`?? Starting immediate upload to R2 storage...`)
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          console.log(`?? Uploading file ${i + 1}/${files.length}: ${file.name}`)
          const r2Url = await handleFileUpload(file)
          console.log(`? R2 Upload successful for ${file.name}:`)
          console.log(`?? R2 URL: ${r2Url}`)
          console.log(`?? Testing R2 URL accessibility...`)
          
          // 检查R2 URL是否可访问
          try {
            const testResponse = await fetch(r2Url, { 
              method: 'HEAD',
              mode: 'cors'
            })
            console.log(`?? R2 URL test result:`, {
              url: r2Url,
              status: testResponse.status,
              statusText: testResponse.statusText,
              ok: testResponse.ok,
              headers: {
                'content-type': testResponse.headers.get('content-type'),
                'content-length': testResponse.headers.get('content-length'),
                'access-control-allow-origin': testResponse.headers.get('access-control-allow-origin')
              }
            })
            
            if (testResponse.ok) {
              console.log(`? R2 URL is publicly accessible: ${r2Url}`)
              
              // ?? 替换预览URL为R2 URL
              setUploadedImages(prev => {
                const newImages = [...prev]
                const targetIndex = prev.length - files.length + i // 确定索引
                if (targetIndex >= 0 && targetIndex < newImages.length) {
                  // 获取blob URL
                  if (newImages[targetIndex].startsWith('blob:')) {
                    URL.revokeObjectURL(newImages[targetIndex])
                  }
                  newImages[targetIndex] = r2Url
                  console.log(`?? Replaced blob URL with R2 URL at index ${targetIndex}`)
                }
                return newImages
              })
            } else {
              console.warn(`?? R2 URL not accessible (${testResponse.status}): ${r2Url}`)
            }
          } catch (testError) {
            console.warn(`?? R2 URL accessibility test failed:`, testError)
            console.log(`?? R2 URL (untested): ${r2Url}`)
          }
          
        } catch (uploadError: any) {
          console.error(`? R2 upload failed for ${file.name}:`, uploadError.message)
          // 使用默认预览URL
        }
      }
      
    } catch (error: any) {
      setError(error.message)
    }
  }, [handleLocalFilePreview, handleFileUpload])

  // ?? 处理粘贴
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter(item => item.type.startsWith('image/'))

    if (imageItems.length === 0) return

    e.preventDefault()

    try {
      const files: File[] = []
      const previewUrls: string[] = []
      
      // ?? 等待预览
      imageItems.forEach((item) => {
        const file = item.getAsFile()
        if (file) {
          files.push(file)
          previewUrls.push(handleLocalFilePreview(file))
        }
      })
      
      // 设置图像状态，显示预览
      setUploadedFiles(prev => [...prev, ...files])
      setUploadedImages(prev => [...prev, ...previewUrls])
      setError("")
      
      console.log(`?? Pasted ${files.length} files for local preview`)
      
      // ?? 开始立即上传到R2存储
      console.log(`?? Starting immediate upload to R2 storage...`)
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          console.log(`?? Uploading file ${i + 1}/${files.length}: ${file.name}`)
          const r2Url = await handleFileUpload(file)
          console.log(`? R2 Upload successful for ${file.name}:`)
          console.log(`?? R2 URL: ${r2Url}`)
          
          // 检查R2 URL是否可访问
          try {
            const testResponse = await fetch(r2Url, { method: 'HEAD', mode: 'cors' })
            console.log(`?? R2 URL test result:`, {
              url: r2Url,
              status: testResponse.status,
              ok: testResponse.ok
            })
            
            if (testResponse.ok) {
              console.log(`? R2 URL is publicly accessible: ${r2Url}`)
              
              // 替换预览URL为R2 URL
              setUploadedImages(prev => {
                const newImages = [...prev]
                const targetIndex = prev.length - files.length + i
                if (targetIndex >= 0 && targetIndex < newImages.length) {
                  if (newImages[targetIndex].startsWith('blob:')) {
                    URL.revokeObjectURL(newImages[targetIndex])
                  }
                  newImages[targetIndex] = r2Url
                  console.log(`?? Replaced blob URL with R2 URL at index ${targetIndex}`)
                }
                return newImages
              })
            } else {
              console.warn(`?? R2 URL not accessible (${testResponse.status}): ${r2Url}`)
            }
          } catch (testError) {
            console.warn(`?? R2 URL accessibility test failed:`, testError)
            console.log(`?? R2 URL (untested): ${r2Url}`)
          }
          
        } catch (uploadError: any) {
          console.error(`? R2 upload failed for ${file.name}:`, uploadError.message)
        }
      }
    } catch (error: any) {
      setError(error.message)
    }
  }, [handleLocalFilePreview, handleFileUpload])

  // Turnstile验证
  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
    setIsTurnstileVerified(true)
    setTurnstileError("")
    console.log("Turnstile verification successful, token:", token)
  }, [])

  const handleTurnstileError = useCallback((error: string) => {
    setTurnstileToken("")
    setIsTurnstileVerified(false)
    setTurnstileError(error)
    console.error("Turnstile verification failed:", error)
    
    // ?? Զˢ߼
    if (error.includes('600010') || error.includes('timeout') || error.includes('network')) {
      console.log('?? Detected network/timeout error, auto-refreshing in 3 seconds...')
      setTurnstileError("Network error detected, auto-refreshing...")
      
      setTimeout(() => {
        console.log('?? Auto-refreshing Turnstile widget...')
        setTurnstileError("")
        setIsTurnstileVerified(false)
        setTurnstileToken("")
        
        // Turnstile widget
        if (turnstileRef.current && (turnstileRef.current as any).reset) {
          (turnstileRef.current as any).reset()
        }
      }, 3000)
    }
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken("")
    setIsTurnstileVerified(false)
    setTurnstileError("Verification expired, auto-refreshing...")
    console.log("Turnstile verification expired, will auto-refresh")
    
    // 2ϢԶˢЧ
    setTimeout(() => {
      setTurnstileError("")
    }, 2000)
  }, [])




  // 是否需要Turnstile验证 - 🔧 修复智能验证逻辑
  const checkTurnstileRequired = useCallback(() => {
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === "true"
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    
    // ֻ5%
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
      console.log('?? Turnstile check:', {
        isEnabled,
        hasSiteKey: !!siteKey,
        userType,
        requiresTurnstile: userLimits.requiresTurnstile,
        isTurnstileEnabled,
        isTurnstileVerified,
        hasToken: !!turnstileToken
      })
    }
    
    // Turnstileδûȱãֱӷfalse
    if (!isEnabled || !siteKey) {
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
        console.log('?? Turnstile disabled: missing config')
      }
      return false
    }
    
    // ûȷ֤
    if (userLimits.requiresTurnstile === false) {
      // ûȷ֤
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
        console.log('?? Turnstile disabled: premium user')
      }
      return false
    }
    
    if (userLimits.requiresTurnstile === 'smart') {
      // עû֤֤ͲҪ֤
      if (isTurnstileVerified && turnstileToken) {
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
          console.log('?? Turnstile smart mode: already verified, no need to verify again')
        }
        return false
      } else {
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
          console.log('?? Turnstile smart mode: verification required')
        }
        return true
      }
    }
    
    // ûҪ֤
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
      console.log('?? Turnstile required: anonymous user')
    }
    return userLimits.requiresTurnstile === true
  }, [userLimits.requiresTurnstile, userType, isTurnstileEnabled, isTurnstileVerified, turnstileToken])

  // 验证Turnstile token（如果启用）- 🔧 修复智能验证逻辑
  const validateTurnstile = useCallback(async (): Promise<boolean> => {
    const needsVerification = checkTurnstileRequired()
    
    if (!needsVerification) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Turnstile verification not required for this user type or already verified')
      }
      return true // 不需要验证，直接通过
    }

    // 🔧 修改：智能验证模式下，如果已经验证过就不需要再验证
    if (userLimits.requiresTurnstile === 'smart' && isTurnstileVerified && turnstileToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Turnstile smart mode: using existing verification')
      }
      return true
    }

    // 如果需要验证但没有token或未验证，需要完成验证
    if (!isTurnstileVerified || !turnstileToken) {
      console.log('❌ Turnstile verification required but not completed')
      setError("Please complete human verification to continue")
      return false
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Turnstile verification passed')
    }
    return true
  }, [checkTurnstileRequired, isTurnstileVerified, turnstileToken, userLimits.requiresTurnstile])

  // ͼƬ֧4ŵ
  const batchGenerate = useCallback(async (request: GenerationRequest) => {
    const maxPerBatch = 4 // FAL API֧4
    const totalImages = request.num_images || 1
    const batches = Math.ceil(totalImages / maxPerBatch)
    
    let allImages: any[] = []
    
    for (let i = 0; i < batches; i++) {
      const batchSize = Math.min(maxPerBatch, totalImages - i * maxPerBatch)
      const batchRequest = { ...request, num_images: batchSize }
      
      try {
        const response = await fetch('/api/flux-kontext', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(batchRequest)
        })

        if (!response.ok) {
          let errorData: any = {}
          
          try {
            // ȫJSON
            const responseText = await response.text()
            if (responseText.trim()) {
              errorData = JSON.parse(responseText)
            }
          } catch (parseError) {
            console.warn('?? Failed to parse error response as JSON:', parseError)
            errorData = { 
              message: `Server error (${response.status}): ${response.statusText}`,
              error: 'JSON parse failed'
            }
          }
          
          // ͳһTurnstile֤ʧܴ
          if (errorData.code === 'TURNSTILE_VERIFICATION_FAILED' || 
              errorData.code === 'TURNSTILE_RETRY_REQUIRED' ||
              errorData.error?.includes('Human verification')) {
            console.log('?? Detected Turnstile verification failed, auto reset verification state')
            setIsTurnstileVerified(false)
            setTurnstileToken("")
            setTurnstileError("Verification failed, please verify again")
            
            // Turnstile widget
            if (turnstileRef.current && (turnstileRef.current as any).reset) {
              (turnstileRef.current as any).reset()
            }
            
            setError("Human verification failed, please complete verification again and try")
            return
          }
          
          throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`)
        }

        let data: any = {}
        try {
          // ȫJSON
          const responseText = await response.text()
          console.log('?? Success response text length:', responseText.length)
          
          // ǿӦ
          if (!responseText || responseText.trim().length === 0) {
            console.error('? Empty response from server')
            throw new Error('Server returned empty response - please try again')
          }
          
          if (responseText.trim().length <= 2) {
            console.error('? Minimal response from server:', responseText)
            throw new Error('Server returned minimal response - this may be a temporary issue, please try again')
          }
          
          if (responseText.trim()) {
            data = JSON.parse(responseText)
            console.log('? Successfully parsed response data:', {
              success: data.success,
              hasData: !!data.data,
              hasImages: !!data.data?.images || !!data.images,
              imageCount: data.data?.images?.length || data.images?.length || 0,
              dataKeys: Object.keys(data),
              responseLength: responseText.length,
              // ϸݽṹ
              dataStructure: {
                topLevelKeys: Object.keys(data),
                dataKeys: data.data ? Object.keys(data.data) : null,
                hasError: !!data.error,
                errorMessage: data.error || data.message,
                creditsRemaining: data.credits_remaining,
                // ͼƬֶ
                possibleImageFields: {
                  'data.images': !!data.data?.images,
                  'images': !!data.images,
                  'data.result': !!data.data?.result,
                  'result': !!data.result,
                  'data.output': !!data.data?.output,
                  'output': !!data.output
                }
              },
              // ʾϢ
              fullError: data.error ? {
                error: data.error,
                message: data.message,
                details: data.details
              } : null,
              // ʾӦǰ500ַ
              responsePreview: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
              // ʾdataṹ
              fullDataObject: JSON.stringify(data, null, 2).substring(0, 1000) + (JSON.stringify(data).length > 1000 ? '...' : '')
            })
            
            // Chromeչͻ
            if (data.error && data.error.includes('chrome-extension')) {
              console.warn('?? Chrome extension conflict detected')
              throw new Error('Browser extension conflict detected. Please disable ad blockers or privacy extensions and try again.')
            }
            
            // Ӧ
            if (data.success === true && (!data.data || Object.keys(data.data || {}).length === 0)) {
              console.error('? Server returned success but no data')
              throw new Error('Server processing completed but no images were generated. This may be due to content policy restrictions or temporary service issues.')
            }
          }
        } catch (parseError) {
          console.error('? Failed to parse success response as JSON:', parseError)
          throw new Error('Invalid response format from server - please try again')
        }
        
        if (data.success && (data.data?.images || data.images)) {
          const images = data.data?.images || data.images
          allImages.push(...images)
        }
      } catch (error) {
        console.error(`Batch ${i + 1} failed:`, error)
        if (i === 0) throw error // һʧ׳
      }
    }
    
    return { images: allImages }
  }, [])

  // ͼĺĺ
  const generateImage = useCallback(async (request: GenerationRequest) => {
    let countdownInterval: NodeJS.Timeout | null = null // 倒计时定时器
    const startTime = Date.now() // 🔧 将startTime移到函数顶部
    
    try {
      setIsGenerating(true)
      setError("")
      setLastRequest(request) // 保存请求

      // 🔧 添加详细的请求开始日志
      console.log('🚀 ===== 图像生成开始 =====')
      console.log('🔧 Starting image generation:', {
        action: request.action,
        prompt: request.prompt?.substring(0, 100) + '...',
        hasImages: !!(request.image_url || request.image_urls),
        numImages: request.num_images || 1,
        userType,
        timestamp: new Date().toISOString(),
        fullRequest: {
          action: request.action,
          prompt: request.prompt,
          image_url: request.image_url,
          image_urls: request.image_urls,
          aspect_ratio: request.aspect_ratio,
          guidance_scale: request.guidance_scale,
          num_images: request.num_images,
          safety_tolerance: request.safety_tolerance,
          output_format: request.output_format,
          seed: request.seed,
          turnstile_token: request.turnstile_token ? '已设置' : '未设置'
        }
      })

      const currentEstimatedTime = getEstimatedGenerationTime(request.action)
      setCountdown(currentEstimatedTime)
      
      console.log(`⏱️ 预估生成时间: ${currentEstimatedTime}秒`)
      
      countdownInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = Math.max(0, currentEstimatedTime - elapsed)
        setCountdown(remaining)
        
        if (remaining <= 0 && countdownInterval) {
          clearInterval(countdownInterval)
          countdownInterval = null
        }
      }, 1000)

      // 用户权限检查
      if (needsUpgrade(userType, request.num_images || 1)) {
        console.log('❌ 用户权限不足:', {
          userType,
          requestedImages: request.num_images || 1,
          maxAllowed: userLimits.maxImages
        })
        if (countdownInterval) {
          clearInterval(countdownInterval) // 清除倒计时
          countdownInterval = null
        }
        setCountdown(0)
        setError(`Upgrade required: Current plan allows up to ${userLimits.maxImages} images. Click the upgrade button to get more.`)
        return
      }

      // 🔧 使用增强的Turnstile验证
      console.log('🔐 开始Turnstile验证检查...')
      const isVerified = await validateTurnstile()
      if (!isVerified) {
        console.log('❌ Turnstile验证失败')
        if (countdownInterval) {
          clearInterval(countdownInterval)
          countdownInterval = null
        }
        setCountdown(0)
        return
      }
      console.log('✅ Turnstile验证通过')

      // 如果验证通过，尝试获取token
      let turnstileTokenToUse: string | null = null
      if (checkTurnstileRequired()) {
        if (isTurnstileVerified && turnstileToken) {
          turnstileTokenToUse = turnstileToken
          console.log('🔧 Using Turnstile verification token:', turnstileToken.substring(0, 20) + '...')
        }
        
        if (turnstileTokenToUse) {
          request.turnstile_token = turnstileTokenToUse
        }
      }

      console.log('📡 准备发送API请求到 /api/flux-kontext...')
      console.log('📋 最终请求数据:', JSON.stringify(request, null, 2))

      let result
      
      // 如果需要生成超过4张图片且用户有权限，使用批量生成
      if ((request.num_images || 1) > 4 && hasFeature(userType, 'batchGeneration')) {
        console.log('🔄 使用批量生成模式 (>4张图片)')
        result = await batchGenerate(request)
      } else {
        console.log('📡 发送单次API请求...')
        const response = await fetch('/api/flux-kontext', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        })

        console.log('📨 API响应接收完成:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
          type: response.type,
          redirected: response.redirected
        })

        if (!response.ok) {
          console.log('❌ API响应状态不正常，开始解析错误信息...')
          let errorData: any = {}
          
          try {
            // 完全读取JSON响应
            const responseText = await response.text()
            console.log('📄 错误响应原始文本:', {
              length: responseText.length,
              preview: responseText.substring(0, 1000),
              full: responseText
            })
            
            if (responseText.trim()) {
              errorData = JSON.parse(responseText)
              console.log('📋 解析后的错误数据:', errorData)
            }
          } catch (parseError) {
            console.warn('⚠️ 解析错误响应JSON失败:', parseError)
            errorData = { 
              message: `Server error (${response.status}): ${response.statusText}`,
              error: 'JSON parse failed'
            }
          }
          
          // 统一处理Turnstile验证失败错误
          if (errorData.code === 'TURNSTILE_VERIFICATION_FAILED' || 
              errorData.code === 'TURNSTILE_RETRY_REQUIRED' ||
              errorData.error?.includes('Human verification')) {
            console.log('🔧 检测到Turnstile验证失败，自动重置验证状态')
            setIsTurnstileVerified(false)
            setTurnstileToken("")
            setTurnstileError("Verification failed, please verify again")
            
            // 重置Turnstile widget
            if (turnstileRef.current && (turnstileRef.current as any).reset) {
              (turnstileRef.current as any).reset()
            }
            
            setError("Human verification failed, please complete verification again and try")
            return
          }
          
          throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`)
        }

        console.log('✅ API响应状态正常，开始解析成功响应...')
        let data: any = {}
        let responseText = '' // 🔧 将responseText声明移到外层作用域
        try {
          // 完全读取JSON响应
          responseText = await response.text()
          console.log('📄 ===== API响应详细分析 =====')
          console.log('📋 响应状态:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          })
          console.log('📄 响应原始文本 (完整):', responseText)
          console.log('📄 响应文本长度:', responseText.length)
          console.log('📄 响应文本前1000字符:', responseText.substring(0, 1000))
          
          // 🔧 增强响应验证
          if (!responseText || responseText.trim().length === 0) {
            console.error('❌ 服务器返回空响应')
            throw new Error('Server returned empty response - please try again')
          }
          
          if (responseText.trim().length <= 2) {
            console.error('❌ 服务器返回极简响应:', responseText)
            throw new Error('Server returned minimal response - this may be a temporary issue, please try again')
          }
          
          if (responseText.trim()) {
            data = JSON.parse(responseText)
            
            // 🔧 超详细的响应数据结构分析
            console.log('📊 ===== 解析后的JSON数据结构分析 =====')
            console.log('📋 JSON解析成功，数据类型:', typeof data)
            console.log('📋 顶级字段:', Object.keys(data))
            console.log('📋 完整JSON对象 (格式化):', JSON.stringify(data, null, 2))
            
            // 🔧 检查所有可能的错误字段
            console.log('🔍 ===== 错误字段检查 =====')
            console.log('🔍 data.error:', data.error)
            console.log('🔍 data.message:', data.message)
            console.log('🔍 data.success:', data.success)
            console.log('🔍 data.code:', data.code)
            console.log('🔍 data.details:', data.details)
            
            // 🔧 检查数据字段
            console.log('🔍 ===== 数据字段检查 =====')
            console.log('🔍 data.data:', !!data.data)
            console.log('🔍 data.data类型:', typeof data.data)
            if (data.data) {
              console.log('🔍 data.data字段:', Object.keys(data.data))
              console.log('🔍 data.data.images:', !!data.data.images)
              console.log('🔍 data.data.images长度:', data.data.images?.length || 0)
            }
            
            // 🔧 检查直接图像字段
            console.log('🔍 data.images:', !!data.images)
            console.log('🔍 data.images长度:', data.images?.length || 0)
            
            // 🔧 检查其他可能的字段
            console.log('🔍 ===== 其他字段检查 =====')
            console.log('🔍 data.result:', !!data.result)
            console.log('🔍 data.output:', !!data.output)
            console.log('🔍 data.credits_remaining:', data.credits_remaining)
            console.log('🔍 data.safety_check:', !!data.safety_check)
            console.log('🔍 data.warning:', data.warning)
            
            // 🔧 首先检查是否有错误信息
            if (data.error) {
              console.error('❌ ===== 发现错误字段 =====')
              console.error('❌ data.error:', data.error)
              console.error('❌ data.message:', data.message)
              console.error('❌ data.details:', data.details)
              console.error('❌ data.code:', data.code)
              console.error('❌ 完整错误对象:', JSON.stringify({
                error: data.error,
                message: data.message,
                details: data.details,
                code: data.code
              }, null, 2))
              throw new Error(data.message || data.error || 'Server returned an error')
            }
            
            // 🔧 检查success字段
            if (data.success === false) {
              console.error('❌ ===== success字段为false =====')
              console.error('❌ data.success:', data.success)
              console.error('❌ data.message:', data.message)
              console.error('❌ data.error:', data.error)
              throw new Error(data.message || data.error || 'Server returned success: false')
            }
            
            // 🔧 检查Chrome扩展冲突
            if (data.error && data.error.includes('chrome-extension')) {
              console.warn('⚠️ 检测到Chrome扩展冲突')
              throw new Error('Browser extension conflict detected. Please disable ad blockers or privacy extensions and try again.')
            }
            
            // 🔧 检查成功响应但无数据
            if (data.success === true && (!data.data || Object.keys(data.data || {}).length === 0)) {
              console.error('❌ 服务器返回成功但无数据')
              console.error('❌ data.success:', data.success)
              console.error('❌ data.data:', data.data)
              console.error('❌ data.data字段数量:', data.data ? Object.keys(data.data).length : 0)
              throw new Error('Server processing completed but no images were generated. This may be due to content policy restrictions or temporary service issues.')
            }
            
            console.log('✅ ===== 响应验证通过 =====')
          }
        } catch (parseError) {
          console.error('❌ 解析成功响应JSON失败:', parseError)
          console.error('❌ 原始响应文本:', responseText)
          throw new Error('Invalid response format from server - please try again')
        }
        
        // 🔧 修改：确保正确处理result，兼容不同的响应数据结构
        result = data.data || data
      }
      
      // 🔧 增强测试，检查result结构
      console.log('🔍 最终result结构分析:', {
        hasResult: !!result,
        resultType: typeof result,
        hasImages: !!result?.images,
        imagesCount: result?.images?.length || 0,
        resultKeys: result ? Object.keys(result) : [],
        firstImageUrl: result?.images?.[0]?.url?.substring(0, 50) + '...' || 'N/A',
        // 🔧 添加完整result对象用于调试
        fullResult: JSON.stringify(result, null, 2).substring(0, 1500) + (JSON.stringify(result).length > 1500 ? '...' : '')
      })
      
      if (result && result.images) {
        console.log('🖼️ 开始处理生成的图像...')
        const newImages: GeneratedImage[] = result.images.map((img: any, index: number) => {
          console.log(`🔍 处理图像 ${index + 1}:`, {
            url: img.url?.substring(0, 50) + '...',
            width: img.width,
            height: img.height,
            hasUrl: !!img.url,
            urlLength: img.url?.length || 0
          })
          return {
            url: img.url,
            width: img.width,
            height: img.height,
            prompt: request.prompt,
            action: request.action,
            timestamp: Date.now()
          }
        })
        
        // 🔧 临时禁用过于严格的图像质量检测系统
        const suspiciousImages: Array<{index: number, image: GeneratedImage, reason: string}> = []
        const nsfwDetectedImages: Array<{index: number, image: GeneratedImage, reason: string}> = []
        
        console.log('🔍 开始图像质量检测...')
        
        // 🔧 只保留NSFW检测，移除其他过于严格的检测
        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i]
          const originalImg = result.images[i] // 获取原始API返回数据
          const urlLower = img.url.toLowerCase()
          let isNsfwDetected = false
          
          console.log(`🔍 检测图像 ${i + 1}:`, {
            url: img.url?.substring(0, 50) + '...',
            urlLength: img.url?.length || 0,
            width: img.width,
            height: img.height
          })
          
          // ✅ 只保留NSFW检测（基于API返回的has_nsfw_concepts字段）
          const hasNsfwConcepts = result.has_nsfw_concepts && 
                                 Array.isArray(result.has_nsfw_concepts) && 
                                 result.has_nsfw_concepts[i] === true
          
          if (hasNsfwConcepts) {
            isNsfwDetected = true
            console.warn(`🚨 图像 ${i + 1} 被API标记为NSFW:`, {
              url: img.url.substring(0, 50) + '...',
              hasNsfwConcepts
            })
            nsfwDetectedImages.push({ index: i, image: img, reason: 'nsfw_content' })
          } else {
            // 🔧 记录正常图像信息
            console.log(`✅ 图像 ${i + 1} 通过检测:`, {
              url: img.url.substring(0, 50) + '...',
              width: img.width,
              height: img.height,
              hasNsfwConcepts: false
            })
          }
        }
        
        // 🔧 只处理真正的NSFW检测到的图像
        if (nsfwDetectedImages.length > 0) {
          console.warn(`🚨 检测到 ${nsfwDetectedImages.length} 张NSFW内容图像`)
          
          // 创建专门的NSFW错误信息
          const nsfwMessage = nsfwDetectedImages.length === newImages.length 
            ? "Content not displayed due to NSFW detection. Your prompt may contain adult or inappropriate content that violates our community guidelines. Please modify your prompt to create family-friendly content."
            : `${nsfwDetectedImages.length} out of ${newImages.length} images were not displayed due to NSFW detection. Please consider adjusting your prompt to avoid adult or inappropriate content.`
          
          setError(nsfwMessage)
          
          // 如果所有图片都是NSFW检测，可以尝试重新生成1次（更安全参数）
          if (nsfwDetectedImages.length === newImages.length && retryCount < 1) {
            console.log(`🔄 所有图像都被标记为NSFW，尝试使用更安全的参数重试...`)
            setRetryCount(prev => prev + 1)
            
            // 修改参数重试：降低guidance_scale和safety_tolerance
            const retryRequest = {
              ...request,
              guidance_scale: Math.max(1.0, (request.guidance_scale || 3.5) - 1.0), // 降低强度
              safety_tolerance: "1", // 使用最严格的安全设置
              seed: Math.floor(Math.random() * 1000000) // 随机种子
            }
            
            console.log(`🔄 重试参数:`, {
              guidance_scale: retryRequest.guidance_scale,
              safety_tolerance: retryRequest.safety_tolerance,
              seed: retryRequest.seed
            })
            
            // 延迟3秒重试
            setTimeout(() => {
              generateImage(retryRequest)
            }, 3000)
            return
          }
          
          // 🔧 如果有部分图像通过检测，显示通过的图像
          const validImages = newImages.filter((_, index) => 
            !nsfwDetectedImages.some(nsfw => nsfw.index === index)
          )
          
          if (validImages.length > 0) {
            console.log(`✅ 显示 ${validImages.length} 张有效图像，共 ${newImages.length} 张`)
            setGeneratedImages(prev => [...validImages, ...prev])
            setRetryCount(0) // 重置重试计数
          }
          
          return // 不继续处理，因为已经处理了NSFW情况
        }
        
        // 🔧 移除所有其他质量检测，直接显示图像
        console.log('✅ 图像生成成功:', {
          imageCount: newImages.length,
          firstImageUrl: newImages[0]?.url?.substring(0, 50) + '...',
          duration: Date.now() - startTime,
          allImagesValid: true
        })
        
        console.log('🎉 ===== 图像生成完成 =====')
        setGeneratedImages(prev => [...newImages, ...prev])
        setRetryCount(0) // 重置重试计数
      } else {
        console.warn('⚠️ result中没有images:', result)
        throw new Error('No images generated - please try again')
      }
    } catch (error: any) {
      console.error('❌ ===== 图像生成错误 =====')
      console.error('🔥 生成错误详情:', {
        message: error.message,
        stack: error.stack,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        errorType: typeof error,
        errorConstructor: error.constructor?.name,
        fullError: error
      })
      
      // 🔧 清除倒计时
      if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
      }
      setCountdown(0)
      
      // 🔧 记录错误信息
      let userFriendlyError = error.message || 'Image generation failed'
      
      if (error.message?.includes('fetch')) {
        userFriendlyError = 'Network error - please check your connection and try again'
      } else if (error.message?.includes('timeout')) {
        userFriendlyError = 'Request timeout - the server is taking too long to respond'
      } else if (error.message?.includes('JSON')) {
        userFriendlyError = 'Server response error - please try again'
      } else if (error.message?.includes('verification')) {
        userFriendlyError = 'Human verification failed - please complete verification and try again'
      }
      
      console.log('📝 用户友好错误信息:', userFriendlyError)
      setError(userFriendlyError)
      
      // 🔧 记录重试次数
      if (error.message.includes('verification') || error.message.includes('Verification')) {
        setRetryCount(prev => prev + 1)
      }
    } finally {
      setIsGenerating(false)
      // 🔧 确保清除倒计时定时器
      if (countdownInterval) {
        clearInterval(countdownInterval)
        setCountdown(0)
      }
      console.log('🏁 图像生成流程结束')
    }
  }, [validateTurnstile, checkTurnstileRequired, turnstileToken, isTurnstileVerified, batchGenerate, userType, userLimits.maxImages, retryCount])

  // 🔧 处理重试
  const handleRetry = useCallback(async () => {
    if (lastRequest) {
      await generateImage(lastRequest)
    }
  }, [lastRequest, generateImage])

  // 🔧 处理文本生成图像
  const handleTextToImage = useCallback(async () => {
    if (!textPrompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    const action = getActionForModel(selectedModel, false, false)
    
    await generateImage({
      action,
      prompt: textPrompt,
      aspect_ratio: aspectRatio,
      guidance_scale: guidanceScale,
      num_images: numImages,
      safety_tolerance: safetyTolerance,
      output_format: outputFormat,
      seed: seed
    })
  }, [textPrompt, selectedModel, aspectRatio, guidanceScale, numImages, safetyTolerance, outputFormat, seed, generateImage])

  // ?? 🔧 处理图像编辑
  const handleImageEdit = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError("Please upload images to edit")
      return
    }

    // ?? ��������ʾ�ʣ�ʹ��Ĭ����ʾ��
    const finalPrompt = editPrompt.trim() || "enhance this image, improve quality and details"

    // ?? ����Ƿ���blob URL��Ҫ�ȴ�ת��
    const hasBlobUrls = uploadedImages.some(url => url.startsWith('blob:'))
    if (hasBlobUrls) {
      console.log('? Detected blob URLs, waiting for R2 conversion...')
      setError("Please wait for image upload to complete before editing")
      return
    }

    // ?? ��֤����URL���ǿɷ��ʵ�HTTP URL
    const invalidUrls = uploadedImages.filter(url => !url.startsWith('http'))
    if (invalidUrls.length > 0) {
      console.error('? Invalid URLs detected:', invalidUrls)
      setError("Some images are not properly uploaded. Please re-upload and try again.")
      return
    }

    // ?? ͼƬ�Ѿ���R2 URL��ֱ��ʹ��
    const imageUrls = uploadedImages
    console.log(`?? Using images for editing:`, imageUrls)

    // ?? ʹ������ģ��ѡ��
    const isMultiImage = imageUrls.length > 1
    const action = getActionForModel(selectedModel, true, isMultiImage)
    
    const requestData = isMultiImage 
      ? { image_urls: imageUrls }
      : { image_url: imageUrls[0] }
    
    console.log(`?? Image editing with prompt: "${finalPrompt}"`)
    
    // ?? 🔧 处理图像编辑
    await generateImage({
      action,
      prompt: finalPrompt,
      ...requestData,
      // ?? 🔧 处理图像编辑
      guidance_scale: guidanceScale,
      num_images: numImages,
      safety_tolerance: safetyTolerance,
      output_format: outputFormat,
      seed: seed
    })
  }, [editPrompt, uploadedImages, selectedModel, guidanceScale, numImages, safetyTolerance, outputFormat, seed, generateImage]) // ?? 🔧 处理图像编辑

  // 🔧 移除上传的图像
  const removeUploadedImage = useCallback((index: number) => {
    // 🔧 移除上传的图像
    const urlToRemove = uploadedImages[index]
    if (urlToRemove && urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove)
    }
    
    // 🔧 移除上传的图像
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    
    console.log(`??? Removed image ${index + 1} and cleaned up resources`)
  }, [uploadedImages])

  // 🔧 复制图像链接
  const handleCopyLink = useCallback(async (url: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopySuccess("Link copied!")
      // 3����Զ������ʾ
      setTimeout(() => setCopySuccess(""), 3000)
    } catch (error) {
      console.error('Copy failed:', error)
      setCopySuccess("Copy failed")
      setTimeout(() => setCopySuccess(""), 3000)
    }
  }, [])

  // 🔧 下载图像
  const handleDownloadImage = useCallback(async (image: GeneratedImage) => {
    try {
      // 🔧 下载图像
      const downloadUrl = (image as any).r2_url || (image as any).fal_url || image.url
      
      console.log('?? Starting download:', {
        r2_url: (image as any).r2_url,
        fal_url: (image as any).fal_url,
        main_url: image.url,
        selected_url: downloadUrl
      })

      // 🔧 下载图像
      try {
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*'
          }
        })
        
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `flux-kontext-${Date.now()}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          console.log('? Download successful via fetch')
          return
        }
      } catch (fetchError) {
        console.warn('?? Fetch download failed, trying direct link:', fetchError)
      }

      // 🔧 下载图像
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `flux-kontext-${Date.now()}.jpg`
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      
      // 🔧 添加DOM元素
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('? Download initiated via direct link')
      
    } catch (error) {
      console.error('? Download failed:', error)
      // 🔧 下载图像
      const openUrl = (image as any).fal_url || image.url
      window.open(openUrl, '_blank', 'noopener,noreferrer')
    }
  }, [])

  // 🔧 快速编辑图像
  const handleQuickEdit = useCallback(async (image: GeneratedImage, editText: string) => {
    if (!editText.trim()) {
      setError("Please enter edit instructions")
      return
    }

    console.log('?? Quick edit started:', {
      imageUrl: image.url,
      editText: editText.trim(),
      selectedModel
    })

    // 🔧 设置图像
    setUploadedImages([image.url])
    setEditPrompt(editText.trim())
    
    // 🔧 滚动到编辑区域
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // 🔧 等待一段时间后，设置编辑提示词
    setTimeout(async () => {
      // 🔧 使用模型进行编辑
      const action = getActionForModel(selectedModel, true, false) // 图像编辑
      
      console.log(`?? Quick edit with minimal parameters`)
      
      // 🔧 处理图像编辑
      await generateImage({
        action,
        prompt: editText.trim(),
        image_url: image.url,
        // 🔧 处理图像编辑
        guidance_scale: guidanceScale,
        num_images: 1, // 图像编辑
        safety_tolerance: safetyTolerance,
        output_format: outputFormat
        // 🔧 处理随机种子
      })
    }, 500) // 500msӳȷ״̬
  }, [selectedModel, guidanceScale, safetyTolerance, outputFormat, generateImage]) // 🔧 处理图像编辑

  // 🔧 处理图像预览


  // 🔧 处理拖放事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // 🔧 处理模型选择
  const getAvailableModelsForContext = useCallback(() => {
    return buildContextModels({
      availableModels,
      hasImages: uploadedImages.length > 0,
      isMultiImage: uploadedImages.length > 1,
    })
  }, [uploadedImages.length, availableModels])

  // 🔧 获取推荐模型
  const getRecommendedModel = useCallback(() => {
    const models = getAvailableModelsForContext()
    return getRecommendedModelValue(models)
  }, [getAvailableModelsForContext])

  // 🔧 处理模型选择变化
  useEffect(() => {
    const recommendedModel = getRecommendedModel()
    if (recommendedModel !== selectedModel) {
      setSelectedModel(recommendedModel as any)
    }
  }, [getRecommendedModel, selectedModel]) // 仅在模型上下文变化时触发

  // 🔧 获取当前模型信息
  const getCurrentModelInfo = useCallback(() => {
    const models = getAvailableModelsForContext()
    return models.find(m => m.value === selectedModel) || models[0]
  }, [selectedModel, getAvailableModelsForContext])

  const currentModelInfo = getCurrentModelInfo()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 🔧 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <span className="text-destructive flex-1">{error}</span>
          <div className="flex gap-2">
            {error.includes("Upgrade required") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/pricing')}
                className="ml-2"
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade Now
              </Button>
            )}
            {lastRequest && retryCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={isGenerating}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 🔧 生成图像部分 */}
      <section className="flex flex-col py-2">
        {/* 🔧 生成图像标题 */}
        <header className="mb-3">
          {/* 🔧 生成图像展示 */}
        </header>

        {/* 🔧 生成图像内容 */}
        <div className="space-y-3">
          {/* 🔧 生成图像和编辑图像 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* 🔧 生成图像 */}
            <Card className="p-3">
              <div className="space-y-3">
                {/* 🔧 生成图像标题 */}
                <div className="text-center mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-1">
                    Flux Kontext AI Generator
                  </h1>
                  <p className="text-base text-yellow-300/80 mb-2">
                    Create and edit professional images with advanced AI technology
                  </p>
                  <div className="flex flex-wrap justify-center gap-1">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Character Consistency</Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Style Transfer</Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Multi-Image Support</Badge>
                  </div>
                </div>

                {/* 🔧 模型选择 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-sm font-medium text-yellow-400">
                      {uploadedImages.length > 0 ? "Image Editing Model" : "Text to Image Model"}
                    </Label>
                    {currentModelInfo?.recommended && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        Recommended
                      </Badge>
                  )}
                </div>

                    <select
                    value={selectedModel}
                      onChange={(e) => {
                      const newModel = e.target.value
                      // 🔧 设置模型
                      if (newModel === 'max-multi') {
                        setSelectedModel('max' as any)
                      } else {
                        setSelectedModel(newModel as any)
                      }
                    }}
                    className="w-full p-2 border border-border rounded text-sm bg-background text-purple-300"
                  >
                    {getAvailableModelsForContext().map((model) => (
                        <option 
                        key={model.value} 
                        value={model.value}
                        disabled={!model.available}
                      >
                        {model.label}
                        {model.recommended ? " ⭐" : ""}
                        {!model.available ? " (Upgrade required)" : ""}
                        </option>
                      ))}
                    </select>
                  
                  {/* 🔧 模型信息 */}
                  {currentModelInfo && (
                    <div className="mt-2 p-3 bg-muted/20 border border-border rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-yellow-400 font-medium">Credits:</span>
                          <span className="ml-1 text-purple-300">{currentModelInfo.credits}</span>
                        </div>
                        <div>
                          <span className="text-yellow-400 font-medium">Speed:</span>
                          <span className="ml-1 text-purple-300">{currentModelInfo.speed}</span>
                        </div>
                        <div>
                          <span className="text-yellow-400 font-medium">Quality:</span>
                          <span className="ml-1 text-purple-300">{currentModelInfo.quality}</span>
                        </div>
                        <div>
                          <span className="text-yellow-400 font-medium">Type:</span>
                          <span className="ml-1 text-purple-300">
                            {uploadedImages.length > 0 ? "Editing" : "Generation"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs text-yellow-300/80 mb-1">
                          {currentModelInfo.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {currentModelInfo.features.map((feature, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-primary/5 text-primary border-primary/20 text-xs px-1 py-0"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 🔧 模型不可用提示 */}
                  {currentModelInfo && !currentModelInfo.available && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-orange-700">
                          {userType === UserType.ANONYMOUS ? "Sign up to unlock this model" : "Upgrade Required"}
                          </span>
                          
                        </div>
                      </div>
                    )}
                  
                  {/* 🔧 多图像编辑提示 */}
                  {uploadedImages.length > 1 && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-700 text-xs">
                          Multi-image editing detected. Using experimental multi-image processing.
                        </span>
                  </div>
                    </div>
                  )}
                </div>

                {/* 🔧 高级设置 */}
                <div>
                  <h3 className="text-sm font-medium text-yellow-400 flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4" />
                    Advanced Settings
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* 🔧 强度 */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block text-yellow-400">
                        Strength: {guidanceScale}
                      </Label>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={guidanceScale}
                          onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-yellow-300/60">
                          <span>Creative</span>
                          <span>Strict</span>
                        </div>
                      </div>
                    </div>

                    {/* 🔧 安全设置 */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block text-yellow-400">
                        Safety: {safetyTolerance}
                      </Label>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={parseInt(safetyTolerance)}
                          onChange={(e) => setSafetyTolerance(e.target.value)}
                          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-yellow-300/60">
                          <span>Strict</span>
                          <span>Permissive</span>
                        </div>
                      </div>
                    </div>

                    {/* 🔧 随机种子 */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block text-yellow-400">Seed</Label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          placeholder="Random"
                          value={seed || ""}
                          onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="flex-1 h-7 text-xs text-purple-300"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                          title="Generate random seed"
                          className="h-7 w-7 p-0"
                        >
                          🎲
                        </Button>
                      </div>
                    </div>

                    {/* 🔧 输出格式 */}
                    <div>
                      <Label className="text-xs font-medium mb-1 block text-yellow-400">Format</Label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="w-full p-1 border border-border rounded text-xs bg-background text-purple-300 h-7"
                      >
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 🔧 编辑图像 */}
            <Card className="p-3">
              <div className="space-y-3">
                {/* 🔧 编辑图像描述 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* 🔧 编辑图像描述 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-sm font-medium text-yellow-400">
                        Image Description
                      </Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const currentPrompt = uploadedImages.length > 0 ? editPrompt : textPrompt
                          
                          if (!currentPrompt.trim()) {
                            const aiOptimizedPrompts = [
                              "A photorealistic portrait of a wise elderly wizard with flowing silver beard, intricate robes, magical aura, studio lighting, highly detailed",
                              "Modern minimalist architecture, clean lines, glass and steel, natural lighting, professional photography, architectural digest style",
                              "Vibrant street art mural, urban setting, colorful graffiti, dynamic composition, street photography, high contrast",
                              "Serene Japanese garden, cherry blossoms, koi pond, traditional architecture, soft morning light, zen atmosphere",
                              "Futuristic cyberpunk cityscape, neon lights, rain-soaked streets, flying vehicles, blade runner aesthetic, cinematic lighting"
                            ]
                            const optimizedPrompt = aiOptimizedPrompts[Math.floor(Math.random() * aiOptimizedPrompts.length)]
                            if (uploadedImages.length > 0) {
                              setEditPrompt(optimizedPrompt)
                            } else {
                              setTextPrompt(optimizedPrompt)
                            }
                          } else {
                            const enhancementSuffixes = [
                              ", professional photography, highly detailed, 8K resolution, award-winning composition",
                              ", cinematic lighting, photorealistic, ultra-detailed, masterpiece quality",
                              ", studio lighting, sharp focus, vibrant colors, professional grade",
                              ", dramatic lighting, high contrast, artistic composition, gallery quality",
                              ", natural lighting, crisp details, professional photography, magazine quality",
                              ", soft lighting, elegant composition, fine art photography, museum quality"
                            ]
                            
                            const enhancementPrefix = [
                              "Professional photo of ",
                              "High-quality image of ",
                              "Artistic rendering of ",
                              "Detailed photograph of ",
                              "Masterpiece depicting ",
                              "Premium quality "
                            ]
                            
                            const usePrefix = Math.random() > 0.5
                            const enhancement = usePrefix 
                              ? enhancementPrefix[Math.floor(Math.random() * enhancementPrefix.length)] + currentPrompt + enhancementSuffixes[Math.floor(Math.random() * enhancementSuffixes.length)]
                              : currentPrompt + enhancementSuffixes[Math.floor(Math.random() * enhancementSuffixes.length)]
                            
                            if (uploadedImages.length > 0) {
                              setEditPrompt(enhancement)
                            } else {
                              setTextPrompt(enhancement)
                            }
                          }
                        }}
                        className="h-6 text-xs px-2"
                      >
                        ✨ AI Enhance
                      </Button>
                    </div>
                    <Textarea
                      placeholder={
                        uploadedImages.length > 0 
                          ? "Describe what you want to change in the images..."
                          : "Describe the image you want to create..."
                      }
                      value={uploadedImages.length > 0 ? editPrompt : textPrompt}
                      onChange={(e) => uploadedImages.length > 0 ? setEditPrompt(e.target.value) : setTextPrompt(e.target.value)}
                      onPaste={handlePaste}
                      className="resize-none text-sm text-purple-300 h-72"
                    />
                  </div>

                  {/* 🔧 参考图像 */}
                  <div>
                    <Label className="text-sm font-medium mb-1 block text-yellow-400">
                      Reference Images (Optional)
                    </Label>
                    <div 
                      className="border-2 border-dashed border-border rounded p-2 text-center bg-muted/20 h-72 flex flex-col justify-center cursor-pointer hover:border-primary/50 transition-colors"
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => {
                        // 🔧 移除input的value，确保选择的是相同的文件
                        if (multiFileInputRef.current) {
                          multiFileInputRef.current.value = ''
                        }
                        multiFileInputRef.current?.click()
                      }}
                      onPaste={handlePaste}
                      tabIndex={0}
                    >
                      <input
                        ref={multiFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultiImageUpload}
                        className="hidden"
                      />
                      {uploadedImages.length > 0 ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-1">
                            {uploadedImages.slice(0, 4).map((url, index) => (
                              <SmartImagePreview
                                key={index}
                                url={url}
                                alt={`Reference ${index + 1}`}
                                index={index}
                                onRemove={() => removeUploadedImage(index)}
                              />
                            ))}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              // 🔧 移除input的value，确保选择的是相同的文件
                              if (multiFileInputRef.current) {
                                multiFileInputRef.current.value = ''
                              }
                              multiFileInputRef.current?.click()
                            }}
                            className="h-6 text-xs"
                          >
                            Add More ({uploadedImages.length})
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-purple-300 mb-1">
                            Click, drag & drop, or paste images
                          </p>
                          <p className="text-xs text-purple-300/60">
                            Supports JPG, PNG, WebP (optional)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 🔧 间隔 */}
                <div className="h-2"></div>

                {/* 🔧 图像数量和比例 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium mb-1 block text-yellow-400">Images Count</Label>
                    <select
                      value={numImages.toString()}
                      onChange={(e) => {
                        const selectedCount = parseInt(e.target.value)
                        if (canUseImageCount(selectedCount)) {
                          setNumImages(selectedCount)
                        }
                      }}
                      className="w-full p-2 border border-border rounded text-sm bg-background text-purple-300 h-8"
                    >
                      {imageCountOptions.map((option) => (
                        <option 
                          key={option.value} 
                          value={option.value}
                          disabled={!canUseImageCount(option.value)}
                        >
                          {option.label}
                          {!canUseImageCount(option.value) ? " (Upgrade required)" : ""}
                        </option>
                      ))}
                    </select>
                    {!canUseImageCount(numImages) && (
                      <div className="mt-1 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-orange-700">
                            {getUpgradeMessage(numImages)}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push('/pricing')}
                            className="h-5 text-xs px-2"
                          >
                            <Crown className="h-2 w-2 mr-1" />
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1 block text-yellow-400">
                      {uploadedImages.length > 0 ? "Output Ratio" : "Aspect Ratio"}
                    </Label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full p-2 border border-border rounded text-sm bg-background text-purple-300 h-8"
                    >
                      {aspectRatioOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                    {/* 🔧 图像编辑模式下的提示 */}
                    {uploadedImages.length > 0 && (
                      <div className="mt-1 text-xs text-yellow-300/70 bg-blue-50/10 border border-blue-200/20 rounded p-2">
                        <div className="flex items-center gap-1">
                          <Info className="h-3 w-3 text-blue-400" />
                          <span className="text-blue-300">
                            Image editing may preserve original proportions. Output ratio provides guidance but final size depends on input image.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🔧 下半部分：安全验证和生成按钮 - 优化移动端布局 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 🔧 安全验证 - 往左移动 */}
                  <div className="col-span-1 md:col-span-1">
                    {isTurnstileEnabled && checkTurnstileRequired() ? (
                      <div>
                        <div className="flex items-center justify-center md:justify-start mb-2">
                          <Label className="text-sm font-medium flex items-center gap-1 text-yellow-400">
                            <Shield className="h-4 w-4" />
                            Security
                          </Label>
                        </div>
                        <div className="bg-muted/30 p-2 rounded h-16 flex items-center justify-center relative" ref={turnstileRef}>
                          {isTurnstileVerified ? (
                            // 🔧 验证成功状态
                            <div className="text-sm text-green-600 text-center py-2 flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              ✅ Verified!
                            </div>
                          ) : (
                            // 🔧 直接显示Turnstile组件，让StandardTurnstile组件自己处理脚本加载
                            <div className="text-center">
                              {(() => {
                                // 🔧 检查Turnstile是否被启用 - 修复环境变量检查逻辑
                                const turnstileEnabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE
                                const isTurnstileEnabled = turnstileEnabled === "true" || turnstileEnabled === "TRUE"
                                const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
                                const hasSiteKey = !!siteKey && siteKey.trim() !== ""
                                
                                console.log("🔍 Turnstile环境变量检查:", {
                                  turnstileEnabled,
                                  isTurnstileEnabled,
                                  siteKey: siteKey ? "已设置" : "未设置",
                                  hasSiteKey,
                                  windowTurnstile: typeof window !== 'undefined' ? !!window.turnstile : "服务器端"
                                })
                                
                                // 🔧 如果Turnstile被禁用，显示禁用状态
                                if (!isTurnstileEnabled || !hasSiteKey) {
                                  return (
                                    <div className="text-sm text-muted-foreground text-center py-2 flex items-center gap-2">
                                      <Shield className="h-4 w-4" />
                                      Verification Disabled
                                    </div>
                                  )
                                }
                                
                                // 🔧 直接显示Turnstile组件，让它自己处理脚本加载
                                return (
                                  <>
                                    <StandardTurnstile
                                      onVerify={handleTurnstileVerify}
                                      onError={handleTurnstileError}
                                      onExpire={handleTurnstileExpire}
                                      theme="auto"
                                      size="flexible"
                                    />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Human verification required
                                    </div>
                                  </>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-sm font-medium flex items-center justify-center md:justify-start gap-1 text-yellow-400 mb-2">
                          <Shield className="h-4 w-4" />
                          Security
                        </Label>
                        <div className="bg-muted/30 p-2 rounded h-16 flex items-center justify-center">
                          <div className="text-sm text-green-600 text-center py-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {userType === UserType.PREMIUM ? "Premium User" : 
                             userType === UserType.REGISTERED ? "Registered User" :
                             !isTurnstileEnabled ? "Disabled" : "No verification needed"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 🔧 右侧：Generate Images - 优化移动端布局 */}
                  <div className="col-span-1 md:col-span-2 flex flex-col justify-center">
                    <div className="flex justify-center md:justify-end md:pr-8">
                      <div className="text-center">
                        <Label className="text-sm font-medium flex items-center justify-center gap-2 text-yellow-400 mb-3">
                          <Zap className="h-5 w-5" />
                        Generate Images
                      </Label>
                        <Button 
                          onClick={
                            uploadedImages.length > 0 ? handleImageEdit : handleTextToImage
                          }
                          disabled={
                            isGenerating || 
                            (uploadedImages.length === 0 && !textPrompt.trim())
                            // 🔧 修改：移除图像编辑模式下对editPrompt的强制要求，允许使用默认提示词进行图像编辑
                          }
                          className="w-full md:w-56 h-16 text-base font-semibold"
                          size="lg"
                        >
                          {isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Generating...</span>
                              {countdown > 0 && (
                                <span className="text-sm opacity-70">
                                  ~{countdown}s
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              <Zap className="mr-2 h-5 w-5" />
                              Generate
                            </>
                          )}
                        </Button>
                        {!canUseImageCount(numImages) && (
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push('/pricing')}
                              className="text-sm"
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              {getUpgradeMessage(numImages)}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 🔧 生成图像 */}
      <section className="py-4 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            Generated Images
          </h2>
          <CreditDisplay 
            showBuyButton={true}
            className="flex-shrink-0"
          />
        </div>

        {/* 🔧 图片展示区域 */}
            {generatedImages.length === 0 ? (
              <Card className="h-96">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-16 w-16 text-primary/50 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-medium text-muted-foreground mb-2">
                      Creating your image...
                    </h3>
                    {countdown > 0 && (
                      <p className="text-sm text-muted-foreground/60">
                        Estimated time remaining: ~{countdown} seconds
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
                    <h3 className="text-xl font-medium text-muted-foreground mb-3">
                      Generated images will appear here
                    </h3>
                    <p className="text-muted-foreground/60 max-w-md mx-auto">
                      {uploadedImages.length > 0 
                        ? `Ready to edit ${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''}. Add your editing instructions and click the generate button.`
                        : "Enter a description and click generate to create new images."
                      }
                    </p>
                  </>
                )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedImages.map((image, index) => (
                    <Card key={index} className="group overflow-hidden">
                      <div className="relative">
                        <img 
                          src={image.url} 
                          alt={`Generated ${index + 1}`}
                          className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // 🔧 快速编辑：获取对应输入框的文本并自动处理
                              const cardElement = (document.activeElement?.closest('.group') || document.querySelector('.group:hover')) as HTMLElement
                              const inputElement = cardElement?.querySelector('input[placeholder="Edit this image..."]') as HTMLInputElement
                              const editText = inputElement?.value?.trim() || ""
                              
                              if (editText) {
                                // 🔧 有文字就直接快速编辑
                                handleQuickEdit(image, editText)
                                // 🔧 清空输入框
                                if (inputElement) inputElement.value = ''
                              } else {
                                // 🔧 修改：没有输入时只设置图片到编辑区，保留现有的编辑提示词不清空
                                setUploadedImages([image.url])
                                // 🔧 移除setEditPrompt("") - 保留用户输入
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }
                            }}
                            title="Quick edit this image"
                            className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownloadImage(image)}
                            title="Download image"
                            className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          "{image.prompt}"
                        </p>
                        <div className="flex items-center justify-between text-xs mb-3">
                          <Badge variant="outline" className="text-xs">
                            {image.action.replace('-', ' ')}
                          </Badge>
                          <span className="text-muted-foreground">
                            {image.width && image.height 
                              ? `${image.width}×${image.height}`
                              : aspectRatio
                            }
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1 mb-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 text-xs"
                            onClick={async () => {
                              // 🔧 优先使用FAL链接，如果没有就使用主链接
                              const linkToCopy = (image as any).fal_url || image.url
                              await handleCopyLink(linkToCopy)
                            }}
                            title="Copy image URL"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            COPY
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // 🔧 新页面打开图片
                              const openUrl = (image as any).fal_url || image.url
                              window.open(openUrl, '_blank', 'noopener,noreferrer')
                            }}
                            title="Open in new page"
                            className="h-8 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            OPEN
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadImage(image)}
                            title="Download image"
                            className="h-8 text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            DOWN
                          </Button>
                        </div>
                    
                        {/* 🔧 复制成功提示 - 设为固定位置，不影响布局 */}
                        {copySuccess && (
                          <div className="text-xs text-green-600 text-center py-1 rounded bg-green-50 border border-green-200 mb-2">
                            ✅ {copySuccess}
                          </div>
                        )}
                        
                        <div className="border-t pt-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Edit this image..."
                              className="flex-1 h-8 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                  const editText = (e.target as HTMLInputElement).value.trim()
                                  handleQuickEdit(image, editText)
                                  ;(e.target as HTMLInputElement).value = ''
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                const inputElement = (e.target as HTMLElement).closest('.flex')?.querySelector('input') as HTMLInputElement
                                const editText = inputElement?.value?.trim() || ""
                                if (editText) {
                                  handleQuickEdit(image, editText)
                                  inputElement.value = ''
                                } else {
                                  setError("Please enter edit instructions")
                                }
                              }}
                              className="h-8 w-8 p-0"
                              title="Quick edit and generate"
                            >
                              <Zap className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
      </section>

      {/* 🔧 如何使用AI平台部分 */}
      <section className="mt-8 py-6 px-6 bg-muted/30 rounded-lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">
            How to Use Our AI Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Upload Your Image</h3>
              <p className="text-muted-foreground">
                Upload your image for character consistency and style analysis.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Write Editing Prompt</h3>
              <p className="text-muted-foreground">
                Describe your edits. The AI handles character consistency and style reference.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Generate with AI Models</h3>
              <p className="text-muted-foreground">
                Choose Pro model (16 credits) or Max model (32 credits) for generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔧 关键AI功能部分 */}
      <section className="mt-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Key AI Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Layers className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Character Consistency</h3>
              <p className="text-sm text-muted-foreground">
                Maintain character identity across different scenes and poses
              </p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Smart Editing</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent image modifications with AI-powered precision
              </p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Style Reference</h3>
              <p className="text-sm text-muted-foreground">
                Generate new scenes in existing styles with consistency
              </p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Interactive Speed</h3>
              <p className="text-sm text-muted-foreground">
                Fast processing with minimal latency for quick iterations
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 🔧 AI平台常见问题部分 */}
      <section className="mt-8 py-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">What is Flux Kontext?</h3>
              <p className="text-muted-foreground">
                Our platform is a suite of generative flow matching models for image generation and editing. 
                Unlike traditional text-to-image models, it understands both text and images as input for true in-context generation.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">What makes this platform special?</h3>
              <p className="text-muted-foreground">
                The system offers four key capabilities: character consistency across scenes, smart editing with AI precision, 
                style reference for new scenes, and interactive speed with minimal latency.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Which model should I choose?</h3>
              <p className="text-muted-foreground">
                Pro model (16 credits) excels at fast iterative editing while maintaining character consistency. 
                Max model (32 credits) provides maximum performance with improved prompt adherence and typography.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">How does the platform achieve character consistency?</h3>
              <p className="text-muted-foreground">
                The AI preserves elements across scenes by understanding visual context. 
                It builds upon previous edits while maintaining characters, identities, styles, and features consistent.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">How does smart editing work?</h3>
              <p className="text-muted-foreground">
                Smart editing uses AI to make intelligent modifications while preserving image quality. 
                This capability enables precise enhancements while maintaining overall composition.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Can the platform handle style reference?</h3>
              <p className="text-muted-foreground">
                Yes, the AI generates new scenes in existing styles. 
                It analyzes style elements from reference images to create consistent visual aesthetics across generations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 🔧 AI模型比较部分 */}
      <section className="mt-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            AI Model Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Pro Model</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">16 Credits</Badge>
              </div>
              <p className="text-muted-foreground mb-6">
                Perfect for fast iterative editing and character consistency
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">Fast processing speed</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">Smart editing capabilities</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">Style reference support</span>
                </li>
              </ul>
              <Button 
                variant={selectedModel === 'pro' ? 'default' : 'outline'} 
                className="w-full"
                onClick={() => {
                  if (!availableModels.includes('pro')) {
                    router.push('/pricing')
                  } else {
                    setSelectedModel('pro')
                  }
                }}
              >
                {!availableModels.includes('pro') ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Upgrade Required
                  </>
                ) : selectedModel === 'pro' ? 'Selected' : 'Select Pro Model'}
              </Button>
            </Card>
            
            <Card className="p-6 border-2 border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Max Model</h3>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">32 Credits</Badge>
              </div>
              <p className="text-muted-foreground mb-6">
                Maximum performance with enhanced prompt adherence
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm">Highest quality output</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm">Advanced typography</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm">Superior prompt adherence</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm">Professional-grade results</span>
                </li>
              </ul>
              <Button 
                variant={selectedModel === 'max' ? 'default' : 'outline'} 
                className="w-full"
                onClick={() => {
                  if (!availableModels.includes('max')) {
                    router.push('/pricing')
                  } else {
                    setSelectedModel('max')
                  }
                }}
              >
                {!availableModels.includes('max') ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Upgrade Required
                  </>
                ) : selectedModel === 'max' ? 'Selected' : 'Select Max Model'}
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
