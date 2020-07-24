import { HookContext, Application } from '@feathersjs/feathers';
import Debug from 'debug';
import { defaultOptions, RefreshTokenOptions, RefreshTokenData } from '../core';

const debug = Debug('feathers-refresh-token');

export const loadConfig = (app: Application) => {
  // get default authentication config key
  const defaultAuthKey = app.get('defaultAuthentication');
  // get authentication configs
  const {
    entity: userEntity,
    entityId: userEntityId,
    'refresh-token': config
  } = app.get(defaultAuthKey);

  if (!userEntity || !defaultAuthKey) {
    throw new Error(`Missing default Authentication and user entity config!`);
  }

  debug(`Refresh token config from config file`, config);
  // merge default options and options loaded from config
  const finalOptions: RefreshTokenOptions = {
    ...defaultOptions,
    authService: defaultAuthKey, // authentication service
    userEntityId: userEntityId ? userEntityId : 'id',
    userEntity, // user entity
    ...config
  };

  debug(`Returning final options for refresh token`, finalOptions);
  return finalOptions;
};

// used this hook with authentication service
export const lookupRefreshToken = async (
  hook: HookContext,
  params: Partial<RefreshTokenData>
): Promise<RefreshTokenData | null> => {
  const { app } = hook;
  const { userId, deviceId, isValid, refreshToken } = params;
  const config = loadConfig(app);
  const entityService = app.service(config.service);

  if (!entityService) {
    return null;
  }

  let query: Partial<RefreshTokenData> = {
    userId: `${userId}`,
    isValid: isValid ? isValid : true
  };

  if (refreshToken) {
    query = {
      ...query,
      refreshToken
    };
  }

  if (deviceId) {
    query = {
      ...query,
      deviceId
    };
  }
  const existingToken = await entityService.find({
    query
  });

  debug(`Refresh token lookup result %O`, existingToken);

  if (existingToken.total > 0) {
    const data: RefreshTokenData = existingToken.data[0];
    return data;
  }
  return null;
};

// used this hook with authentication service
export const queryRefreshToken = async (
  app: Application,
  params: Partial<RefreshTokenData>
): Promise<RefreshTokenData | null> => {
  const { userId, deviceId, isValid, refreshToken } = params;
  const config = loadConfig(app);
  const entityService = app.service(config.service);

  if (!entityService) {
    return null;
  }

  let query: Partial<RefreshTokenData> = {
    userId: `${userId}`,
    isValid: isValid ? isValid : true
  };

  if (refreshToken) {
    query = {
      ...query,
      refreshToken
    };
  }

  if (deviceId) {
    query = {
      ...query,
      deviceId
    };
  }
  const existingToken = await entityService.find({
    query
  });

  debug(`Refresh token lookup result %O`, existingToken);

  if (existingToken.total > 0) {
    const data: RefreshTokenData = existingToken.data[0];
    return data;
  }
  return null;
};
