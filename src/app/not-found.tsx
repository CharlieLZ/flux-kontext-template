import Link from 'next/link'
import { Button } from '@/components/ui/button'
// 导入文案系统 - 修复导入错误
import { common } from '@/lib/content'
import { mailtoSupport, siteConfig } from '@/lib/site-config'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Go Home
            </Button>
          </Link>
          <Link href="/generate">
            <Button variant="outline" size="lg">
              Try Generator
            </Button>
          </Link>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Need help? <a href={mailtoSupport()} className="text-primary hover:underline">{siteConfig.supportEmail}</a></p>
        </div>
      </div>
    </div>
  )
} 
