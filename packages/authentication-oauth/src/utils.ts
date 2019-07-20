import { RequestHandler } from 'express';
import session from 'express-session';
import { Application } from '@feathersjs/feathers';

export interface OauthSetupSettings {
  authService?: string;
  linkStrategy: string;
  expressSession: RequestHandler;
}

export const getDefaultSettings = (_app: Application, other?: Partial<OauthSetupSettings>) => {
  const defaults: OauthSetupSettings = {
    linkStrategy: 'jwt',
    expressSession: session({
      secret: Math.random().toString(36).substring(7),
      saveUninitialized: true,
      resave: true
    }),
    ...other
  };

  return defaults;
};
