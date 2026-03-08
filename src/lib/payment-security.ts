import { prisma } from '@/lib/database'
import crypto from 'crypto'

// 🔒 标准价格表 - 服务器端权威价格源
export const STANDARD_PRICING = {
  // 💳 订阅计划价格
  subscriptions: {
    'basic': {
      monthly: { price: 0, credits: 10, currency: 'USD' },
      yearly: { price: 0, credits: 120, currency: 'USD' }
    },
    'plus': {
      monthly: { price: 9.90, credits: 1900, currency: 'USD' },
      yearly: { price: 99, credits: 24000, currency: 'USD' }
    },
    'pro': {
      monthly: { price: 29.90, credits: 8900, currency: 'USD' },
      yearly: { price: 299, credits: 120000, currency: 'USD' }
    }
  },
  
  // 💰 积分包价格
  creditPacks: {
    'starter': { price: 4.90, credits: 600, currency: 'USD' },
    'creator': { price: 15.00, credits: 4000, currency: 'USD' },
    'business': { price: 60.00, credits: 18000, currency: 'USD' }
  }
} as const

// 🔧 CREEM产品ID到内部产品ID的映射
export const CREEM_TO_INTERNAL_MAPPING = {
  // 订阅计划映射
  subscriptions: {
    'FluxKontext-Plus-Monthly': { internalId: 'plus', billingCycle: 'monthly' },
    'FluxKontext-Plus-Yearly': { internalId: 'plus', billingCycle: 'yearly' },
    'FluxKontext-Pro-Monthly': { internalId: 'pro', billingCycle: 'monthly' },
    'FluxKontext-Pro-Yearly': { internalId: 'pro', billingCycle: 'yearly' }
  },
  
  // 积分包映射
  creditPacks: {
    'Starter Pack': 'starter',
    'Creator Pack': 'creator', 
    'Business Pack': 'business'
  }
} as const

// 🔍 将CREEM产品ID转换为内部产品ID
export function mapCreemProductIdToInternal(productType: 'subscription' | 'creditPack', productId: string, billingCycle?: string): {
  internalProductId: string
  internalBillingCycle?: 'monthly' | 'yearly'
} {
  if (productType === 'subscription') {
    const mapping = CREEM_TO_INTERNAL_MAPPING.subscriptions[productId as keyof typeof CREEM_TO_INTERNAL_MAPPING.subscriptions]
    if (mapping) {
      return {
        internalProductId: mapping.internalId,
        internalBillingCycle: mapping.billingCycle
      }
    }
    // 如果没有找到映射，假设传入的就是内部ID
    return {
      internalProductId: productId,
      internalBillingCycle: billingCycle as 'monthly' | 'yearly'
    }
  }
  
  if (productType === 'creditPack') {
    const internalId = CREEM_TO_INTERNAL_MAPPING.creditPacks[productId as keyof typeof CREEM_TO_INTERNAL_MAPPING.creditPacks]
    return {
      internalProductId: internalId || productId
    }
  }
  
  return { internalProductId: productId }
}

// 🔍 价格验证接口
export interface PriceValidationRequest {
  productType: 'subscription' | 'creditPack'
  productId: string
  billingCycle?: 'monthly' | 'yearly'
  amount: number
  currency: string
  userId: string
}

// 📊 价格验证结果
export interface PriceValidationResult {
  isValid: boolean
  expectedPrice: number
  actualPrice: number
  credits: number
  error?: string
  validationHash: string
}

