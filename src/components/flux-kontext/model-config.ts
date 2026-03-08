import type {
  FluxKontextAction,
  GeneratorModelOption,
  GeneratorModelValue,
} from '@/components/flux-kontext/types'

interface BuildContextModelsOptions {
  availableModels: string[]
  hasImages: boolean
  isMultiImage: boolean
}

export function getActionForModel(
  model: GeneratorModelValue,
  hasImages: boolean,
  isMultiImage: boolean
): FluxKontextAction {
  if (hasImages) {
    if (isMultiImage) {
      switch (model) {
        case 'max':
        case 'max-multi':
          return 'edit-multi-image-max'
        case 'pro':
        default:
          return 'edit-multi-image-pro'
      }
    }

    switch (model) {
      case 'max':
        return 'edit-image-max'
      case 'pro':
      default:
        return 'edit-image-pro'
    }
  }

  switch (model) {
    case 'max':
      return 'text-to-image-max'
    case 'pro':
      return 'text-to-image-pro'
    case 'schnell':
      return 'text-to-image-schnell'
    case 'dev':
      return 'text-to-image-dev'
    case 'realism':
      return 'text-to-image-realism'
    case 'anime':
      return 'text-to-image-anime'
    default:
      return 'text-to-image-pro'
  }
}

export function getEstimatedGenerationTime(action: FluxKontextAction): number {
  switch (action) {
    case 'text-to-image-schnell':
      return 7
    case 'text-to-image-pro':
    case 'edit-image-pro':
    case 'edit-multi-image-pro':
      return 10
    case 'text-to-image-max':
    case 'edit-image-max':
    case 'edit-multi-image-max':
      return 14
    case 'text-to-image-dev':
      return 12
    case 'text-to-image-realism':
    case 'text-to-image-anime':
      return 16
    default:
      return 10
  }
}

export function buildContextModels({
  availableModels,
  hasImages,
  isMultiImage,
}: BuildContextModelsOptions): GeneratorModelOption[] {
  if (hasImages) {
    const editingModels: GeneratorModelOption[] = [
      {
        value: 'pro',
        label: '⚡ Kontext [pro] -- Editing',
        description: 'Fast iterative editing, maintains character consistency',
        credits: 16,
        speed: 'Fast (6-10s)',
        quality: 'Good',
        features: ['Character consistency', 'Fast iteration', 'Style preservation'],
        available: availableModels.includes('pro'),
        recommended: true,
      },
      {
        value: 'max',
        label: '🚀 Kontext [max] -- Editing',
        description: 'Maximum performance with improved prompt adherence',
        credits: 32,
        speed: 'Slower (10-15s)',
        quality: 'Excellent',
        features: ['Best quality', 'Enhanced prompt adherence', 'Typography support'],
        available: availableModels.includes('max'),
        recommended: false,
      },
    ]

    if (isMultiImage) {
      editingModels.push({
        value: 'max-multi',
        label: '🔥 Kontext [max] -- Multi-Image Editing (Experimental)',
        description: 'Experimental multi-image editing with character consistency',
        credits: 48,
        speed: 'Slow (15-25s)',
        quality: 'Experimental',
        features: ['Multi-image support', 'Character consistency', 'Experimental'],
        available: availableModels.includes('max'),
        recommended: false,
      })
    }

    return editingModels
  }

  return [
    {
      value: 'pro',
      label: '⚡ Kontext [pro] -- Text to Image',
      description: 'Fast generation with good quality',
      credits: 16,
      speed: 'Fast (6-10s)',
      quality: 'Good',
      features: ['Fast generation', 'Good quality', 'Cost effective'],
      available: availableModels.includes('pro'),
      recommended: true,
    },
    {
      value: 'max',
      label: '🚀 Kontext [max] -- Text to Image',
      description: 'Best quality with enhanced prompt adherence and typography',
      credits: 32,
      speed: 'Slower (10-15s)',
      quality: 'Excellent',
      features: ['Best quality', 'Typography support', 'Enhanced prompt adherence'],
      available: availableModels.includes('max'),
      recommended: false,
    },
    {
      value: 'schnell',
      label: '⚡ Flux Schnell -- Ultra Fast',
      description: 'Ultra-fast generation in 1-4 steps',
      credits: 8,
      speed: 'Ultra Fast (2-4s)',
      quality: 'Basic',
      features: ['Ultra fast', 'Low cost', 'Basic quality'],
      available: true,
      recommended: false,
    },
    {
      value: 'dev',
      label: '🔧 Flux Dev -- Development',
      description: 'Balanced quality and speed for development',
      credits: 12,
      speed: 'Medium (5-8s)',
      quality: 'Good',
      features: ['Balanced performance', 'Development friendly', 'Good quality'],
      available: true,
      recommended: false,
    },
    {
      value: 'realism',
      label: '📸 Flux Realism -- Photorealistic',
      description: 'Photorealistic image generation with LoRA',
      credits: 20,
      speed: 'Medium (8-12s)',
      quality: 'Excellent',
      features: ['Photorealistic', 'LoRA enhanced', 'Natural lighting'],
      available: true,
      recommended: false,
    },
    {
      value: 'anime',
      label: '🎨 Flux Anime -- Anime Style',
      description: 'Anime-style generation with LoRA',
      credits: 20,
      speed: 'Medium (8-12s)',
      quality: 'Excellent',
      features: ['Anime style', 'LoRA enhanced', 'Character design'],
      available: true,
      recommended: false,
    },
  ]
}

export function getRecommendedModelValue(
  models: GeneratorModelOption[]
): GeneratorModelValue {
  const recommended = models.find((model) => model.recommended && model.available)
  return recommended?.value || models.find((model) => model.available)?.value || 'pro'
}
