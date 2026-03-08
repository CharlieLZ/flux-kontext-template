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
  assertMultiImageInput,
  assertSingleImageInput,
  getHeader,
  normalizeGenerationResult,
  sleep,
} from '@/lib/image-generation/utils'

const WAVESPEED_BASE_URL =
  process.env.WAVESPEED_API_BASE_URL?.trim() || 'https://api.wavespeed.ai/api/v3'
const WAVESPEED_POLL_INTERVAL_MS = Number(
  process.env.WAVESPEED_POLL_INTERVAL_MS || 2000
)
const WAVESPEED_POLL_TIMEOUT_MS = Number(
  process.env.WAVESPEED_POLL_TIMEOUT_MS || 50000
)

const WAVESPEED_ACTIONS: Record<
  SupportedWaveSpeedAction,
  {
    endpoint: string
    buildInput: (
      input: FluxKontextGenerationRequest
    ) => Record<string, unknown>
  }
> = {
  'text-to-image-pro': {
    endpoint: 'wavespeed-ai/flux-kontext-pro/text-to-image',
    buildInput: (input) => buildWaveSpeedTextInput(input),
  },
  'text-to-image-max': {
    endpoint: 'wavespeed-ai/flux-kontext-max/text-to-image',
    buildInput: (input) => buildWaveSpeedTextInput(input),
  },
  'edit-image-pro': {
    endpoint: 'wavespeed-ai/flux-kontext-pro',
    buildInput: (input) => ({
      ...buildWaveSpeedBaseInput(input),
      image: assertSingleImageInput('edit-image-pro', input),
    }),
  },
  'edit-image-max': {
    endpoint: 'wavespeed-ai/flux-kontext-max',
    buildInput: (input) => ({
      ...buildWaveSpeedBaseInput(input),
      image: assertSingleImageInput('edit-image-max', input),
    }),
  },
  'edit-multi-image-pro': {
    endpoint: 'wavespeed-ai/flux-kontext-pro/multi',
    buildInput: (input) => ({
      ...buildWaveSpeedBaseInput(input),
      images: assertMultiImageInput('edit-multi-image-pro', input),
    }),
  },
  'edit-multi-image-max': {
    endpoint: 'wavespeed-ai/flux-kontext-max/multi',
    buildInput: (input) => ({
      ...buildWaveSpeedBaseInput(input),
      images: assertMultiImageInput('edit-multi-image-max', input),
    }),
  },
}

type SupportedWaveSpeedAction =
  | 'text-to-image-pro'
  | 'text-to-image-max'
  | 'edit-image-pro'
  | 'edit-image-max'
  | 'edit-multi-image-pro'
  | 'edit-multi-image-max'

type WaveSpeedPrediction = {
  code?: number
  message?: string
  data?: {
    id?: string
    model?: string
    outputs?: string[]
    status?: string
    error?: string
    timings?: Record<string, unknown>
    has_nsfw_contents?: boolean[]
  }
}

export class WaveSpeedImageGenerationProvider implements FluxKontextProvider {
  readonly name = 'wavespeed' as const
  readonly supportedActions = Object.keys(
    WAVESPEED_ACTIONS
  ) as SupportedWaveSpeedAction[]

  async generate(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest
  ): Promise<FluxKontextResult> {
    const config = getWaveSpeedAction(action)
    const response = await postWaveSpeed(config.endpoint, {
      ...config.buildInput(input),
      enable_sync_mode: true,
    })

    const normalized = normalizeWaveSpeedTask(response)

    if (normalized.state === 'completed' && normalized.result) {
      return normalized.result
    }

    if (!response.data?.id) {
      throw new Error('WaveSpeed did not return a prediction id')
    }

    const startedAt = Date.now()

    while (Date.now() - startedAt < WAVESPEED_POLL_TIMEOUT_MS) {
      const task = await this.getTaskResult(action, response.data.id)

      if (task.state === 'completed' && task.result) {
        return task.result
      }

      if (task.state === 'failed') {
        throw new Error(task.error || 'WaveSpeed task failed')
      }

      await sleep(WAVESPEED_POLL_INTERVAL_MS)
    }

    throw new Error('WaveSpeed request timed out before a result was available')
  }

