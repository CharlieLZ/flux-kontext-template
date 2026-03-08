import {
  getFalQueueResult,
  getFalQueueStatus,
  submitFalQueue,
  subscribeToFal,
  uploadToFalStorage,
} from '@/lib/fal-client'
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
  aspectRatioToFalImageSize,
  assertMultiImageInput,
  assertSingleImageInput,
  normalizeGenerationResult,
} from '@/lib/image-generation/utils'

type FalActionConfig = {
  endpoint: string
  buildInput: (
    input: FluxKontextGenerationRequest
  ) => Record<string, unknown>
}

const FAL_ENDPOINTS = {
  KONTEXT_PRO: 'fal-ai/flux-pro/kontext',
  KONTEXT_MAX: 'fal-ai/flux-pro/kontext/max',
  KONTEXT_PRO_MULTI: 'fal-ai/flux-pro/kontext/multi',
  KONTEXT_MAX_MULTI: 'fal-ai/flux-pro/kontext/max/multi',
  FLUX_PRO_TEXT_TO_IMAGE: 'fal-ai/flux-pro',
  FLUX_MAX_TEXT_TO_IMAGE: 'fal-ai/flux-pro/v1.1',
  FLUX_SCHNELL: 'fal-ai/flux/schnell',
  FLUX_DEV: 'fal-ai/flux/dev',
  FLUX_GENERAL: 'fal-ai/flux-general',
} as const

const FAL_ACTIONS: Record<FluxKontextAction, FalActionConfig> = {
  'text-to-image-pro': {
    endpoint: FAL_ENDPOINTS.FLUX_PRO_TEXT_TO_IMAGE,
    buildInput: (input) => buildFalTextToImageInput(input),
  },
  'text-to-image-max': {
    endpoint: FAL_ENDPOINTS.FLUX_MAX_TEXT_TO_IMAGE,
    buildInput: (input) => buildFalTextToImageInput(input),
  },
  'text-to-image-schnell': {
    endpoint: FAL_ENDPOINTS.FLUX_SCHNELL,
    buildInput: (input) => ({
      prompt: input.prompt,
      seed: input.seed,
      sync_mode: input.sync_mode,
      num_images: input.num_images,
      output_format: input.output_format,
      image_size: aspectRatioToFalImageSize(input.aspect_ratio),
      num_inference_steps: 4,
    }),
  },
  'text-to-image-dev': {
    endpoint: FAL_ENDPOINTS.FLUX_DEV,
    buildInput: (input) => buildFalTextToImageInput(input),
  },
  'text-to-image-realism': {
    endpoint: FAL_ENDPOINTS.FLUX_GENERAL,
    buildInput: (input) => ({
      ...buildFalTextToImageInput(input),
      loras: [
        {
          path: 'https://huggingface.co/XLabs-AI/flux-RealismLora/resolve/main/lora.safetensors',
          scale: 0.8,
        },
      ],
    }),
  },
  'text-to-image-anime': {
    endpoint: FAL_ENDPOINTS.FLUX_GENERAL,
    buildInput: (input) => ({
      ...buildFalTextToImageInput(input),
      loras: [
        {
          path: 'https://huggingface.co/Shakker-Labs/FLUX.1-dev-LoRA-AnimeStyle/resolve/main/FLUX-dev-lora-AnimeStyle.safetensors',
          scale: 0.9,
        },
      ],
    }),
  },
  'edit-image-pro': {
    endpoint: FAL_ENDPOINTS.KONTEXT_PRO,
    buildInput: (input) => buildFalEditInput(assertSingleImageInput('edit-image-pro', input), input),
  },
  'edit-image-max': {
    endpoint: FAL_ENDPOINTS.KONTEXT_MAX,
    buildInput: (input) => buildFalEditInput(assertSingleImageInput('edit-image-max', input), input),
  },
  'edit-multi-image-pro': {
    endpoint: FAL_ENDPOINTS.KONTEXT_PRO_MULTI,
    buildInput: (input) =>
      buildFalMultiImageInput(
        assertMultiImageInput('edit-multi-image-pro', input),
        input
      ),
  },
  'edit-multi-image-max': {
    endpoint: FAL_ENDPOINTS.KONTEXT_MAX_MULTI,
    buildInput: (input) =>
      buildFalMultiImageInput(
        assertMultiImageInput('edit-multi-image-max', input),
        input
      ),
  },
}

