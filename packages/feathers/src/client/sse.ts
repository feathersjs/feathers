import { Application, Params } from '../declarations'
import type { SseService } from '../http'

export async function sse(client: Application, path: string, params: Params = {}) {
  const abortController = new AbortController()
  const sseService = client.service(path) as unknown as SseService
  const stream = await sseService.find({
    ...params,
    connection: {
      ...params.connection,
      signal: abortController.signal
    }
  })
  const handleStream = async () => {
    try {
      for await (const payload of stream) {
        // Check if aborted before processing each payload
        if (abortController.signal.aborted) {
          break
        }

        try {
          const service = client.service(payload.path)
          service.emit(payload.event, payload.data)
        } catch (error) {
          console.error(error)
        }
      }
    } catch (error: unknown) {
      // Handle abort errors gracefully
      if ((error as Error).name !== 'AbortError') {
        console.error(error)
      }
    }
  }

  // Start processing the stream in the background without awaiting
  handleStream()

  return abortController
}