  async submitTask(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest,
    options?: { webhookUrl?: string }
  ): Promise<FluxKontextTaskHandle> {
    const config = getWaveSpeedAction(action)
    const response = await postWaveSpeed(config.endpoint, {
      ...config.buildInput(input),
      webhook_url: options?.webhookUrl,
    })

    const taskId = response.data?.id

    if (!taskId) {
      throw new Error('WaveSpeed did not return a prediction id')
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
    getWaveSpeedAction(action)
    const response = await getWaveSpeed(`/predictions/${taskId}/result`)
    const normalized = normalizeWaveSpeedTask(response)

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
    const secret = normalizeWebhookSecret(
      process.env.WAVESPEED_WEBHOOK_SECRET?.trim()
    )

    if (!secret) {
      return false
    }

    const webhookId = getHeader(headers, 'webhook-id')
    const timestamp = getHeader(headers, 'webhook-timestamp')
    const signatureHeader = getHeader(headers, 'webhook-signature')

    if (!webhookId || !timestamp || !signatureHeader) {
      return false
    }

    const timestampNumber = Number(timestamp)

    if (!Number.isFinite(timestampNumber)) {
      return false
    }

    if (Math.abs(Date.now() / 1000 - timestampNumber) > 300) {
      return false
    }

    const payload = `${webhookId}.${timestamp}.${rawBody}`
    const expected = createHmac('sha256', secret).update(payload).digest('hex')

    return extractWaveSpeedSignatures(signatureHeader).some((signature) =>
      safeEqual(expected, signature)
    )
  }
}

function getWaveSpeedAction(action: FluxKontextAction) {
  const config = WAVESPEED_ACTIONS[action as SupportedWaveSpeedAction]

  if (!config) {
    throw new Error(`WaveSpeed provider does not support ${action}`)
  }

  return config
}

function getWaveSpeedApiKey() {
  const key = process.env.WAVESPEED_API_KEY?.trim()

  if (!key) {
    throw new Error(
      'WAVESPEED_API_KEY is required when IMAGE_GENERATION_PROVIDER=wavespeed'
    )
  }

  return key
}

async function postWaveSpeed(
  endpoint: string,
  body: Record<string, unknown>
): Promise<WaveSpeedPrediction> {
  const apiKey = getWaveSpeedApiKey()
  const response = await fetch(`${WAVESPEED_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'x-api-key': apiKey,
    },
    body: JSON.stringify(
      Object.fromEntries(
        Object.entries(body).filter(([, value]) => typeof value !== 'undefined')
      )
    ),
  })

  const json = (await response.json()) as WaveSpeedPrediction

  if (!response.ok) {
    throw new Error(json.message || `WaveSpeed request failed with ${response.status}`)
  }

  return json
}

async function getWaveSpeed(path: string): Promise<WaveSpeedPrediction> {
  const apiKey = getWaveSpeedApiKey()
  const response = await fetch(`${WAVESPEED_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'x-api-key': apiKey,
    },
  })

  const json = (await response.json()) as WaveSpeedPrediction

  if (!response.ok) {
    throw new Error(json.message || `WaveSpeed request failed with ${response.status}`)
  }

  return json
}

function buildWaveSpeedBaseInput(input: FluxKontextGenerationRequest) {
  return {
    prompt: input.prompt,
    aspect_ratio: input.aspect_ratio,
    seed: input.seed,
    num_images: input.num_images,
    guidance_scale: input.guidance_scale,
    output_format: input.output_format,
    safety_tolerance: input.safety_tolerance,
  }
}

function buildWaveSpeedTextInput(input: FluxKontextGenerationRequest) {
  return buildWaveSpeedBaseInput(input)
}

function normalizeWaveSpeedTask(response: WaveSpeedPrediction): {
  state: FluxKontextTaskState
  result?: FluxKontextResult
  error?: string
} {
  const status = response.data?.status || 'created'

  if (status === 'failed') {
    return {
      state: 'failed',
      error: response.data?.error || response.message || 'WaveSpeed task failed',
    }
  }

  if (status !== 'completed') {
    return {
      state: status === 'processing' ? 'processing' : 'queued',
    }
  }

  const payload: Record<string, unknown> = {
    images: response.data?.outputs?.map((url) => ({ url })) || [],
    timings: response.data?.timings,
    has_nsfw_concepts: response.data?.has_nsfw_contents,
  }

  return {
    state: 'completed',
    result: normalizeGenerationResult('wavespeed', payload),
  }
}

function normalizeWebhookSecret(secret?: string) {
  if (!secret) {
    return ''
  }

  return secret.startsWith('whsec_') ? secret.slice(6) : secret
}

function extractWaveSpeedSignatures(signatureHeader: string) {
  return signatureHeader
    .split(/\s+/)
    .flatMap((part) => part.split(','))
    .map((part) => {
      const [, value] = part.split('=')
      return (value || part).trim()
    })
    .filter(Boolean)
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}
