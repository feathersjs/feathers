import { FromSchema, authenticationSettingsSchema } from '@feathersjs/schema'

export const defaultOptions = {
  authStrategies: [] as string[],
  jwtOptions: {
    header: { typ: 'access' }, // by default is an access token but can be any type
    audience: 'https://yourdomain.com', // The resource server where the token is processed
    issuer: 'feathers', // The issuing server, application or resource
    algorithm: 'HS256',
    expiresIn: '1d'
  }
}

export { authenticationSettingsSchema }

export type AuthenticationConfiguration = FromSchema<typeof authenticationSettingsSchema>
