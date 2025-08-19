import { CombinedChannel } from '../channel/combined.js'
import { Application, HookContext, Params } from '../declarations.js'

export type SsePayload = {
  event: string
  data: unknown
  path?: string
}

export class SseService {
  app?: Application
  path?: string

  async find(connection: Params) {
    const eventBuffer: SsePayload[] = []
    const { app, path } = this

    if (!app || !path) {
      throw new Error('Can not initialize SSE. Did you call app.setup()?')
    }

    let isActive = true
    let pendingResolve: (() => void) | null = null

    const publishHandler = (event: string, channel: CombinedChannel, hook: HookContext, data: unknown) => {
      if (isActive && channel.connections.includes(connection)) {
        const eventData = channel.dataFor ? (channel.dataFor(connection) ?? data) : data
        eventBuffer.push({
          event,
          data: eventData,
          path: hook.path
        })

        // Immediately wake up the generator if it's waiting
        if (pendingResolve) {
          pendingResolve()
          pendingResolve = null
        }
      }
    }

    app.emit('connection', connection)
    app.addListener('publish', publishHandler)

    const stream = async function* () {
      try {
        yield {
          event: 'connected',
          data: connection.query || {},
          path
        }

        while (isActive) {
          // Yield all buffered events immediately
          while (eventBuffer.length > 0) {
            yield eventBuffer.shift()!
          }

          // Wait for next event(s) to arrive
          await new Promise<void>((resolve) => {
            pendingResolve = resolve
          })
        }
      } finally {
        isActive = false
        app.removeListener('publish', publishHandler)
      }
    }

    return stream()
  }

  async setup(app: Application, path: string) {
    this.app = app
    this.path = path
  }
}
