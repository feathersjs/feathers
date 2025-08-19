import { Application, Params } from '../declarations.js'

export interface SseClientOptions {
  path: string
  reconnectionDelay?: number
  reconnectionDelayMax?: number
}

export function sseClient(options: SseClientOptions) {
  return (client: Application) => {
    const { path, reconnectionDelay = 1000, reconnectionDelayMax = 10000 } = options
    const sseService = client.service(path)

    let attempt = 0
    let timeout: number | null = null
    let reconnecting = false

    const reconnect = (params: Params) => {
      if (reconnecting) {
        return
      }

      const delay = Math.min(reconnectionDelay * Math.pow(2, attempt), reconnectionDelayMax)

      reconnecting = true
      timeout = setTimeout(() => {
        attempt++
        connect(params)
      }, delay) as unknown as number
      sseService.emit('reconnecting', {
        delay,
        attempt: attempt + 1,
        timeout: timeout
      })
    }

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
            // Reset reconnection state on successful connection
            attempt = 0
            reconnecting = false

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

          // Only attempt reconnection if not manually aborted
          if ((error as Error).name !== 'AbortError') {
            reconnect(params)
          }
        })
    }

    sseService.on('start', (params: Params = {}) => {
      connect(params)
    })

    sseService.on('disconnected', () => {
      reconnecting = false
      attempt = 0
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
    })
  }
}
