const verboseLogging =
  process.env.ENABLE_VERBOSE_LOGS === 'true' &&
  process.env.NODE_ENV !== 'production'

export function verboseLog(message: string, payload?: unknown) {
  if (!verboseLogging) {
    return
  }

  if (typeof payload === 'undefined') {
    console.log('[flux-kontext]', message)
    return
  }

  console.log('[flux-kontext]', message, payload)
}

export function getRequiredCredits(action: string): number {
  switch (action) {
    case 'text-to-image-pro':
    case 'edit-image-pro':
    case 'edit-multi-image-pro':
      return 15
    case 'text-to-image-max':
    case 'edit-image-max':
      return 30
    case 'edit-multi-image-max':
      return 45
    case 'text-to-image-schnell':
      return 8
    case 'text-to-image-dev':
      return 12
    case 'text-to-image-realism':
    case 'text-to-image-anime':
      return 20
    default:
      return 15
  }
}

export function getClientIpFromHeaders(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for') ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function verifyTurnstileToken(
  token: string,
  clientIP: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    console.error('❌ Turnstile secret key not configured')
    return false
  }

  verboseLog('🔑 Starting Turnstile token verification')

  const maxRetries = 3
  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const formData = new FormData()
      formData.append('secret', secretKey)
      formData.append('response', token)

      if (clientIP && clientIP !== 'unknown' && clientIP !== '127.0.0.1') {
        formData.append('remoteip', clientIP)
        verboseLog(`🌐 Adding client IP to Turnstile verification (attempt ${attempt}/${maxRetries})`)
      } else {
        verboseLog(`🌐 Skipping IP verification (attempt ${attempt}/${maxRetries})`)
      }

      console.log(`🚀 Sending Turnstile verification request... (attempt ${attempt}/${maxRetries})`)
      const verifyResponse = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          body: formData,
          headers: {
            'User-Agent': 'FluxKontext/1.0',
          },
          signal: AbortSignal.timeout(15000),
        }
      )

      if (!verifyResponse.ok) {
        const errorMsg = `❌ Turnstile API response error: ${verifyResponse.status} ${verifyResponse.statusText}`
        console.error(errorMsg)
        lastError = new Error(errorMsg)

        if (verifyResponse.status >= 500 && attempt < maxRetries) {
          console.log(`⏳ Server error, retrying after ${2000 * attempt}ms...`)
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
          continue
        }

        if (
          verifyResponse.status >= 400 &&
          verifyResponse.status < 500 &&
          attempt < maxRetries
        ) {
          console.log(`⏳ Client error, retrying after ${1000 * attempt}ms...`)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
          continue
        }

        return false
      }

      const result = await verifyResponse.json()
      console.log(`📋 Turnstile verification response (attempt ${attempt}):`, {
        success: result.success,
        'error-codes': result['error-codes'],
        challenge_ts: result.challenge_ts,
        hostname: result.hostname,
        action: result.action,
      })

      if (result.success === true) {
        console.log(`✅ Turnstile verification successful (attempt ${attempt})`)
        return true
      }

      if (result['error-codes']) {
        const errorCodes = result['error-codes']
        console.warn('⚠️ Turnstile verification failed, error codes:', errorCodes)

        const retryableErrors = [
          'timeout-or-duplicate',
          'internal-error',
          'invalid-input-response',
          'bad-request',
        ]
        const hasRetryableError = errorCodes.some((code: string) =>
          retryableErrors.includes(code)
        )
        const hasHostnameError = errorCodes.includes('hostname-mismatch')
        const isDevelopment = process.env.NODE_ENV === 'development'

        if (hasHostnameError && isDevelopment) {
          console.log('🔧 Development environment detected hostname mismatch, but allowing pass')
          return true
        }

        if (hasRetryableError && attempt < maxRetries) {
          console.log(`⏳ Detected retryable error, retrying after ${2000 * attempt}ms...`)
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
          continue
        }

        lastError = new Error(`Turnstile verification failed: ${errorCodes.join(', ')}`)
      }

      break
    } catch (error) {
      console.error(`❌ Turnstile verification network error (attempt ${attempt}):`, error)
      lastError = error

      if (attempt < maxRetries) {
        console.log(`⏳ Network error, retrying after ${2000 * attempt}ms...`)
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
        continue
      }
    }
  }

  console.error(`❌ Turnstile verification final failure, attempted ${maxRetries} times:`, lastError)
  return false
}
