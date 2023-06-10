export interface Storage {
  getItem(key: string): any
  setItem?(key: string, value: any): any
  removeItem?(key: string): any
}

export class MemoryStorage implements Storage {
  store: { [key: string]: any }

  constructor() {
    this.store = {}
  }

  getItem(key: string) {
    return Promise.resolve(this.store[key])
  }

  setItem(key: string, value: any) {
    return Promise.resolve((this.store[key] = value))
  }

  removeItem(key: string) {
    const value = this.store[key]

    delete this.store[key]

    return Promise.resolve(value)
  }
}

export class StorageWrapper implements Storage {
  storage: any

  constructor(storage: any) {
    this.storage = storage
  }

  getItem(key: string) {
    return Promise.resolve(this.storage?.getItem(key))
  }

  setItem(key: string, value: any) {
    return Promise.resolve(this.storage?.setItem(key, value))
  }

  removeItem(key: string) {
    return Promise.resolve(this.storage?.removeItem(key))
  }
}
