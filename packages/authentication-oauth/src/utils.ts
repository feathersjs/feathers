import { RequestHandler } from 'express';
import { Application } from '@feathersjs/feathers';

export interface OauthSetupSettings {
  authService?: string;
  expressSession?: RequestHandler;
  serviceParamsCallback: (req: object) => object,
  linkStrategy: string;
}

export const getDefaultSettings = (_app: Application, other?: Partial<OauthSetupSettings>) => {
  const defaults: OauthSetupSettings = {
    linkStrategy: 'jwt',
    serviceParamsCallback: () => ({}),
    ...other
  };

  return defaults;
};
