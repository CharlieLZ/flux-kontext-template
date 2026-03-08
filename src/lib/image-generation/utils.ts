import {
  FLUX_KONTEXT_ACTIONS,
  FluxKontextAction,
  FluxKontextAspectRatio,
  FluxKontextGenerationRequest,
  FluxKontextImage,
  FluxKontextResult,
  ImageGenerationProviderName,
} from '@/lib/image-generation/types'

const VALID_PROVIDERS: ImageGenerationProviderName[] = [
  'fal',
  'kie',
  'wavespeed',
]

let invalidProviderWarned = false

export function isFluxKontextAction(value: string): value is FluxKontextAction {
  return (FLUX_KONTEXT_ACTIONS as readonly string[]).includes(value)
}

export function getConfiguredImageProvider(): ImageGenerationProviderName {
  const configured = process.env.IMAGE_GENERATION_PROVIDER?.trim().toLowerCase()

  if (!configured) {
    return 'fal'
  }

  if (VALID_PROVIDERS.includes(configured as ImageGenerationProviderName)) {
    return configured as ImageGenerationProviderName
  }

  if (!invalidProviderWarned) {
    invalidProviderWarned = true
    console.warn(
      `Unsupported IMAGE_GENERATION_PROVIDER "${configured}", falling back to fal.`
    )
  }

  return 'fal'
}

export function assertSingleImageInput(
  action: FluxKontextAction,
  input: FluxKontextGenerationRequest
): string {
  if (!input.image_url) {
    throw new Error(`image_url is required for ${action}`)
  }

  return input.image_url
}

export function assertMultiImageInput(
  action: FluxKontextAction,
  input: FluxKontextGenerationRequest
): string[] {
  if (!input.image_urls?.length) {
    throw new Error(`image_urls is required for ${action}`)
  }

  return input.image_urls
}

export function aspectRatioToFalImageSize(
  aspectRatio?: FluxKontextAspectRatio
):
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9' {
  switch (aspectRatio) {
    case '1:1':
      return 'square_hd'
    case '3:4':
    case '2:3':
      return 'portrait_4_3'
    case '9:16':
    case '9:21':
      return 'portrait_16_9'
    case '16:9':
    case '21:9':
      return 'landscape_16_9'
    case '4:3':
    case '3:2':
    default:
      return 'landscape_4_3'
  }
}

export function firstNonEmptyImageList(
  payload: Record<string, unknown> | null | undefined
): FluxKontextImage[] | null {
  if (!payload) {
    return null
  }

  const candidates = ['images', 'data.images', 'output', 'outputs', 'result']

  for (const candidate of candidates) {
    const value = readPath(payload, candidate)

    if (Array.isArray(value) && value.length > 0) {
      return normalizeImages(value)
    }

    if (typeof value === 'string' && value.startsWith('http')) {
      return [{ url: value }]
    }

    if (
      value &&
      typeof value === 'object' &&
      typeof (value as { url?: unknown }).url === 'string'
    ) {
      return [{ ...(value as FluxKontextImage) }]
    }
  }

  return null
}

export function normalizeGenerationResult(
  provider: ImageGenerationProviderName,
  payload: Record<string, unknown> | null | undefined
): FluxKontextResult {
  const images = firstNonEmptyImageList(payload)

  if (!images?.length) {
    throw new Error(`No images were returned by the ${provider} provider`)
  }

  return {
    images,
    prompt: readOptionalString(payload, 'prompt'),
    seed: readOptionalNumber(payload, 'seed'),
    timings: readPath(payload, 'timings'),
    has_nsfw_concepts: readBooleanArray(payload, 'has_nsfw_concepts'),
    provider,
    raw: payload,
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getHeader(
  headers: Headers | Record<string, string | undefined>,
  name: string
): string | undefined {
  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined
  }

  const lowered = name.toLowerCase()

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowered) {
      return value
    }
  }

  return undefined
}

function normalizeImages(images: unknown[]): FluxKontextImage[] {
  return images
    .map((image) => {
      if (typeof image === 'string' && image.startsWith('http')) {
        return { url: image }
      }

      if (
        image &&
        typeof image === 'object' &&
        typeof (image as { url?: unknown }).url === 'string'
      ) {
        return image as FluxKontextImage
      }

      return null
    })
    .filter((image): image is FluxKontextImage => !!image)
}

function readPath(
  payload: Record<string, unknown> | null | undefined,
  path: string
): unknown {
  if (!payload) {
    return undefined
  }

  return path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined
    }

    return (current as Record<string, unknown>)[key]
  }, payload)
}

function readOptionalString(
  payload: Record<string, unknown> | null | undefined,
  path: string
): string | undefined {
  const value = readPath(payload, path)
  return typeof value === 'string' ? value : undefined
}

function readOptionalNumber(
  payload: Record<string, unknown> | null | undefined,
  path: string
): number | undefined {
  const value = readPath(payload, path)
  return typeof value === 'number' ? value : undefined
}

function readBooleanArray(
  payload: Record<string, unknown> | null | undefined,
  path: string
): boolean[] | undefined {
  const value = readPath(payload, path)

  if (!Array.isArray(value)) {
    return undefined
  }

  return value.filter((item): item is boolean => typeof item === 'boolean')
}
