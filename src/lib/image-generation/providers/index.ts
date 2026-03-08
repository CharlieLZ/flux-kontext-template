import { FalImageGenerationProvider } from '@/lib/image-generation/providers/fal-provider'
import { KieImageGenerationProvider } from '@/lib/image-generation/providers/kie-provider'
import { WaveSpeedImageGenerationProvider } from '@/lib/image-generation/providers/wavespeed-provider'
import {
  FluxKontextProvider,
  ImageGenerationProviderName,
} from '@/lib/image-generation/types'
import { getConfiguredImageProvider } from '@/lib/image-generation/utils'

const providerRegistry: Record<ImageGenerationProviderName, FluxKontextProvider> =
  {
    fal: new FalImageGenerationProvider(),
    kie: new KieImageGenerationProvider(),
    wavespeed: new WaveSpeedImageGenerationProvider(),
  }

export function getImageGenerationProvider(
  providerName: ImageGenerationProviderName = getConfiguredImageProvider()
): FluxKontextProvider {
  return providerRegistry[providerName]
}

export function getImageGenerationProviderName(): ImageGenerationProviderName {
  return getConfiguredImageProvider()
}
