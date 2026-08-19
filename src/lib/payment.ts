import { prisma } from "@/lib/database"
import Stripe from "stripe"
import { getStripeClient, isStripeAvailable } from "@/lib/stripe-client"
import { performSecurityChecks, PriceValidationRequest } from "@/lib/payment-security"
import { validateCheckoutParams } from "@/lib/services/pricing"
import { CheckoutParams } from "@/lib/types/pricing"
import { generateOrderNo } from "@/lib/utils/hash"
import { getIsoTimestr, addMonthsToDate } from "@/lib/utils/time"

// 支付提供商类型
export type PaymentProvider = "stripe" | "creem"

// 支付产品类型
export type ProductType = "subscription" | "credits" | "one_time"

// 支付参数接口
export interface PaymentParams {
  userId: string
  userEmail: string
  productId: string
  productName: string
  amount: number // 以分为单位
  currency: string
  productType: ProductType
  billingCycle?: "monthly" | "yearly" // 订阅时需要
  creditsAmount?: number // 购买积分时需要
  provider?: PaymentProvider // 可选，不传则自动选择
}

// 支付结果接口
export interface PaymentResult {
  success: boolean
  checkoutUrl?: string
  orderId?: string
  error?: string
  provider?: PaymentProvider // 返回实际使用的支付提供商
}

// 支付提供商统计接口
interface ProviderStats {
  provider: PaymentProvider
  count: number
  lastUsed: Date
}

// 配置常量
const MAX_ORDERS_PER_24H = 10 // 24小时内最大订单数
const DEFAULT_PROVIDER: PaymentProvider = "creem" // 默认使用Creem
const FALLBACK_PROVIDER: PaymentProvider = "stripe" // 备用提供商

/**
 * 创建支付会话 - 统一入口
 */
export async function createPaymentSession(params: PaymentParams): Promise<PaymentResult> {
  try {
    // 1. 基础参数验证
    if (!params.userId || !params.userEmail || !params.amount || !params.productId) {
      throw new Error("缺少必要的支付参数")
    }

    // 🔒 2. 安全验证 - 新增
    const securityRequest: PriceValidationRequest = {
      productType: params.productType === 'subscription' ? 'subscription' : 'creditPack',
      productId: params.productId,
      billingCycle: params.billingCycle,
      amount: params.amount / 100, // 转换为美元（从分转换）
      currency: params.currency,
      userId: params.userId
    }
    
    const securityCheck = await performSecurityChecks(securityRequest)
    if (!securityCheck.passed) {
      throw new Error(`安全验证失败: ${securityCheck.errors.join(', ')}`)
    }

    // 3. 智能选择支付提供商
    const provider = await determinePaymentProvider(
      params.userId, 
      params.provider,
      undefined, // userLocation - 可以从用户资料获取
      params.amount
    )
    
    // 4. 创建内部订单记录
    const order = await createPaymentOrder(params, provider)
    
    // 5. 根据提供商创建支付会话
    let checkoutUrl: string
    
    if (provider === "stripe") {
      checkoutUrl = await createStripeSession(params, order.id)
    } else {
      checkoutUrl = await createCreemSession(params, order.id)
    }
    
    console.log(`✅ 支付会话创建成功: 提供商=${provider}, 订单=${order.orderNumber}`)
    
    return {
      success: true,
      checkoutUrl,
      orderId: order.id,
      provider,
    }
  } catch (error) {
    console.error("❌ 创建支付会话失败:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "支付创建失败",
    }
  }
}

/**
 * 获取24小时内支付提供商使用统计 - 使用数据库服务
 */
async function getPaymentProviderStats(): Promise<ProviderStats[]> {
  const { getPaymentProviderStats: getStats } = await import("@/lib/services/payment-database")
  
  return await getStats(24) // 24小时内的统计
}

/**
 * 智能支付提供商选择 - 基于配置文件的手动控制
 */
async function determinePaymentProvider(
  userId: string, 
  preferredProvider?: PaymentProvider,
  userLocation?: string,
  amount?: number
): Promise<PaymentProvider> {
  
  // 导入配置文件
  const { getActivePaymentProvider, validatePaymentConfig } = await import("@/lib/config/payment")
  
  // 验证配置
  try {
    validatePaymentConfig()
  } catch (error) {
    console.error("❌ 支付配置验证失败:", error)
    throw error
  }
  
  // 获取活跃的支付提供商
  const activeProvider = getActivePaymentProvider(userLocation, amount, preferredProvider)
  
  if (!activeProvider) {
    throw new Error("当前没有可用的支付提供商，请联系管理员")
  }
  
  return activeProvider
}

/**
 * 创建内部支付订单记录 - 使用数据库服务
 */
async function createPaymentOrder(params: PaymentParams, provider: PaymentProvider) {
  const { createPaymentOrder: createOrder } = await import("@/lib/services/payment-database")
  
  const { generateOrderNo } = await import("@/lib/utils/hash")
  const orderNumber = `ORDER_${generateOrderNo()}`
  
  return await createOrder({
    userId: params.userId,
    orderNumber,
    amount: params.amount,
    currency: params.currency,
    paymentProvider: provider,
    productType: params.productType,
    productId: params.productId,
    productName: params.productName,
    customerEmail: params.userEmail,
    metadata: {
      billingCycle: params.billingCycle,
      creditsAmount: params.creditsAmount,
      autoSelected: !params.provider, // 标记是否为自动选择
      selectionReason: params.provider ? "manual" : "auto_load_balance"
    },
  })
}