// 🛡️ 价格验证核心函数
export async function validatePrice(request: PriceValidationRequest): Promise<PriceValidationResult> {
  try {
    const { productType, productId, billingCycle, amount, currency, userId } = request

    console.log('🔍 开始价格验证，原始参数:', {
      productType,
      productId,
      billingCycle,
      amount,
      currency
    })

    // 🔧 将CREEM产品ID映射为内部产品ID
    const mappingResult = mapCreemProductIdToInternal(productType, productId, billingCycle)
    const internalProductId = mappingResult.internalProductId
    const internalBillingCycle = mappingResult.internalBillingCycle || billingCycle

    console.log('🔄 产品ID映射结果:', {
      originalProductId: productId,
      internalProductId,
      originalBillingCycle: billingCycle,
      internalBillingCycle
    })

    // 🔍 获取标准价格
    let expectedPrice: number
    let credits: number

    if (productType === 'subscription') {
      const plan = STANDARD_PRICING.subscriptions[internalProductId as keyof typeof STANDARD_PRICING.subscriptions]
      if (!plan) {
        return {
          isValid: false,
          expectedPrice: 0,
          actualPrice: amount,
          credits: 0,
          error: `Unknown subscription plan: ${internalProductId} (original ID: ${productId})`,
          validationHash: ''
        }
      }

      if (!internalBillingCycle || !plan[internalBillingCycle as keyof typeof plan]) {
        return {
          isValid: false,
          expectedPrice: 0,
          actualPrice: amount,
          credits: 0,
          error: `Invalid billing cycle: ${internalBillingCycle} (original: ${billingCycle})`,
          validationHash: ''
        }
      }

      const planDetails = plan[internalBillingCycle as keyof typeof plan]
      expectedPrice = planDetails.price
      credits = planDetails.credits
    } else if (productType === 'creditPack') {
      const pack = STANDARD_PRICING.creditPacks[internalProductId as keyof typeof STANDARD_PRICING.creditPacks]
      if (!pack) {
        return {
          isValid: false,
          expectedPrice: 0,
          actualPrice: amount,
          credits: 0,
          error: `Unknown credit pack: ${internalProductId} (original ID: ${productId})`,
          validationHash: ''
        }
      }

      expectedPrice = pack.price
      credits = pack.credits
    } else {
      return {
        isValid: false,
        expectedPrice: 0,
        actualPrice: amount,
        credits: 0,
        error: `Invalid product type: ${productType}`,
        validationHash: ''
      }
    }

    // 💰 价格匹配验证（前端传递的是分，需要转换为美元）
    const actualAmountInDollars = amount / 100 // 将分转换为美元
    const priceDifference = Math.abs(expectedPrice - actualAmountInDollars)
    
    // 🔧 修复：对于免费计划（价格为0），直接通过验证
    const isValid = expectedPrice === 0 ? 
      (actualAmountInDollars === 0 && currency === 'USD') : 
      (priceDifference < 0.01 && currency === 'USD')

    // 🔐 生成验证哈希
    const validationHash = generateValidationHash({
      userId,
      productType,
      productId: internalProductId, // 使用内部产品ID生成哈希
      amount: expectedPrice,
      currency,
      credits,
      timestamp: Date.now()
    })

    // 📊 记录价格验证日志
    console.log(`💰 Price validation result - Product: ${productType}/${internalProductId}, Expected: $${expectedPrice}, Actual: $${actualAmountInDollars} (${amount} cents), Valid: ${isValid}, Free plan: ${expectedPrice === 0}`)

    return {
      isValid,
      expectedPrice,
      actualPrice: actualAmountInDollars, // 返回美元金额
      credits,
      error: isValid ? undefined : `Price does not match: Expected $${expectedPrice}, Received $${actualAmountInDollars}`,
      validationHash
    }

  } catch (error) {
    console.error('Price validation failed:', error)
    return {
      isValid: false,
      expectedPrice: 0,
      actualPrice: request.amount,
      credits: 0,
      error: 'Price validation system error',
      validationHash: ''
    }
  }
}

// 🔐 生成验证哈希
export function generateValidationHash(data: any): string {
  const secret = process.env.PAYMENT_VALIDATION_SECRET?.trim()
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('PAYMENT_VALIDATION_SECRET is not set; using a development-only fallback secret.')
      return crypto
        .createHmac('sha256', 'development-only-payment-validation-secret')
        .update(JSON.stringify(data))
        .digest('hex')
    }

    throw new Error('PAYMENT_VALIDATION_SECRET must be configured in production')
  }

  const payload = JSON.stringify(data)
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

