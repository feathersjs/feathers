import { stripSlashes } from '@feathersjs/commons';

export interface LookupData {
  params: { [key: string]: string };
}

export interface LookupResult<T> extends LookupData {
  data?: T;
}

export class RouteNode<T = any> {
  data?: T;
  children: { [key: string]: RouteNode } = {};
  placeholders: RouteNode[] = [];

  constructor (public name: string, public depth: number) {}

  insert (path: string[], data: T): RouteNode<T> {
    if (this.depth === path.length) {
      if (this.data !== undefined) {
        throw new Error(`Path ${path.join('/')} already exists`);
      }

      this.data = data;
      return this;
    }

    const current = path[this.depth];
    const nextDepth = this.depth + 1;

    if (current.startsWith(':')) {
      // Insert a placeholder node like /messages/:id
      const placeholderName = current.substring(1);
      let placeholder = this.placeholders.find(p => p.name === placeholderName);

      if (!placeholder) {
        placeholder = new RouteNode(placeholderName, nextDepth);
        this.placeholders.push(placeholder);
      }

      return placeholder.insert(path, data);
    }

    const child = this.children[current] || new RouteNode(current, nextDepth);

    this.children[current] = child;

    return child.insert(path, data);
  }

  lookup (path: string[], info: LookupData): LookupResult<T>|null {
    if (path.length === this.depth) {
      return this.data === undefined ? null : {
        ...info,
        data: this.data
      }
    }

    const current = path[this.depth];
    const child = this.children[current];

    if (child) {
      return child.lookup(path, info);
    }

    // This will return the first placeholder that matches early
    for(const placeholder of this.placeholders) {
      const result = placeholder.lookup(path, info);

      if (result !== null) {
        result.params[placeholder.name] = current;
        return result;
      }
    }

    return null;
  }
}

export class Router<T = any> {
  constructor (public root: RouteNode<T> = new RouteNode<T>('', 0)) {}

  getPath (path: string) {
    return stripSlashes(path).split('/');
  }

  insert (path: string, data: T) {
    return this.root.insert(this.getPath(path), data);
  }

  lookup (path: string) {
    if (typeof path !== 'string') {
      return null;
    }

    return this.root.lookup(this.getPath(path), { params: {} });
  }
}
