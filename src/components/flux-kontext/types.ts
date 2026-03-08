export type FluxKontextAction =
  | 'text-to-image-pro'
  | 'text-to-image-max'
  | 'text-to-image-schnell'
  | 'text-to-image-dev'
  | 'text-to-image-realism'
  | 'text-to-image-anime'
  | 'edit-image-pro'
  | 'edit-image-max'
  | 'edit-multi-image-pro'
  | 'edit-multi-image-max'

export type GeneratorModelValue =
  | 'pro'
  | 'max'
  | 'max-multi'
  | 'schnell'
  | 'dev'
  | 'realism'
  | 'anime'

export interface GeneratedImage {
  url: string
  width?: number
  height?: number
  prompt: string
  action: FluxKontextAction
  timestamp: number
}

export interface GenerationRequest {
  action: FluxKontextAction
  prompt: string
  image_url?: string
  image_urls?: string[]
  aspect_ratio?: string
  guidance_scale?: number
  num_images?: number
  safety_tolerance?: string
  output_format?: string
  seed?: number
  turnstile_token?: string
}

export interface GeneratorModelOption {
  value: GeneratorModelValue
  label: string
  description: string
  credits: number
  speed: string
  quality: string
  features: string[]
  available: boolean
  recommended: boolean
}
