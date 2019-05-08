import { RequestHandler } from 'express';
import session from 'express-session';
import { Application } from '@feathersjs/feathers';

export interface OauthSetupSettings {
  path: string;
  authService: string;
  linkStrategy: string;
  expressSession: RequestHandler;
}

export const getDefaultSettings = (app: Application, other?: Partial<OauthSetupSettings>) => {
  const defaults: OauthSetupSettings = {
    path: '/auth',
    authService: app.get('defaultAuthentication'),
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
