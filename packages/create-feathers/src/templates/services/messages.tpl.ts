import { renderTemplate, toFile } from '@featherscloud/pinion'
import { AppGeneratorContext } from '../../commons'

const template = ({}: AppGeneratorContext) => /* ts */ `import type { Params } from 'feathers'
import { hooks } from 'feathers/hooks'

import { authenticate } from '../hooks/authenticate.js'

export type Message = {
  text: string
  completed: boolean
}

// An example messages Feathers service
@hooks([
  authenticate
])
export class MessageService {
  async find(params: Params) {
    return [{
      text: 'Create Feathers app',
      completed: true
    }, {
      text: 'Implement service methods',
      completed: false
    }]
  }

  async get(id: string, params: Params) {
    throw new Error('.get not implemented')
  }

  async create(data: Message, params: Params) {
    throw new Error('.create not implemented')
  }

  async update(id: string, data: Message, params: Params) {
    throw new Error('.update not implemented')
  }

  async patch(id: string, data: Message, params: Params) {
    throw new Error('.patch not implemented')
  }

  async remove(id: string, params: Params) {
    throw new Error('.remove not implemented')
  }
}
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(template, toFile('src', 'services', 'messages.ts')))
