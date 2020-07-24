import defaultOptions from './options';

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

export type RefreshTokenOptions = typeof defaultOptions;
