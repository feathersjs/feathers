import { NotAuthenticated, BadRequest } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';
import { lookupRefreshToken, loadConfig } from './common';
import Debug from 'debug';

const debug = Debug('@feathers-refresh-token');

export const logoutUser = () => {
  return async (context: HookContext) => {
    const { app, params } = context;

    const { service, entity, entityId, userEntityId } = loadConfig(app);

    const { query } = params;

    debug('Logout hook id and params', params);
    if (!query) {
      throw new Error(`Invalid query strings!`);
    }

    if (!query[entity] || !query[userEntityId])
      throw new BadRequest(`Bad request`);

    const existingToken = await lookupRefreshToken(context, {
      userId: query[userEntityId],
      refreshToken: query[entity]
    });

    debug('Find existing refresh token result', existingToken);
    if (existingToken) {
      const tokenId = existingToken[entityId];

      if (!tokenId) {
        throw new Error('Invalid refresh token!');
      }
      debug('Deleting token id', tokenId);

      const result = await app.service(service).remove(tokenId);
      debug('Delete result', result);
      return context;
    }
    throw new NotAuthenticated();
  };
};
