import { Application, HookContext, Params } from '../declarations'
import { CombinedChannel } from '../channels/channel/combined'

export type SseEventEntry = {
  event: string
  data: unknown
  path?: string
}

export class SseService {
  app?: Application

  async find(connection: Params) {
    const eventBuffer: SseEventEntry[] = []
    const app = this.app

    if (!app) {
      throw new Error('Can not initialize SSE. Did you call app.listen() or app.setup()?')
    }

    let isActive = true
    let pendingResolve: (() => void) | null = null

    const publishHandler = (event: string, channel: CombinedChannel, hook: HookContext, data: unknown) => {
      if (!isActive) return

      if (channel.connections.includes(connection)) {
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

  async setup(app: Application) {
    this.app = app
  }
}