// 🔍 验证哈希
export function verifyValidationHash(data: any, hash: string): boolean {
  const expectedHash = generateValidationHash(data)
  if (expectedHash.length !== hash.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash))
}

// 🚨 订单防重复检查
export async function checkDuplicateOrder(
  userId: string, 
  amount: number, 
  productId: string,
  productType?: 'subscription' | 'creditPack',
  billingCycle?: string,
  timeWindowMinutes: number = 5
): Promise<{ isDuplicate: boolean; existingOrder?: any }> {
  try {
    const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000)
    
    // 🔧 将前端传递的分转换为美元（与数据库存储格式一致）
    const amountInDollars = amount / 100
    
    // 🔧 将CREEM产品ID映射为内部产品ID（如果提供了productType）
    let searchProductId = productId
    if (productType) {
      const mappingResult = mapCreemProductIdToInternal(productType, productId, billingCycle)
      searchProductId = mappingResult.internalProductId
      console.log('🔄 Duplicate order check - Product ID mapping:', {
        originalProductId: productId,
        searchProductId,
        amountInCents: amount,
        amountInDollars
      })
    }
    
    // 🔧 使用Supabase替代Prisma
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = createAdminClient()
    
    const { data: existingOrder, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('user_id', userId)
      .eq('amount', amountInDollars) // 使用美元金额比较
      .eq('product_id', searchProductId)
      .gte('created_at', timeWindow.toISOString())
      .in('status', ['pending', 'created', 'completed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('Duplicate order check failed:', error)
      return { isDuplicate: false }
    }

    return {
      isDuplicate: !!existingOrder,
      existingOrder
    }
  } catch (error) {
    console.error('Duplicate order check failed:', error)
    return { isDuplicate: false }
  }
}

// 🔒 支付频率限制检查
export async function checkPaymentRateLimit(
  userId: string,
  maxPaymentsPerHour: number = 10
): Promise<{ isAllowed: boolean; currentCount: number }> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    // 🔧 使用Supabase替代Prisma
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = createAdminClient()
    
    const { count, error } = await supabase
      .from('payment_orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo.toISOString())
      .in('status', ['pending', 'created', 'completed'])

    if (error) {
      console.error('支付频率检查失败:', error)
      return { isAllowed: true, currentCount: 0 }
    }

    const currentCount = count || 0
    return {
      isAllowed: currentCount < maxPaymentsPerHour,
      currentCount
    }
  } catch (error) {
    console.error('支付频率检查失败:', error)
    return { isAllowed: true, currentCount: 0 }
  }
}

// 🔒 订单完整性验证
export async function validateOrderIntegrity(orderId: string): Promise<{
  isValid: boolean
  order?: any
  error?: string
}> {
  try {
    const order = await prisma.paymentOrder.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return {
        isValid: false,
        error: '订单不存在'
      }
    }

    // 🔍 验证订单状态
    if (order.status === 'completed') {
      return {
        isValid: false,
        error: '订单已完成，不能重复处理'
      }
    }

    // 🔍 验证订单时效性（24小时内有效）
    const orderAge = Date.now() - new Date(order.createdAt).getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时
    
    if (orderAge > maxAge) {
      return {
        isValid: false,
        error: '订单已过期'
      }
    }

    // 🔍 重新验证价格
    const priceValidation = await validatePrice({
      productType: order.productType as 'subscription' | 'creditPack',
      productId: order.productId,
      billingCycle: order.metadata?.billingCycle,
      amount: order.amount,
      currency: order.currency,
      userId: order.userId
    })

    if (!priceValidation.isValid) {
      return {
        isValid: false,
        error: `订单价格验证失败: ${priceValidation.error}`
      }
    }

    return {
      isValid: true,
      order
    }

  } catch (error) {
    console.error('订单完整性验证失败:', error)
    return {
      isValid: false,
      error: '订单验证系统错误'
    }
  }
}