/**
 * 创建 Stripe 支付会话 - 支持全球支付
 */
async function createStripeSession(params: PaymentParams, orderId: string): Promise<string> {
  // 检查Stripe是否可用
  if (!isStripeAvailable()) {
    throw new Error("Stripe支付未启用或配置不完整");
  }

  const stripe = getStripeClient();
  const isSubscription = params.productType === "subscription"
  
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: {
            name: params.productName,
          },
          unit_amount: params.amount,
          recurring: isSubscription ? {
            interval: params.billingCycle === "yearly" ? "year" : "month",
          } : undefined,
        },
        quantity: 1,
      },
    ],
    mode: isSubscription ? "subscription" : "payment",
    success_url: `${process.env.NEXT_PUBLIC_WEB_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/pricing`,
    customer_email: params.userEmail,
    allow_promotion_codes: true,
    metadata: {
      orderId,
      userId: params.userId,
      productType: params.productType,
      creditsAmount: params.creditsAmount?.toString() || "0",
      project: process.env.NEXT_PUBLIC_PROJECT_NAME || "Veo3",
    },
  }
  
  // 根据货币类型添加本地化支付方式
  if (params.currency.toLowerCase() === "cny") {
    // 中国用户支持微信支付和支付宝
    sessionParams.payment_method_types = ["card", "wechat_pay", "alipay"]
    sessionParams.payment_method_options = {
      wechat_pay: { client: "web" },
      alipay: {},
    }
  } else if (params.currency.toLowerCase() === "eur") {
    // 欧洲用户支持SEPA
    sessionParams.payment_method_types = ["card", "sepa_debit", "bancontact", "ideal"]
  } else if (params.currency.toLowerCase() === "gbp") {
    // 英国用户支持Bacs
    sessionParams.payment_method_types = ["card", "bacs_debit"]
  }
  
  // 订阅模式的额外配置
  if (isSubscription) {
    sessionParams.subscription_data = {
      metadata: sessionParams.metadata,
    }
  }
  
  const session = await stripe.checkout.sessions.create(sessionParams)
  
  // 更新订单记录
  await prisma.paymentOrder.update({
    where: { id: orderId },
    data: { 
      stripeSessionId: session.id,
      metadata: JSON.parse(JSON.stringify(sessionParams))
    }
  })
  
  return session.url!
}

/**
 * 创建 Creem 支付会话 - 支持全球支付
 */
