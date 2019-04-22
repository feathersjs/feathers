import { NotAuthenticated } from '@feathersjs/errors';
import { AuthenticationRequest } from './core';
import { Params } from '@feathersjs/feathers';
import { IncomingMessage } from 'http';
import { AuthenticationBaseStrategy } from './strategy';

const SPLIT_HEADER = /(\S+)\s+(\S+)/;

export class JWTStrategy extends AuthenticationBaseStrategy {
  get configuration () {
    const authConfig = this.authentication.configuration;
    const config = super.configuration;

    return {
      ...config,
      entity: authConfig.entity,
      service: authConfig.service,
      header: 'Authorization',
      schemes: [ 'Bearer', 'JWT' ]
    };
  }

  verifyConfiguration () {
    const allowedKeys = [ 'entity', 'service', 'header', 'schemes' ];

    for (const key of Object.keys(this.configuration)) {
      if (!allowedKeys.includes(key)) {
        throw new Error(`Invalid JwtStrategy option 'authentication.${this.name}.${key}'. Did you mean to set it in 'authentication.jwtOptions'?`);
      }
    }
  }

  /**
   * Return the entity for a given id
   * @param id The id to use
   * @param params Service call parameters
   */
  async getEntity (id: string, params: Params) {
    const entityService = this.entityService;

    if (entityService === null) {
      throw new NotAuthenticated(`Could not find entity service`);
    }

    // @ts-ignore
    return entityService.get(id, params);
  }

  async authenticate (authentication: AuthenticationRequest, params: Params) {
    const { accessToken, strategy } = authentication;
    const { entity } = this.configuration;

    if (!accessToken || (strategy && strategy !== this.name)) {
      throw new NotAuthenticated('Not authenticated');
    }

    const payload = await this.authentication.verifyJWT(accessToken, params.jwt);
    const entityId = payload.sub;
    const result = {
      accessToken,
      authentication: {
        strategy: 'jwt',
        payload
      }
    };

    if (entity === null) {
      return result;
    }

    const value = await this.getEntity(entityId, params);

    return {
      ...result,
      [entity]: value
    };
  }

  async parse (req: IncomingMessage) {
    const result = { strategy: this.name };
    const { header, schemes }: { header: any, schemes: string[] } = this.configuration;
    const headerValue = req.headers && req.headers[header.toLowerCase()];

    if (!headerValue || typeof headerValue !== 'string') {
      return null;
    }

    const [ , scheme = null, schemeValue = null ] = headerValue.match(SPLIT_HEADER) || [];
    const hasScheme = scheme && schemes.some(
      current => new RegExp(current, 'i').test(scheme)
    );

    if (scheme && !hasScheme) {
      return null;
    }

    return {
      ...result,
      accessToken: hasScheme ? schemeValue : headerValue
    };
  }
}
