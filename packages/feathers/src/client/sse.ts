import { Application, Params } from '../declarations.js'

export interface SseClientOptions {
  path: string
  reconnectionDelay?: number
  reconnectionDelayMax?: number
}

export function sseClient(options: SseClientOptions) {
  return (client: Application) => {
    const sseService = client.service(options.path)
    const connect = (params: Params) => {
      const abortController = new AbortController()
      const sseParams = {
        ...params,
        connection: {
          ...params.connection,
          signal: abortController.signal
        }
      }

      // Do not await the request since the promise won't resolve until an event happens
      sseService
        .find(sseParams)
        .then(async (stream) => {
          try {
            for await (const payload of stream) {
              // Check if aborted before processing each payload
              if (abortController.signal.aborted) {
                break
              }

              try {
                if (payload.path === options.path && payload.event === 'connected') {
                  sseService.emit('connected', abortController)
                } else {
                  client.service(payload.path).emit(payload.event, payload.data)
                }
              } catch (error) {
                console.error(error)
              }
            }
          } catch (error: unknown) {
            // Handle abort errors gracefully
            if ((error as Error).name !== 'AbortError') {
              throw error
            }
          }
        })
        .catch((error) => {
          abortController.abort()
          sseService.emit('disconnected', error)
        })
    }

    sseService.on('start', (params: Params = {}) => {
      connect(params)
    })
  }
}
