import { stripSlashes } from './commons.js'

export interface LookupData {
  params: { [key: string]: string | string[] }
  data?: any
}

export interface LookupResult<T> extends LookupData {
  data?: T
}

export interface RouterInterface<T = any> {
  /**
   * Look up a route by path and return the matched data and parameters
   */
  lookup(path: string): LookupResult<T> | null

  /**
   * Insert a new route with associated data
   */
  insert(path: string, data: T): void

  /**
   * Remove a route by path
   */
  remove(path: string): void

  /**
   * Whether route matching is case sensitive
   */
  caseSensitive: boolean
}

export class RouteNode<T = any> {
  data?: T
  children: { [key: string]: RouteNode } = Object.create(null) // Optimize object lookup
  placeholders: RouteNode[] = []
  catchAll?: RouteNode<T>

  constructor(
    public name: string,
    public depth: number
  ) {}

  get hasChildren() {
    return (
      Object.keys(this.children).length !== 0 || this.placeholders.length !== 0 || this.catchAll !== undefined
    )
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

    if (current[0] === ':') {
      if (current[1] === ':') {
        // Catch-all route like ::path
        const catchAllName = current.substring(2)

        // Validate catch-all is at the end
        if (this.depth !== path.length - 1) {
          throw new Error(`Catch-all parameter ::${catchAllName} must be at the end of the path`)
        }

        if (this.catchAll) {
          throw new Error(`Path ${path.join('/')} already exists`)
        }

        this.catchAll = new RouteNode(catchAllName, nextDepth)
        this.catchAll.data = data
        return this.catchAll
      } else {
        // Regular placeholder node like /messages/:id
        const placeholderName = current.substring(1)

        // Optimized placeholder search
        let placeholder = null
        const placeholdersLength = this.placeholders.length
        for (let i = 0; i < placeholdersLength; i++) {
          if (this.placeholders[i].name === placeholderName) {
            placeholder = this.placeholders[i]
            break
          }
        }

        if (!placeholder) {
          placeholder = new RouteNode(placeholderName, nextDepth)
          this.placeholders.push(placeholder)
        }

        return placeholder.insert(path, data)
      }
    }

    const child = this.children[current] || new RouteNode(current, nextDepth)

    this.children[current] = child

    return child.insert(path, data)
  }

  remove(path: string[]) {
    if (path.length === this.depth) {
      delete this.data
      return
    }

    const current = path[this.depth]

    if (current[0] === ':') {
      if (current[1] === ':') {
        // Remove catch-all route
        const catchAllName = current.substring(2)
        if (this.catchAll && this.catchAll.name === catchAllName) {
          this.catchAll = undefined
        }
      } else {
        // Regular placeholder removal
        const placeholderName = current.substring(1)

        // Find and remove placeholder efficiently
        const placeholdersLength = this.placeholders.length
        for (let i = 0; i < placeholdersLength; i++) {
          if (this.placeholders[i].name === placeholderName) {
            const placeholder = this.placeholders[i]
            placeholder.remove(path)

            // Only remove from array if node has no children or data
            if (!placeholder.hasChildren && placeholder.data === undefined) {
              this.placeholders.splice(i, 1)
            }
            break
          }
        }
      }
    } else if (this.children[current]) {
      const child = this.children[current]

      child.remove(path)

      if (!child.hasChildren && child.data === undefined) {
        delete this.children[current]
      }
    }
  }

  lookup(path: string[], info: LookupData): LookupResult<T> | null {
    // Early exit optimization - check for exact match at current depth
    if (this.depth === path.length) {
      if (this.data !== undefined) {
        info.data = this.data
        return info as LookupResult<T>
      }

      // Check for catch-all at this level (handles empty catch-all)
      if (this.catchAll) {
        info.data = this.catchAll.data
        info.params[this.catchAll.name] = []
        return info as LookupResult<T>
      }

      return null
    }

    const current = path[this.depth]

    // Try exact child match first (most common case)
    const child = this.children[current]
    if (child) {
      const result = child.lookup(path, info)
      if (result !== null) {
        return result
      }
    }

    // Only check placeholders if exact match failed
    const placeholdersLength = this.placeholders.length
    for (let i = 0; i < placeholdersLength; i++) {
      const placeholder = this.placeholders[i]
      const result = placeholder.lookup(path, info)
      if (result !== null) {
        result.params[placeholder.name] = current
        return result
      }
    }

    // Check catch-all as final fallback
    if (this.catchAll) {
      const remaining = path.slice(this.depth)
      info.data = this.catchAll.data
      info.params[this.catchAll.name] = remaining
      return info as LookupResult<T>
    }

    return null
  }
}

export class Router<T = any> implements RouterInterface<T> {
  public caseSensitive = true
  private pathCache: { [key: string]: string[] } = Object.create(null) // Cache for parsed paths

  constructor(public root: RouteNode<T> = new RouteNode<T>('', 0)) {}

  getPath(path: string) {
    // Check cache first
    if (this.pathCache[path]) {
      return this.pathCache[path]
    }

    // Fast path for root
    if (!path || path === '/') {
      const result = ['']
      this.pathCache[path] = result
      return result
    }

    // Fast path: split directly if no leading/trailing slashes
    let parts: string[]
    if (path[0] !== '/' && path[path.length - 1] !== '/') {
      parts = path.split('/')
    } else {
      const stripped = stripSlashes(path)
      if (!stripped) {
        const result = ['']
        this.pathCache[path] = result
        return result
      }
      parts = stripped.split('/')
    }

    // Apply case sensitivity if needed
    if (!this.caseSensitive) {
      for (let i = 0; i < parts.length; i++) {
        if (parts[i][0] !== ':') {
          // Optimized check
          parts[i] = parts[i].toLowerCase()
        }
      }
    }

    // Cache result
    this.pathCache[path] = parts
    return parts
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

    // Use Object.create(null) to avoid prototype overhead
    const info = { params: Object.create(null) }
    return this.root.lookup(this.getPath(path), info)
  }
}
