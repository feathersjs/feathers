// Feathers Authentication Service Options
interface AuthOptions {
  authService: string; // authentication service name
  userEntity: string; // user Entity in authentication config
  userEntityId: string; // user Entity Id
  entityId: IdField;
}

type IdField = 'id' | '_id';

type DBIdField = {
  [K in IdField]: string;
};

export const defaultOptions = {
  service: 'refresh-tokens', // refresh-token service name
  entity: 'refreshToken', // refresh-token entity
  entityId: 'id', // refresh-token entity Id
  secret: 'supersecret', // secret for Refresh token
  jwtOptions: {
    header: {
      typ: 'refresh'
    },
    audience: 'https://example.com',
    issuer: 'example',
    algorithm: 'HS256',
    expiresIn: '360d'
  }
};

export type RefreshTokenData = {
  id: string; // id filed for refresh token
  _id: string;
  userId: string; // user Id
  refreshToken: string; // refresh token
  isValid: boolean; // refresh token is valid or not
  deviceId: string; // user login device Id, provied by client
  location: string; // user login location, provided by client
  loginTime: string; // user login timeStamp
};

export type RefreshTokenOptions = typeof defaultOptions &
  AuthOptions &
  DBIdField;
