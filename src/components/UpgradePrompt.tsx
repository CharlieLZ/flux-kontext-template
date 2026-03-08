import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, Star, ArrowRight } from "lucide-react"
import { UserType, getUpgradeSuggestion, pricingPlans } from "@/lib/user-tiers"

interface UpgradePromptProps {
  userType: UserType
  feature?: string
  className?: string
  compact?: boolean
}

export function UpgradePrompt({ userType, feature, className = "", compact = false }: UpgradePromptProps) {
  const suggestion = getUpgradeSuggestion(userType, feature)
  
  if (!suggestion || userType === UserType.PREMIUM) {
    return null
  }

  if (compact) {
    return (
      <div className={`app-cta-panel rounded-lg p-3 text-foreground ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="app-icon-token h-4 w-4" />
            <span className="text-sm font-medium">{suggestion.title}</span>
          </div>
          <Button variant="secondary" size="sm" className="text-primary">
            {suggestion.action}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className={`app-surface-card ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="app-cta-panel rounded-full p-3">
            <Crown className="app-icon-token h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{suggestion.title}</h3>
              {userType === UserType.ANONYMOUS && (
                <Badge variant="outline" className="app-tint-badge app-tint-badge--success">
                  免费
                </Badge>
              )}
              {suggestion.nextTier === UserType.PREMIUM && (
                <Badge variant="outline" className="app-tint-badge">
                  $29/月
                </Badge>
              )}
            </div>
            
            <p className="mb-4 text-muted-foreground">{suggestion.description}</p>
            
            {/* 功能列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {userType === UserType.ANONYMOUS && (
                <>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Zap className="app-icon-token h-4 w-4" />
                    <span>Flux Kontext Max模型</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Star className="app-icon-token h-4 w-4" />
                    <span>生成1-4张图片</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Crown className="app-icon-token h-4 w-4" />
                    <span>历史记录同步</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <ArrowRight className="app-icon-token h-4 w-4" />
                    <span>更多宽高比选项</span>
                  </div>
                </>
              )}
              
              {userType === UserType.REGISTERED && (
                <>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Crown className="app-icon-token h-4 w-4" />
                    <span>批量生成1-12张</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Zap className="app-icon-token h-4 w-4" />
                    <span>Private Mode私人模式</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Star className="app-icon-token h-4 w-4" />
                    <span>优先队列快速生成</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <ArrowRight className="app-icon-token h-4 w-4" />
                    <span>无限制使用频率</span>
                  </div>
                </>
              )}
            </div>
            
            {/* 特殊优惠 */}
            {suggestion.nextTier === UserType.PREMIUM && (
              <div className="app-tint-badge app-tint-badge--warning mb-4 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Star className="app-icon-token--warning h-4 w-4" />
                  <span className="text-sm font-medium">
                    年付方案节省20% - 仅需$290/年
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              {userType === UserType.ANONYMOUS && (
                <Button variant="outline" className="flex-1">
                  免费注册
                </Button>
              )}
              <Button 
                className="flex-1"
              >
                {suggestion.action}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 功能锁定提示组件
interface FeatureLockedProps {
  userType: UserType
  feature: string
  requiredTier: UserType
  className?: string
}

export function FeatureLocked({ userType, feature, requiredTier, className = "" }: FeatureLockedProps) {
  const tierNames = {
    [UserType.ANONYMOUS]: "免费用户",
    [UserType.REGISTERED]: "注册用户", 
    [UserType.PREMIUM]: "Premium用户"
  }
  
  return (
    <div className={`app-surface-card rounded-lg border-2 border-dashed p-4 text-center ${className}`}>
      <Crown className="mx-auto mb-2 h-8 w-8 text-primary/70" />
      <h4 className="mb-1 font-medium text-foreground">{feature}</h4>
      <p className="mb-3 text-sm text-muted-foreground">
        此功能需要{tierNames[requiredTier]}权限
      </p>
      <UpgradePrompt userType={userType} feature={feature} compact />
    </div>
  )
}

// 使用量提示组件
interface UsageLimitProps {
  current: number
  limit: number
  period: string
  userType: UserType
}

export function UsageLimit({ current, limit, period, userType }: UsageLimitProps) {
  const percentage = (current / limit) * 100
  const isNearLimit = percentage >= 80
  const isOverLimit = current >= limit
  
  return (
    <div className="app-surface-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground/80">
          使用量 ({period})
        </span>
        <span className="text-sm text-muted-foreground">
          {current} / {limit === Infinity ? '∞' : limit}
        </span>
      </div>
      
      {limit !== Infinity && (
        <div className="mb-3 h-2 w-full rounded-full bg-muted">
          <div 
            className={`h-2 rounded-full transition-all ${
              isOverLimit ? 'bg-destructive' : 
              isNearLimit ? 'bg-warning' : 
              'bg-success'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      
      {isOverLimit && (
        <div className="mb-2 text-sm text-destructive">
          已达到使用限制，请升级账户继续使用
        </div>
      )}
      
      {isNearLimit && !isOverLimit && (
        <div className="mb-2 text-sm text-warning">
          即将达到使用限制，建议升级账户
        </div>
      )}
      
      {(isNearLimit || isOverLimit) && userType !== UserType.PREMIUM && (
        <UpgradePrompt userType={userType} compact />
      )}
    </div>
  )
} 
