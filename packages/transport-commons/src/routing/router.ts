import { stripSlashes } from '@feathersjs/commons';
import { BadRequest } from '@feathersjs/errors';

export interface LookupData {
  params: { [key: string]: string };
}

export interface LookupResult<T> extends LookupData {
  data?: T;
}

export class RouteNode<T = any> {
  data?: T;
  children: { [key: string]: RouteNode } = {};
  placeholder?: RouteNode;

  constructor (public name: string) {}

  insert (path: string[], data: T): RouteNode<T> {
    if (path.length === 0) {
      this.data = data;
      return this;
    }

    const [ current, ...rest ] = path;

    if (current.startsWith(':')) {
      const { placeholder } = this;
      const name = current.substring(1);

      if (!placeholder) {
        this.placeholder = new RouteNode(name);
      } else if(placeholder.name !== name) {
        throw new BadRequest(`Can not add new placeholder ':${name}' because placeholder ':${placeholder.name}' already exists`);
      }

      return this.placeholder.insert(rest, data);
    }

    this.children[current] = this.children[current] || new RouteNode(current);

    return this.children[current].insert(rest, data);
  }

  lookup (path: string[], info: LookupData): LookupResult<T>|null {
    if (path.length === 0) {
      return {
        ...info,
        data: this.data
      }
    }

    const [ current, ...rest ] = path;
    const child = this.children[current];

    if (child) {
      return child.lookup(rest, info);
    }

    if (this.placeholder) {
      info.params[this.placeholder.name] = current;
      return this.placeholder.lookup(rest, info);
    }

    return null;
  }
}

export class Router<T> {
  root: RouteNode<T> = new RouteNode<T>('');

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
