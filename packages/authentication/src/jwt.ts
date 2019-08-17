import { NotAuthenticated } from '@feathersjs/errors';
import { IncomingMessage } from 'http';
import { omit } from 'lodash';
import Debug from 'debug';
import { Params, HookContext } from '@feathersjs/feathers';

import { AuthenticationBaseStrategy } from './strategy';
import { AuthenticationRequest, AuthenticationResult } from './core';

const debug = Debug('@feathersjs/authentication/jwt');
const SPLIT_HEADER = /(\S+)\s+(\S+)/;

export class JWTStrategy extends AuthenticationBaseStrategy {
  get configuration () {
    const authConfig = this.authentication.configuration;
    const config = super.configuration;

    return {
      entity: authConfig.entity,
      service: authConfig.service,
      header: 'Authorization',
      schemes: [ 'Bearer', 'JWT' ],
      ...config
    };
  }

  async handleConnection (connection: any, context: HookContext) {
    const { result: { accessToken }, method } = context;

    if (accessToken) {
      if (method === 'create') {
        debug('Adding authentication information to connection');
        connection.authentication = {
          strategy: this.name,
          accessToken
        };
      } else if (method === 'remove' && accessToken === connection.authentication.accessToken) {
        debug('Removing authentication information from connection');
        delete connection.authentication;
      }
    }

    return context;
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
    const { entity } = this.configuration;
    const entityService = this.entityService;

    debug('Getting entity', id);

    if (entityService === null) {
      throw new NotAuthenticated(`Could not find entity service`);
    }

    const result = await entityService.get(id, omit(params, 'provider'));

    if (!params.provider) {
      return result;
    }

    return entityService.get(id, { ...params, [entity]: result });
  }

  async getEntityId (authResult: AuthenticationResult, _params: Params) {
    return authResult.authentication.payload.sub;
  }

  async authenticate (authentication: AuthenticationRequest, params: Params) {
    const { accessToken } = authentication;
    const { entity } = this.configuration;

    if (!accessToken) {
      throw new NotAuthenticated('No access token');
    }

    const payload = await this.authentication.verifyAccessToken(accessToken, params.jwt);
    const result = {
      accessToken,
      authentication: {
        strategy: 'jwt',
        payload
      }
    };
    const entityId = await this.getEntityId(result, params);

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

    debug('Found parsed header value');

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