export class FalImageGenerationProvider implements FluxKontextProvider {
  readonly name = 'fal' as const
  readonly supportedActions = Object.keys(FAL_ACTIONS) as FluxKontextAction[]

  async generate(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest
  ): Promise<FluxKontextResult> {
    const config = FAL_ACTIONS[action]
    const result = await subscribeToFal(config.endpoint, {
      input: config.buildInput(input),
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log(
            `[fal] ${action} progress:`,
            update.logs?.map((log) => log.message).join('\n')
          )
        }
      },
    })

    const payload =
      result && typeof result === 'object' && 'data' in result
        ? ((result as { data?: Record<string, unknown> }).data ??
            (result as Record<string, unknown>))
        : (result as Record<string, unknown>)

    return normalizeGenerationResult(this.name, payload)
  }

  async uploadFile(file: File): Promise<string> {
    return uploadToFalStorage(file)
  }

  async submitTask(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest,
    options?: { webhookUrl?: string }
  ): Promise<FluxKontextTaskHandle> {
    const config = FAL_ACTIONS[action]
    const submission = await submitFalQueue(config.endpoint, {
      input: config.buildInput(input),
      webhookUrl: options?.webhookUrl,
    })

    return {
      provider: this.name,
      taskId: submission.request_id,
      raw: submission,
    }
  }

  async getTaskResult(
    action: FluxKontextAction,
    taskId: string
  ): Promise<FluxKontextTaskResult> {
    const config = FAL_ACTIONS[action]
    const status = await getFalQueueStatus(config.endpoint, {
      requestId: taskId,
      logs: true,
    })

    const state = mapFalState(status.status)

    if (state !== 'completed') {
      return {
        provider: this.name,
        taskId,
        state,
        raw: status,
      }
    }

    const result = await getFalQueueResult(config.endpoint, {
      requestId: taskId,
    })

    const payload =
      result && typeof result === 'object' && 'data' in result
        ? ((result as { data?: Record<string, unknown> }).data ??
            (result as Record<string, unknown>))
        : (result as Record<string, unknown>)

    return {
      provider: this.name,
      taskId,
      state: 'completed',
      result: normalizeGenerationResult(this.name, payload),
      raw: result,
    }
  }
}

function buildFalTextToImageInput(input: FluxKontextGenerationRequest) {
  return {
    prompt: input.prompt,
    seed: input.seed,
    guidance_scale: input.guidance_scale,
    sync_mode: input.sync_mode,
    num_images: input.num_images,
    safety_tolerance: input.safety_tolerance,
    output_format: input.output_format,
    image_size: aspectRatioToFalImageSize(input.aspect_ratio),
  }
}

function buildFalEditInput(
  imageUrl: string,
  input: FluxKontextGenerationRequest
) {
  return {
    prompt: input.prompt,
    image_url: imageUrl,
    seed: input.seed,
    guidance_scale: input.guidance_scale,
    num_images: input.num_images,
    safety_tolerance: input.safety_tolerance,
    output_format: input.output_format,
  }
}

function buildFalMultiImageInput(
  imageUrls: string[],
  input: FluxKontextGenerationRequest
) {
  return {
    prompt: input.prompt,
    image_urls: imageUrls,
    seed: input.seed,
    guidance_scale: input.guidance_scale,
    num_images: input.num_images,
    safety_tolerance: input.safety_tolerance,
    output_format: input.output_format,
  }
}

function mapFalState(status?: string): FluxKontextTaskState {
  switch (status) {
    case 'COMPLETED':
      return 'completed'
    case 'IN_PROGRESS':
      return 'processing'
    case 'FAILED':
      return 'failed'
    case 'IN_QUEUE':
    default:
      return 'queued'
  }
}
