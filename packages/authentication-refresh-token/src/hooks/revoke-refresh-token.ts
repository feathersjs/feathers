import { HookContext } from '@feathersjs/feathers';
import { lookupRefreshToken, loadConfig } from './common';
import Debug from 'debug';

const debug = Debug('feathers-refresh-token');

// After hook with authentication service
// result - authResult which will return to user, contains access token, sub and strategy

/*
 service - refresh token service
 entity - entity name of refresh token service
 options - refresh token JWT options
 userIdField - user ID filed in database, i.e. subject field in JWT, used to look up refresh token
*/

export const issueRefreshToken = () => {
  return async (context: HookContext) => {
    const { app, result } = context;

    debug(`Issue Refresh token with auth result`, result);

    const {
      service,
      entity,
      userEntity,
      userEntityId,
      authService,
      jwtOptions,
      secret
    } = loadConfig(app);

    let userId;
    const user = result[userEntity];
    if (user) {
      userId = user[userEntityId];
    } else if (userEntityId in result) {
      userId = result[userEntityId];
    } else {
      // userIdField must be presented in result
      debug(`User entity ${userEntityId} doesn't exist in auth result`, result);
      return context;
    }

    const entityService = app.service(service);

    const existingToken = await lookupRefreshToken(context, { userId });

    debug(`existing token`, existingToken);

    // if refresh token already exists, simply return
    if (existingToken) {
      Object.assign(result, { [entity]: existingToken.refreshToken });
      return context;
    }

    // Use authentication service to generate the refresh token with user ID
    const refreshToken = await app.service(authService).createAccessToken(
      {
        sub: userId
      },
      jwtOptions, // refresh token options
      secret // refresh token secret, should be different than access token
    );

    // save the refresh token ID
    const token = await entityService.create({
      refreshToken,
      userId,
      isValid: true
    });

    debug(`Token ID and refresh token`, token, refreshToken);

    // return refresh token in result
    Object.assign(result, { [entity]: refreshToken });

    return context;
  };
};
