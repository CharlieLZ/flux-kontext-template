import { fal } from '@fal-ai/client'

let configuredKey: string | null = null
let missingKeyWarned = false

function getFalKey(): string {
  const key = process.env.FAL_KEY?.trim()

  if (!key) {
    if (!missingKeyWarned && process.env.NODE_ENV !== 'test') {
      missingKeyWarned = true
      console.warn('FAL integrations are disabled until FAL_KEY is configured.')
    }

    throw new Error('FAL_KEY environment variable is not configured')
  }

  return key
}

function ensureFalConfigured() {
  const key = getFalKey()

  if (configuredKey === key) {
    return
  }

  fal.config({ credentials: key })
  configuredKey = key
}

type SubscribeOptions = Parameters<typeof fal.subscribe>[1]
type QueueSubmitOptions = Parameters<typeof fal.queue.submit>[1]
type QueueStatusOptions = Parameters<typeof fal.queue.status>[1]
type QueueResultOptions = Parameters<typeof fal.queue.result>[1]

export async function subscribeToFal(
  endpoint: string,
  options: SubscribeOptions
) {
  ensureFalConfigured()
  return fal.subscribe(endpoint, options)
}

export async function uploadToFalStorage(file: File) {
  ensureFalConfigured()
  return fal.storage.upload(file)
}

export async function submitFalQueue(
  endpoint: string,
  options: QueueSubmitOptions
) {
  ensureFalConfigured()
  return fal.queue.submit(endpoint, options)
}

export async function getFalQueueStatus(
  endpoint: string,
  options: QueueStatusOptions
) {
  ensureFalConfigured()
  return fal.queue.status(endpoint, options)
}

export async function getFalQueueResult(
  endpoint: string,
  options: QueueResultOptions
) {
  ensureFalConfigured()
  return fal.queue.result(endpoint, options)
}
