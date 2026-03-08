import { createHmac, timingSafeEqual } from 'node:crypto'

import {
  FluxKontextAction,
  FluxKontextGenerationRequest,
  FluxKontextProvider,
  FluxKontextResult,
  FluxKontextTaskHandle,
  FluxKontextTaskResult,
  FluxKontextTaskState,
} from '@/lib/image-generation/types'
import {
  assertSingleImageInput,
  getHeader,
  normalizeGenerationResult,
  sleep,
} from '@/lib/image-generation/utils'

const KIE_BASE_URL = process.env.KIE_API_BASE_URL?.trim() || 'https://api.kie.ai'
const KIE_POLL_INTERVAL_MS = Number(process.env.KIE_POLL_INTERVAL_MS || 2000)
const KIE_POLL_TIMEOUT_MS = Number(process.env.KIE_POLL_TIMEOUT_MS || 50000)

const KIE_ACTIONS: Record<
  SupportedKieAction,
  {
    model: 'flux-kontext-pro' | 'flux-kontext-max'
    requiresImage: boolean
  }
> = {
  'text-to-image-pro': { model: 'flux-kontext-pro', requiresImage: false },
  'text-to-image-max': { model: 'flux-kontext-max', requiresImage: false },
  'edit-image-pro': { model: 'flux-kontext-pro', requiresImage: true },
  'edit-image-max': { model: 'flux-kontext-max', requiresImage: true },
}

type SupportedKieAction =
  | 'text-to-image-pro'
  | 'text-to-image-max'
  | 'edit-image-pro'
  | 'edit-image-max'

type KieGenerateResponse = {
  taskId?: string
  code?: number
  message?: string
  data?: {
    taskId?: string
  }
}

type KieRecordResponse = {
  code?: number
  message?: string
  data?: Record<string, unknown>
  resultImageUrl?: string
  successFlag?: number
}

export class KieImageGenerationProvider implements FluxKontextProvider {
  readonly name = 'kie' as const
  readonly supportedActions = Object.keys(KIE_ACTIONS) as SupportedKieAction[]

  async generate(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest
  ): Promise<FluxKontextResult> {
    const handle = await this.submitTask(action, input)
    const startedAt = Date.now()

    while (Date.now() - startedAt < KIE_POLL_TIMEOUT_MS) {
      const task = await this.getTaskResult(action, handle.taskId)

      if (task.state === 'completed' && task.result) {
        return task.result
      }

      if (task.state === 'failed') {
        throw new Error(task.error || 'KIE task failed')
      }

      await sleep(KIE_POLL_INTERVAL_MS)
    }

    throw new Error('KIE request timed out before a result was available')
  }

  async submitTask(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest,
    options?: { webhookUrl?: string }
  ): Promise<FluxKontextTaskHandle> {
    const config = getKieAction(action)
    const response = await postKie<KieGenerateResponse>(
      '/api/v1/flux/kontext/generate',
      {
        prompt: input.prompt,
        model: config.model,
        image_url: config.requiresImage
          ? assertSingleImageInput(action, input)
          : undefined,
        aspect_ratio: input.aspect_ratio,
        aspectRatio: input.aspect_ratio,
        guidance_scale: input.guidance_scale,
        guidanceScale: input.guidance_scale,
        num_images: input.num_images,
        numImages: input.num_images,
        seed: input.seed,
        output_format: input.output_format,
        outputFormat: input.output_format,
        safety_tolerance: input.safety_tolerance,
        safetyTolerance: input.safety_tolerance,
        callBackUrl: options?.webhookUrl,
      }
    )

    const taskId = response.taskId || response.data?.taskId

    if (!taskId) {
      throw new Error('KIE did not return a taskId')
    }

    return {
      provider: this.name,
      taskId,
      raw: response,
    }
  }

  async getTaskResult(
    action: FluxKontextAction,
    taskId: string
  ): Promise<FluxKontextTaskResult> {
    getKieAction(action)

    const response = await getKie<KieRecordResponse>(
      `/api/v1/flux/kontext/record-info?taskId=${encodeURIComponent(taskId)}`
    )

    const normalized = normalizeKiePayload(response)

    return {
      provider: this.name,
      taskId,
      state: normalized.state,
      result: normalized.result,
      error: normalized.error,
      raw: response,
    }
  }

  async verifyWebhook(
    rawBody: string,
    headers: Headers | Record<string, string | undefined>
  ): Promise<boolean> {
    const secret = process.env.KIE_WEBHOOK_SIGNING_SECRET?.trim()

    if (!secret) {
      return false
    }

    const signature =
      getHeader(headers, 'x-kie-signature') || getHeader(headers, 'x-signature')
    const timestamp =
      getHeader(headers, 'x-kie-timestamp') || getHeader(headers, 'x-timestamp')

    if (!signature || !timestamp) {
      return false
    }

    let taskId = ''

    try {
      const parsed = JSON.parse(rawBody) as { taskId?: string; data?: { taskId?: string } }
      taskId = parsed.taskId || parsed.data?.taskId || ''
    } catch {
      return false
    }

    if (!taskId) {
      return false
    }

    const payload = `${taskId}.${timestamp}`
    const expected = createHmac('sha256', secret).update(payload).digest('base64')

    return safeEqual(expected, signature)
  }
}

function getKieAction(action: FluxKontextAction) {
  const config = KIE_ACTIONS[action as SupportedKieAction]

  if (!config) {
    throw new Error(`KIE provider does not support ${action}`)
  }

  return config
}

function getKieApiKey() {
  const key = process.env.KIE_API_KEY?.trim()

  if (!key) {
    throw new Error('KIE_API_KEY is required when IMAGE_GENERATION_PROVIDER=kie')
  }

  return key
}

async function postKie<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${KIE_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getKieApiKey()}`,
    },
    body: JSON.stringify(
      Object.fromEntries(
        Object.entries(body).filter(([, value]) => typeof value !== 'undefined')
      )
    ),
  })

  const json = (await response.json()) as T & { message?: string }

  if (!response.ok) {
    throw new Error(json.message || `KIE request failed with ${response.status}`)
  }

  return json
}

async function getKie<T>(path: string) {
  const response = await fetch(`${KIE_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getKieApiKey()}`,
    },
  })

  const json = (await response.json()) as T & { message?: string }

  if (!response.ok) {
    throw new Error(json.message || `KIE request failed with ${response.status}`)
  }

  return json
}

function normalizeKiePayload(response: KieRecordResponse): {
  state: FluxKontextTaskState
  result?: FluxKontextResult
  error?: string
} {
  const data = response.data ?? {}
  const successFlag =
    typeof response.successFlag === 'number'
      ? response.successFlag
      : typeof data.successFlag === 'number'
        ? (data.successFlag as number)
        : 0

  if (successFlag === 0) {
    return { state: 'processing' }
  }

  if (successFlag !== 1) {
    return {
      state: 'failed',
      error:
        (data.errorMessage as string | undefined) ||
        response.message ||
        'KIE task failed',
    }
  }

  const imageUrl =
    (data.resultImageUrl as string | undefined) ||
    (response.resultImageUrl as string | undefined)

  const payload: Record<string, unknown> = imageUrl
    ? {
        ...data,
        images: [{ url: imageUrl }],
      }
    : data

  return {
    state: 'completed',
    result: normalizeGenerationResult('kie', payload),
  }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}
