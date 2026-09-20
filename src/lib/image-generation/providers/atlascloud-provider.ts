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
  normalizeGenerationResult,
  sleep,
} from '@/lib/image-generation/utils'

const ATLASCLOUD_BASE_URL =
  process.env.ATLASCLOUD_API_BASE_URL?.trim() || 'https://api.atlascloud.ai'
const ATLASCLOUD_POLL_INTERVAL_MS = Number(
  process.env.ATLASCLOUD_POLL_INTERVAL_MS || 2000
)
const ATLASCLOUD_POLL_TIMEOUT_MS = Number(
  process.env.ATLASCLOUD_POLL_TIMEOUT_MS || 50000
)

/**
 * Atlas Cloud serves the Black Forest Labs FLUX family behind one key, so each
 * action maps to the model id the gateway exposes. `pro` uses FLUX.2 Pro and
 * the mid tier uses FLUX.2 Flex; `schnell` and `dev` have no Kontext
 * equivalent on the other providers but are served here directly.
 */
const ATLASCLOUD_ACTIONS: Record<
  SupportedAtlasCloudAction,
  {
    model: string
    images: 'none' | 'single' | 'multi'
  }
> = {
  'text-to-image-pro': {
    model: 'black-forest-labs/flux-2-flex/text-to-image',
    images: 'none',
  },
  'text-to-image-max': {
    model: 'black-forest-labs/flux-2-pro/text-to-image',
    images: 'none',
  },
  'text-to-image-schnell': {
    model: 'black-forest-labs/flux-schnell',
    images: 'none',
  },
  'text-to-image-dev': {
    model: 'black-forest-labs/flux-dev',
    images: 'none',
  },
  'edit-image-pro': {
    model: 'black-forest-labs/flux-2-flex/edit',
    images: 'single',
  },
  'edit-image-max': {
    model: 'black-forest-labs/flux-2-pro/edit',
    images: 'single',
  },
  'edit-multi-image-pro': {
    model: 'black-forest-labs/flux-2-flex/edit',
    images: 'multi',
  },
  'edit-multi-image-max': {
    model: 'black-forest-labs/flux-2-pro/edit',
    images: 'multi',
  },
}

type SupportedAtlasCloudAction =
  | 'text-to-image-pro'
  | 'text-to-image-max'
  | 'text-to-image-schnell'
  | 'text-to-image-dev'
  | 'edit-image-pro'
  | 'edit-image-max'
  | 'edit-multi-image-pro'
  | 'edit-multi-image-max'

type AtlasCloudEnvelope<T> = {
  code?: number | string
  message?: string
  data?: T
}

type AtlasCloudPrediction = {
  id?: string
  status?: string
  outputs?: string[] | null
  error?: string
  has_nsfw_contents?: boolean | null
}

export class AtlasCloudImageGenerationProvider implements FluxKontextProvider {
  readonly name = 'atlascloud' as const
  readonly supportedActions = Object.keys(
    ATLASCLOUD_ACTIONS
  ) as SupportedAtlasCloudAction[]

  async generate(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest
  ): Promise<FluxKontextResult> {
    const handle = await this.submitTask(action, input)
    const startedAt = Date.now()

    while (Date.now() - startedAt < ATLASCLOUD_POLL_TIMEOUT_MS) {
      const task = await this.getTaskResult(action, handle.taskId)

      if (task.state === 'completed' && task.result) {
        return task.result
      }

      if (task.state === 'failed') {
        throw new Error(task.error || 'Atlas Cloud task failed')
      }

      await sleep(ATLASCLOUD_POLL_INTERVAL_MS)
    }

    throw new Error(
      'Atlas Cloud request timed out before a result was available'
    )
  }

  async submitTask(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest
  ): Promise<FluxKontextTaskHandle> {
    const config = getAtlasCloudAction(action)
    const body: Record<string, unknown> = {
      model: config.model,
      prompt: input.prompt,
      seed: input.seed,
      num_images: input.num_images,
      output_format: input.output_format,
      safety_tolerance: input.safety_tolerance
        ? Number(input.safety_tolerance)
        : undefined,
      aspect_ratio: input.aspect_ratio,
      guidance_scale: input.guidance_scale,
      enable_base64_output: false,
    }

    if (config.images === 'single') {
      body.images = [assertSingleImageInput(action, input)]
    } else if (config.images === 'multi') {
      body.images = assertMultiImageInput(action, input)
    }

    const response = await postAtlasCloud<AtlasCloudPrediction>(
      '/api/v1/model/generateImage',
      body
    )
    const taskId = response.data?.id

    if (!taskId) {
      throw new Error('Atlas Cloud did not return a prediction id')
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
    getAtlasCloudAction(action)

    const response = await getAtlasCloud<AtlasCloudPrediction>(
      `/api/v1/model/prediction/${encodeURIComponent(taskId)}`
    )
    const prediction = response.data ?? {}
    const state = toTaskState(prediction)

    return {
      provider: this.name,
      taskId,
      state,
      result:
        state === 'completed'
          ? normalizeGenerationResult(this.name, {
              images: prediction.outputs ?? [],
              prompt: undefined,
            })
          : undefined,
      error: state === 'failed' ? prediction.error || 'Atlas Cloud task failed' : undefined,
      raw: response,
    }
  }
}

function toTaskState(prediction: AtlasCloudPrediction): FluxKontextTaskState {
  const status = (prediction.status || '').toLowerCase()

  if (prediction.outputs?.length) {
    return 'completed'
  }

  if (['failed', 'error', 'canceled', 'cancelled'].includes(status)) {
    return 'failed'
  }

  if (['queued', 'starting', 'pending'].includes(status)) {
    return 'queued'
  }

  return 'processing'
}

function getAtlasCloudAction(action: FluxKontextAction) {
  const config = ATLASCLOUD_ACTIONS[action as SupportedAtlasCloudAction]

  if (!config) {
    throw new Error(`Atlas Cloud provider does not support ${action}`)
  }

  return config
}

function getAtlasCloudApiKey(): string {
  const key = process.env.ATLASCLOUD_API_KEY?.trim()

  if (!key) {
    throw new Error('ATLASCLOUD_API_KEY is not configured')
  }

  return key
}

async function postAtlasCloud<T>(
  path: string,
  body: Record<string, unknown>
): Promise<AtlasCloudEnvelope<T>> {
  const response = await fetch(`${ATLASCLOUD_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAtlasCloudApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pruneUndefined(body)),
  })

  return readAtlasCloudResponse<T>(response)
}

async function getAtlasCloud<T>(path: string): Promise<AtlasCloudEnvelope<T>> {
  const response = await fetch(`${ATLASCLOUD_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getAtlasCloudApiKey()}`,
    },
  })

  return readAtlasCloudResponse<T>(response)
}

async function readAtlasCloudResponse<T>(
  response: Response
): Promise<AtlasCloudEnvelope<T>> {
  const text = await response.text()
  let payload: AtlasCloudEnvelope<T> | null = null

  try {
    payload = text ? (JSON.parse(text) as AtlasCloudEnvelope<T>) : null
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(
      `Atlas Cloud request failed (${response.status}): ${
        payload?.message || text || response.statusText
      }`
    )
  }

  if (!payload) {
    throw new Error('Atlas Cloud returned an empty response')
  }

  return payload
}

function pruneUndefined(
  body: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined)
  )
}
