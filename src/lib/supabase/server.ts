import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`)
  }

  return value
}

export async function createClient() {
  const cookieStore = await cookies()

  // 创建服务器端的Supabase客户端
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // 在 Next.js proxy 中调用时可能会失败，这是正常的
            if (process.env.NODE_ENV !== 'production') {
              console.warn('Failed to set Supabase auth cookies:', error)
            }
          }
        },
      },
    }
  )
}

// 管理员客户端（使用service_role密钥）
export function createAdminClient() {
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // 管理员客户端不需要设置cookies
        },
      },
    }
  )
}
