import { Application, Params } from '../declarations.js'

export interface SseClientOptions {
  path: string
  reconnectionDelay?: number
  reconnectionDelayMax?: number
}

export interface ReconnectingEvent {
  delay: number
  attempt: number
  timeout: number | null
}

function getDelay(attempt: number, reconnectionDelay: number, reconnectionDelayMax: number, jitter = 0.3) {
  const baseDelay = Math.min(reconnectionDelay * Math.pow(2, attempt - 1), reconnectionDelayMax)
  const jit = (Math.random() - 0.5) * (jitter * 2)

  return Math.round(baseDelay * (1 + jit))
}

export function sseClient(options: SseClientOptions) {
  return (client: Application) => {
    const { path, reconnectionDelay = 1000, reconnectionDelayMax = 5000 } = options
    const sseService = client.service(path)

    let attempt = 0
    let timeout: number | null = null

    const reconnect = (params: Params) => {
      if (timeout !== null) {
        return
      }

      const delay = getDelay(++attempt, reconnectionDelay, reconnectionDelayMax)

      timeout = setTimeout(() => {
        timeout = null
        connect(params)
      }, delay) as unknown as number
      sseService.emit('reconnecting', {
        delay,
        attempt,
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
            attempt = 0

            for await (const payload of stream) {
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
            if ((error as Error).name !== 'AbortError') {
              throw error
            }
          }
        })
        .catch((error) => {
          abortController.abort()
          sseService.emit('disconnected', error)

          if ((error as Error).name !== 'AbortError') {
            timeout = null
            reconnect(params)
          }
        })
    }

    sseService.on('start', (params: Params = {}) => {
      connect(params)
    })
  }
}
