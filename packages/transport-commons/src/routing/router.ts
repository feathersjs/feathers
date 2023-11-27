import { stripSlashes } from '@feathersjs/commons'

export interface LookupData {
  params: { [key: string]: string }
}

export interface LookupResult<T> extends LookupData {
  data?: T
}

export class RouteNode<T = any> {
  data?: T
  children: { [key: string]: RouteNode } = {}
  placeholders: RouteNode[] = []

  constructor(
    public name: string,
    public depth: number
  ) {}

  get hasChildren() {
    return Object.keys(this.children).length !== 0 || this.placeholders.length !== 0
  }

  insert(path: string[], data: T): RouteNode<T> {
    if (this.depth === path.length) {
      if (this.data !== undefined) {
        throw new Error(`Path ${path.join('/')} already exists`)
      }

      this.data = data
      return this
    }

    const current = path[this.depth]
    const nextDepth = this.depth + 1

    if (current.startsWith(':')) {
      // Insert a placeholder node like /messages/:id
      const placeholderName = current.substring(1)
      let placeholder = this.placeholders.find((p) => p.name === placeholderName)

      if (!placeholder) {
        placeholder = new RouteNode(placeholderName, nextDepth)
        this.placeholders.push(placeholder)
      }

      return placeholder.insert(path, data)
    }

    const child = this.children[current] || new RouteNode(current, nextDepth)

    this.children[current] = child

    return child.insert(path, data)
  }

  remove(path: string[]) {
    if (path.length === this.depth) {
      return
    }

    const current = path[this.depth]

    if (current.startsWith(':')) {
      const placeholderName = current.substring(1)
      const placeholder = this.placeholders.find((p) => p.name === placeholderName)

      placeholder.remove(path)
      this.placeholders = this.placeholders.filter((p) => p !== placeholder)
    } else if (this.children[current]) {
      const child = this.children[current]

      child.remove(path)

      if (!child.hasChildren) {
        delete this.children[current]
      }
    }
  }

  lookup(path: string[], info: LookupData): LookupResult<T> | null {
    if (path.length === this.depth) {
      return this.data === undefined
        ? null
        : {
            ...info,
            data: this.data
          }
    }

    const current = path[this.depth]
    const child = this.children[current]

    if (child) {
      const lookup = child.lookup(path, info)

      if (lookup !== null) {
        return lookup
      }
    }

    // This will return the first placeholder that matches early
    for (const placeholder of this.placeholders) {
      const result = placeholder.lookup(path, info)

      if (result !== null) {
        result.params[placeholder.name] = current
        return result
      }
    }

    return null
  }
}

export class Router<T = any> {
  public caseSensitive = true

  constructor(public root: RouteNode<T> = new RouteNode<T>('', 0)) {}

  getPath(path: string) {
    const result = stripSlashes(path).split('/')

    if (!this.caseSensitive) {
      return result.map((p) => (p.startsWith(':') ? p : p.toLowerCase()))
    }

    return result
  }

  insert(path: string, data: T) {
    return this.root.insert(this.getPath(path), data)
  }

  remove(path: string) {
    return this.root.remove(this.getPath(path))
  }

  lookup(path: string) {
    if (typeof path !== 'string') {
      return null
    }

    return this.root.lookup(this.getPath(path), { params: {} })
  }
}