async function createCreemSession(params: PaymentParams, orderId: string): Promise<string> {
  const requestBody = {
    product_id: params.productId,
    customer: {
      email: params.userEmail,
    },
    metadata: {
      orderId,
      userId: params.userId,
      productType: params.productType,
      credits: params.creditsAmount || 0,
    },
    success_url: process.env.CREEM_SUCCESS_URL || `${process.env.NEXT_PUBLIC_WEB_URL}/payment/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/pricing`,
  }
  
  const response = await fetch(`${process.env.CREEM_API_URL}/checkouts`, {
    method: "POST",
    headers: {
      "x-api-key": process.env.CREEM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Creem支付创建失败: ${response.status} ${errorText}`)
  }
  
  const data = await response.json()
  
  // 更新订单记录
  await prisma.paymentOrder.update({
    where: { id: orderId },
    data: { 
      creemCheckoutId: data.id,
      metadata: JSON.parse(JSON.stringify(requestBody))
    }
  })
  
  return data.checkout_url
}

/**
 * 处理支付成功回调 - 统一处理入口
 */
export async function handlePaymentSuccess(
  provider: PaymentProvider,
  sessionId: string
): Promise<boolean> {
  try {
    if (provider === "stripe") {
      return await handleStripeSuccess(sessionId)
    } else {
      return await handleCreemSuccess(sessionId)
    }
  } catch (error) {
    console.error("❌ 处理支付成功回调失败:", error)
    return false
  }
}

/**
 * 处理 Stripe 支付成功 - 按照Shipany模板标准
 */
async function handleStripeSuccess(sessionId: string): Promise<boolean> {
  try {
    const stripe = getStripeClient(); // 获取Stripe客户端
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session || !session.metadata || session.payment_status !== "paid") {
      throw new Error("Invalid session or payment not completed")
    }
    
    const orderId = session.metadata.orderId
    if (!orderId) {
      throw new Error("Order ID not found in session metadata")
    }
    
    const order = await prisma.paymentOrder.findUnique({
      where: { id: orderId }
    })
    
    if (!order) {
      throw new Error("Order not found")
    }
    
    if (order.status !== "pending") {
      console.log(`⚠️ 订单状态已更新: ${order.orderNumber} - ${order.status}`)
      return true // 已处理过，返回成功
    }
    
    // 🔥 按照Shipany标准更新订单状态
    const paidAt = new Date()
    const paidEmail = session.customer_details?.email || session.customer_email || order.customerEmail
    const paidDetail = JSON.stringify(session)
    
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: "completed",
        paidAt,
                 // paidEmail,
         // paidDetail,
         stripePaymentIntentId: session.payment_intent ? session.payment_intent as string : null,
        metadata: JSON.parse(JSON.stringify(session))
      }
    })
    
    console.log(`✅ Stripe订单支付成功: ${order.orderNumber}`)
    
    // 🔥 处理业务逻辑 - 按照Shipany模板标准
    await processOrderCompletion(order, paidAt, paidEmail || "", paidDetail)
    
    return true
  } catch (error) {
    console.error("❌ 处理Stripe支付成功失败:", error)
    return false
  }
}

/**
 * 处理 Creem 支付成功 - 按照Shipany模板标准
 */
async function handleCreemSuccess(checkoutId: string): Promise<boolean> {
  try {
    const order = await prisma.paymentOrder.findFirst({
      where: { creemCheckoutId: checkoutId }
    })
    
    if (!order) {
      throw new Error("Order not found")
    }
    
    if (order.status !== "pending") {
      console.log(`⚠️ 订单状态已更新: ${order.orderNumber} - ${order.status}`)
      return true // 已处理过，返回成功
    }
    
    // 🔥 按照Shipany标准更新订单状态
    const paidAt = new Date()
    const paidEmail = order.customerEmail || ""
    const paidDetail = `Creem payment completed for checkout: ${checkoutId}`
    
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: "completed",
        paidAt,
                 // paidEmail,
         // paidDetail,
         creemPaymentId: checkoutId
      }
    })
    
    console.log(`✅ Creem订单支付成功: ${order.orderNumber}`)
    
    // 🔥 处理业务逻辑 - 按照Shipany模板标准
    await processOrderCompletion(order, paidAt, paidEmail || "", paidDetail)
    
    return true
  } catch (error) {
    console.error("❌ 处理Creem支付成功失败:", error)
    return false
  }
}

/**
 * 处理支付完成后的业务逻辑 - 按照Shipany模板标准
 */
async function processOrderCompletion(
  order: any, 
  paidAt: Date, 
  paidEmail: string, 
  paidDetail: string
) {
  try {
    const userId = order.userId
    const creditsAmount = order.metadata?.creditsAmount || 0
    
    // 🔥 1. 处理积分增加 - 按照Shipany模板标准
    if (creditsAmount > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: creditsAmount
          }
        }
      })
      
      // 记录积分交易
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: creditsAmount,
          type: "purchase",
          description: `购买积分包: ${order.productName}`,
          paymentOrderId: order.id,
          referenceId: order.orderNumber
        }
      })
      
      console.log(`✅ 积分增加成功: 用户${userId} +${creditsAmount}积分`)
    }
    
    // 🔥 2. 处理订阅激活 - 按照Shipany模板标准
    if (order.productType === "subscription") {
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId, status: "active" }
      })
      
      const billingCycle = order.metadata?.billingCycle || "monthly"
      const currentPeriodStart = new Date()
      const currentPeriodEnd = new Date()
      
      if (billingCycle === "yearly") {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
      } else {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      }
      
      if (existingSubscription) {
        // 更新现有订阅
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planId: order.productId,
            status: "active",
            billingCycle,
            currentPeriodStart,
            currentPeriodEnd,
            paymentProvider: order.paymentProvider,
            stripeSubscriptionId: order.stripeSessionId,
            creemSubscriptionId: order.creemCheckoutId
          }
        })
      } else {
        // 创建新订阅
        await prisma.subscription.create({
          data: {
            userId,
            planId: order.productId,
            status: "active",
            billingCycle,
            currentPeriodStart,
            currentPeriodEnd,
            paymentProvider: order.paymentProvider,
            stripeSubscriptionId: order.stripeSessionId,
            creemSubscriptionId: order.creemCheckoutId
          }
        })
      }
      
      console.log(`✅ 订阅激活成功: 用户${userId} - ${order.productId}`)
    }
    
    // 🔥 3. 处理推荐系统 - 基础实现（后续完善）
    await processAffiliateForOrder(order)
    
    console.log(`✅ 订单业务逻辑处理完成: ${order.orderNumber}`)
    
  } catch (error) {
    console.error("❌ 处理订单业务逻辑失败:", error)
    throw error
  }
}

/**
 * 处理推荐系统 - 基础实现（按照Shipany模板预留接口）
 */
async function processAffiliateForOrder(order: any) {
  try {
    // 导入推荐系统服务
    const { updateAffiliateForOrder } = await import("@/lib/services/affiliate")
    
    // 调用推荐系统处理逻辑
    await updateAffiliateForOrder(order)
    
    console.log(`📈 推荐系统处理完成: ${order.orderNumber}`)
  } catch (error) {
    console.error("❌ 推荐系统处理失败:", error)
    // 推荐系统失败不影响主流程
  }
}

// 监控面板函数已删除 - 自动切换逻辑已足够 