// 🎯 获取产品信息
export function getProductInfo(productType: string, productId: string, billingCycle?: string) {
  if (productType === 'subscription') {
    const plan = STANDARD_PRICING.subscriptions[productId as keyof typeof STANDARD_PRICING.subscriptions]
    if (plan && billingCycle && plan[billingCycle as keyof typeof plan]) {
      return plan[billingCycle as keyof typeof plan]
    }
  } else if (productType === 'creditPack') {
    return STANDARD_PRICING.creditPacks[productId as keyof typeof STANDARD_PRICING.creditPacks]
  }
  return null
}

// 📋 支付安全检查清单
export async function performSecurityChecks(request: PriceValidationRequest): Promise<{
  passed: boolean
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    console.log('🔒 开始执行支付安全检查...', {
      productType: request.productType,
      productId: request.productId,
      amount: request.amount,
      currency: request.currency,
      userId: request.userId
    })

    // 1️⃣ 价格验证
    console.log('🔍 1️⃣ 执行价格验证...')
    const priceValidation = await validatePrice(request)
    if (!priceValidation.isValid) {
      const errorMsg = `Price validation failed: ${priceValidation.error}`
      console.error('❌ Price validation failed:', {
        expected: priceValidation.expectedPrice,
        actual: priceValidation.actualPrice,
        error: priceValidation.error
      })
      errors.push(errorMsg)
    } else {
      console.log('✅ Price validation passed:', {
        expected: priceValidation.expectedPrice,
        actual: priceValidation.actualPrice,
        credits: priceValidation.credits
      })
    }

    // 2️⃣ 重复订单检查
    console.log('🔍 2️⃣ 执行重复订单检查...')
    const duplicateCheck = await checkDuplicateOrder(
      request.userId,
      request.amount,
      request.productId,
      request.productType,
      request.billingCycle
    )
    if (duplicateCheck.isDuplicate) {
      const warningMsg = 'Potential duplicate order detected'
      console.warn('⚠️ Duplicate order detection:', {
        userId: request.userId,
        amount: request.amount,
        productId: request.productId,
        existingOrder: duplicateCheck.existingOrder?.id
      })
      warnings.push(warningMsg)
    } else {
      console.log('✅ Duplicate order check passed')
    }

    // 3️⃣ 支付频率限制
    console.log('🔍 3️⃣ 执行支付频率检查...')
    const rateLimitCheck = await checkPaymentRateLimit(request.userId)
    if (!rateLimitCheck.isAllowed) {
      const errorMsg = `Payment rate limit exceeded: ${rateLimitCheck.currentCount} payments in the last hour`
      console.error('❌ Payment rate limit exceeded:', {
        userId: request.userId,
        currentCount: rateLimitCheck.currentCount,
        maxAllowed: 10
      })
      errors.push(errorMsg)
    } else {
      console.log('✅ Payment rate limit check passed:', {
        currentCount: rateLimitCheck.currentCount
      })
    }

    // 4️⃣ 用户存在性验证
    console.log('🔍 4️⃣ 执行用户存在性验证...')
    
    // 🔧 使用Supabase替代Prisma，确保数据库访问一致性
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = createAdminClient()
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', request.userId)
      .limit(1)
      .single()
    
    if (userError || !user) {
      const errorMsg = 'User does not exist'
      console.error('❌ User does not exist:', {
        userId: request.userId,
        error: userError?.message
      })
      errors.push(errorMsg)
    } else {
      console.log('✅ User existence verification passed:', {
        userId: user.id,
        email: user.email
      })
    }

    const passed = errors.length === 0
    console.log(`🔒 Payment security check completed - Result: ${passed ? 'Passed' : 'Failed'}`, {
      passed,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    })

    return {
      passed,
      errors,
      warnings
    }

  } catch (error) {
    console.error('❌ Security check system error:', error)
    return {
      passed: false,
      errors: ['Security check system error'],
      warnings: []
    }
  }
}
