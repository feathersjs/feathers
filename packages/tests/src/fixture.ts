import assert from 'assert'

const clone = (data: any) => JSON.parse(JSON.stringify(data))

const findAllData = [
  {
    id: 0,
    description: 'You have to do something'
  },
  {
    id: 1,
    description: 'You have to do laundry'
  }
]

export class Service {
  events = ['log']

  async find() {
    return findAllData
  }

  async get(name: string, params: any) {
    if (params.query.error) {
      throw new Error(`Something for ${name} went wrong`)
    }

    if (params.query.runtimeError) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      thingThatDoesNotExist() // eslint-disable-line
    }

    return Promise.resolve({
      id: name,
      description: `You have to do ${name}!`
    })
  }

  async create(data: any) {
    const result = Object.assign({}, clone(data), {
      id: 42,
      status: 'created'
    })

    if (Array.isArray(data)) {
      result.many = true
    }

    return result
  }

  async update(id: any, data: any) {
    const result = Object.assign({}, clone(data), {
      id,
      status: 'updated'
    })

    if (id === null) {
      result.many = true
    }

    return result
  }

  async patch(id: any, data: any) {
    const result = Object.assign({}, clone(data), {
      id,
      status: 'patched'
    })

    if (id === null) {
      result.many = true
    }

    return result
  }

  async remove(id: any) {
    return { id }
  }

  async customMethod(data: any, params: any) {
    return {
      data,
      method: 'customMethod',
      provider: params.provider
    }
  }

  async customData(data: any, params: any) {
    return {
      data,
      method: 'customData',
      provider: params.provider
    }
  }

  async customIdData(id: any, data: any, params: any) {
    return {
      id,
      data,
      method: 'customIdData',
      provider: params.provider
    }
  }

  async customId(id: any, params: any) {
    return {
      id,
      method: 'customId',
      provider: params.provider
    }
  }

  async customParams(params: any) {
    return {
      query: params.query,
      method: 'customParams',
      provider: params.provider
    }
  }

  async internalMethod() {
    throw new Error('Should never get here')
  }
}

export const customDefs = [
  { key: 'customData', route: true },
  { key: 'customIdData', id: true, route: true },
  { key: 'customIdData', id: true, route: 'custom', routeMethod: 'POST' },
  { key: 'customIdData', id: true, data: true, route: 'custom-patch', routeMethod: 'PATCH' },
  { key: 'customId', id: true, data: false, route: true },
  { key: 'customParams', id: false, data: false, route: true },
  { key: 'customParams', id: false, data: false, route: 'stats' }
]

export const verify = {
  find(data: any) {
    assert.deepStrictEqual(findAllData, clone(data), 'Data as expected')
  },

  get(id: any, data: any) {
    assert.strictEqual(data.id, id, 'Got id in data')
    assert.strictEqual(data.description, `You have to do ${id}!`, 'Got description')
  },

  create(original: any, current: any) {
    const expected = Object.assign({}, clone(original), {
      id: 42,
      status: 'created'
    })
    assert.deepStrictEqual(expected, clone(current), 'Data ran through .create as expected')
  },

  update(id: any, original: any, current: any) {
    const expected = Object.assign({}, clone(original), {
      id,
      status: 'updated'
    })
    assert.deepStrictEqual(expected, clone(current), 'Data ran through .update as expected')
  },

  patch(id: any, original: any, current: any) {
    const expected = Object.assign({}, clone(original), {
      id,
      status: 'patched'
    })
    assert.deepStrictEqual(expected, clone(current), 'Data ran through .patch as expected')
  },

  remove(id: any, data: any) {
    assert.deepStrictEqual({ id }, clone(data), '.remove called')
  }
}
