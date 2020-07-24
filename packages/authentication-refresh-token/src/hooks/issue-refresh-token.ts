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
      entity: refreshTokenEntity,
      entityId: refreshTokenEntityId,
      service: refreshTokenEntityService,
      userEntity,
      userEntityId,
      authService,
      secret,
      jwtOptions
    } = loadConfig(app);

    let userId;
    const user = result[userEntity];
    if (user) {
      userId = user[userEntityId];
    } else {
      // userEntityId must be presented in result
      debug(`${userEntityId} doesn't exist in auth result`, result);
      return context;
    }

    const entityService = app.service(refreshTokenEntityService);

    const existingToken = await lookupRefreshToken(context, { userId });

    debug(`existing token`, existingToken);

    // if refresh token already exists, simply return
    if (existingToken) {
      Object.assign(result, {
        [refreshTokenEntity]: existingToken[refreshTokenEntityId]
      });
      return context;
    }

    // Use authentication service to generate the refresh token with user ID
    const refreshToken = await app.service(authService).createAccessToken(
      {
        sub: userId // refresh token subject is the user ID
      },
      jwtOptions, // refresh token options
      secret // refresh token secret, should be different than access token
    );

    // save the refresh token
    const token = await entityService.create({
      refreshToken, // could be hashed like password prior saving to DB to make it more secure
      userId,
      isValid: true
    });

    debug(`Token ID and refresh token`, token, refreshToken);

    // return refresh token in result
    Object.assign(result, { [refreshTokenEntity]: refreshToken });

    return context;
  };
};
