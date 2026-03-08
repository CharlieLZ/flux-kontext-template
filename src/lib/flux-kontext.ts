import {
  getImageGenerationProvider,
  getImageGenerationProviderName,
} from '@/lib/image-generation/providers'
import {
  FluxKontextAction,
  FluxKontextGenerationRequest,
  FluxKontextImage,
  FluxKontextImageEditInput,
  FluxKontextMultiImageInput,
  FluxKontextResult,
  FluxKontextTextToImageInput,
  ImageGenerationProviderName,
} from '@/lib/image-generation/types'
import { r2Storage } from '@/lib/services/r2-storage'

export type {
  FluxKontextAction,
  FluxKontextAspectRatio,
  FluxKontextBaseInput,
  FluxKontextGenerationRequest,
  FluxKontextImage,
  FluxKontextImageEditInput,
  FluxKontextMultiImageInput,
  FluxKontextOutputFormat,
  FluxKontextResult,
  FluxKontextSafetyTolerance,
  FluxKontextTaskHandle,
  FluxKontextTaskResult,
  FluxKontextTaskState,
  FluxKontextTextToImageInput,
  ImageGenerationProviderName,
} from '@/lib/image-generation/types'

export class FluxKontextService {
  static getProviderName(): ImageGenerationProviderName {
    return getImageGenerationProviderName()
  }

  static async generateAction(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest
  ): Promise<FluxKontextResult> {
    const provider = getImageGenerationProvider()
    const result = await provider.generate(action, input)

    return {
      ...result,
      provider: provider.name,
    }
  }

  static async editImagePro(
    input: FluxKontextImageEditInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('edit-image-pro', input)
  }

  static async editImageMax(
    input: FluxKontextImageEditInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('edit-image-max', input)
  }

  static async editMultiImagePro(
    input: FluxKontextMultiImageInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('edit-multi-image-pro', input)
  }

  static async editMultiImageMax(
    input: FluxKontextMultiImageInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('edit-multi-image-max', input)
  }

  static async textToImagePro(
    input: FluxKontextTextToImageInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('text-to-image-pro', input)
  }

  static async textToImageMax(
    input: FluxKontextTextToImageInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('text-to-image-max', input)
  }

  static async textToImageSchnell(
    input: FluxKontextTextToImageInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('text-to-image-schnell', input)
  }

  static async textToImageDev(
    input: FluxKontextTextToImageInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('text-to-image-dev', input)
  }

  static async textToImageRealism(
    input: FluxKontextTextToImageInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('text-to-image-realism', input)
  }

  static async textToImageAnime(
    input: FluxKontextTextToImageInput
  ): Promise<FluxKontextResult> {
    return this.generateAction('text-to-image-anime', input)
  }

  static async uploadFile(file: File): Promise<string> {
    const provider = getImageGenerationProvider()
    let providerUrl: string | null = null
    let r2Url: string | null = null

    if (provider.uploadFile) {
      try {
        providerUrl = await provider.uploadFile(file)
      } catch (error) {
        console.warn(
          `[${provider.name}] provider upload failed, falling back to R2 when available:`,
          error
        )
      }
    }

    if (isR2Enabled()) {
      try {
        r2Url = await r2Storage.uploadFile(file)
      } catch (error) {
        console.warn('R2 upload failed during provider fallback:', error)
      }
    }

    if (providerUrl) {
      return providerUrl
    }

    if (r2Url) {
      return r2Url
    }

    throw new Error(
      `No upload backend is available for provider "${provider.name}". Configure provider credentials or R2 storage.`
    )
  }

  static async saveGeneratedImageToR2(
    imageUrl: string,
    prompt: string
  ): Promise<string> {
    if (!isR2Enabled()) {
      return imageUrl
    }

    try {
      return await r2Storage.uploadFromUrl(imageUrl, prompt)
    } catch (error) {
      console.error('Failed to save generated image to R2:', error)
      return imageUrl
    }
  }

  static async submitToQueue(
    action: FluxKontextAction,
    input: FluxKontextGenerationRequest
  ): Promise<{ request_id: string }> {
    const provider = getImageGenerationProvider()

    if (!provider.submitTask) {
      throw new Error(`${provider.name} does not support async task submission`)
    }

    const webhookUrl = buildProviderWebhookUrl(provider.name)
    const handle = await provider.submitTask(action, input, { webhookUrl })

    return { request_id: handle.taskId }
  }

  static async checkQueueStatus(
    action: FluxKontextAction,
    requestId: string
  ) {
    const provider = getImageGenerationProvider()

    if (!provider.getTaskResult) {
      throw new Error(`${provider.name} does not support async task polling`)
    }

    return provider.getTaskResult(action, requestId)
  }

  static async getQueueResult(
    action: FluxKontextAction,
    requestId: string
  ): Promise<FluxKontextResult> {
    const task = await this.checkQueueStatus(action, requestId)

    if (task.state !== 'completed' || !task.result) {
      throw new Error(
        task.error ||
          `Task ${requestId} is still ${task.state} for provider ${task.provider}`
      )
    }

    return task.result
  }

  static async verifyWebhook(
    providerName: ImageGenerationProviderName,
    rawBody: string,
    headers: Headers | Record<string, string | undefined>
  ) {
    const provider = getImageGenerationProvider(providerName)

    if (!provider.verifyWebhook) {
      return false
    }

    return provider.verifyWebhook(rawBody, headers)
  }
}

function buildProviderWebhookUrl(providerName: ImageGenerationProviderName) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!siteUrl) {
    return undefined
  }

  return `${siteUrl}/api/webhooks/${providerName}`
}

function isR2Enabled() {
  return Boolean(
    process.env.NEXT_PUBLIC_ENABLE_R2 === 'true' &&
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  )
}

export function getBestImageUrl(image: FluxKontextImage) {
  return (
    (image.r2_url as string | undefined) ||
    (image.fal_url as string | undefined) ||
    image.url
  )
}
