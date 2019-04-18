import querystring from 'querystring';
import { Application } from '@feathersjs/feathers';
import { AuthenticationService, AuthenticationResult } from '@feathersjs/authentication';

export interface OauthSetupSettings {
  path?: string;
  authService?: string;
  linkStrategy?: string;
  getRedirect? (service: AuthenticationService, data: AuthenticationResult|Error): Promise<string>;
}

export const getDefaultSettings = (app: Application, ...other: OauthSetupSettings[]) => {
  const defaults: OauthSetupSettings = {
    path: '/auth',
    authService: app.get('defaultAuthentication'),
    linkStrategy: 'jwt',
    async getRedirect(service: AuthenticationService, data: AuthenticationResult|Error) {
      const { redirect = false } = service.configuration.oauth;

      if (redirect === false) {
        return null;
      }
      
      const authResult: AuthenticationResult = data;
      const query = (authResult.accessToken ? {
        access_token: authResult.accessToken
      } : {
        error: data.message || 'OAuth Authentication not successful'
      });
      const qs = querystring.stringify(query);

      return `${redirect}#${qs}`;
    }
  };

  return Object.assign(defaults, ...other);
};
