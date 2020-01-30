import { RequestHandler } from 'express';
import { Application } from '@feathersjs/feathers';

export interface OauthSetupSettings {
  authService?: string;
  expressSession?: RequestHandler;
  linkStrategy: string;
}

export const getDefaultSettings = (_app: Application, other?: Partial<OauthSetupSettings>) => {
  const defaults: OauthSetupSettings = {
    linkStrategy: 'jwt',
    ...other
  };

  return defaults;
};
