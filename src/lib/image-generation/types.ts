export const FLUX_KONTEXT_ACTIONS = [
  'text-to-image-pro',
  'text-to-image-max',
  'text-to-image-schnell',
  'text-to-image-dev',
  'text-to-image-realism',
  'text-to-image-anime',
  'edit-image-pro',
  'edit-image-max',
  'edit-multi-image-pro',
  'edit-multi-image-max',
] as const

export type FluxKontextAction = (typeof FLUX_KONTEXT_ACTIONS)[number]

export type FluxKontextAspectRatio =
  | '21:9'
  | '16:9'
  | '4:3'
  | '3:2'
  | '1:1'
  | '2:3'
  | '3:4'
  | '9:16'
  | '9:21'

export type FluxKontextSafetyTolerance = '1' | '2' | '3' | '4' | '5' | '6'
export type FluxKontextOutputFormat = 'jpeg' | 'png'

export interface FluxKontextBaseInput {
  prompt: string
  seed?: number
  guidance_scale?: number
  sync_mode?: boolean
  num_images?: number
  safety_tolerance?: FluxKontextSafetyTolerance
  output_format?: FluxKontextOutputFormat
}

export interface FluxKontextImageEditInput extends FluxKontextBaseInput {
  image_url: string
  aspect_ratio?: FluxKontextAspectRatio
}

export interface FluxKontextMultiImageInput extends FluxKontextBaseInput {
  image_urls: string[]
  aspect_ratio?: FluxKontextAspectRatio
}

export interface FluxKontextTextToImageInput extends FluxKontextBaseInput {
  aspect_ratio?: FluxKontextAspectRatio
}

export interface FluxKontextGenerationRequest extends FluxKontextBaseInput {
  action?: FluxKontextAction
  image_url?: string
  image_urls?: string[]
  aspect_ratio?: FluxKontextAspectRatio
  turnstile_token?: string
}

export interface FluxKontextImage {
  url: string
  width?: number
  height?: number
  content_type?: string
  [key: string]: unknown
}

export interface FluxKontextResult {
  images: FluxKontextImage[]
  timings?: unknown
  seed?: number
  has_nsfw_concepts?: boolean[]
  prompt?: string
  provider?: ImageGenerationProviderName
  raw?: unknown
}

export type ImageGenerationProviderName = 'fal' | 'kie' | 'wavespeed'
export type FluxKontextTaskState =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'

export interface FluxKontextTaskHandle {
  provider: ImageGenerationProviderName
  taskId: string
  raw?: unknown
}

export interface FluxKontextTaskResult {
  provider: ImageGenerationProviderName
  taskId: string
  state: FluxKontextTaskState
  result?: FluxKontextResult
  error?: string
  raw?: unknown
}

export interface FluxKontextSubmitTaskOptions {
  webhookUrl?: string
}

export interface FluxKontextProvider {
  readonly name: ImageGenerationProviderName
  readonly supportedActions: readonly FluxKontextAction[]
  generate(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest
  ): Promise<FluxKontextResult>
  uploadFile?(file: File): Promise<string>
  submitTask?(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest,
    options?: FluxKontextSubmitTaskOptions
  ): Promise<FluxKontextTaskHandle>
  getTaskResult?(
    action: FluxKontextAction,
    taskId: string
  ): Promise<FluxKontextTaskResult>
  verifyWebhook?(
    rawBody: string,
    headers: Headers | Record<string, string | undefined>
  ): Promise<boolean>
}
