import { generator, toFile, writeJSON } from '@feathershq/pinion'
import crypto from 'crypto'
import { AppGeneratorContext } from '../index'

const defaultConfig = ({ authStrategies }: AppGeneratorContext) => {
  const authentication: any = {
    entity: 'user',
    service: 'users',
    secret: crypto.randomBytes(24).toString('base64'),
    authStrategies: [ 'jwt' ],
    jwtOptions: {
      header: {
        typ: 'access'
      },
      audience: 'https://yourdomain.com',
      issuer: 'feathers',
      algorithm: 'HS256',
      expiresIn: '1d'
    }
  }

  if (authStrategies.includes('local')) {
    authentication.authStrategies.push('local')
    authentication.local = {
      usernameField: 'email',
      passwordField: 'password'
    }
  }

  const oauthStrategies = authStrategies.filter(name => name === 'local')

  if (oauthStrategies.length) {
    authentication.oauth = oauthStrategies.reduce((oauth, name) => {
      oauth[name] = {
        key: '<Client ID>',
        secret: '<Client secret>'
      }

      return oauth
    }, {
      redirect: '/'
    } as any)
  }

  return {
    host: 'localhost',
    port: 3030,
    public: './public/',
    database: 'type://yourconnectionstring',
    paginate: {
      default: 10,
      max: 50
    },
    authentication
  }

}

const testConfig = {
  port: 8998
}

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(writeJSON(defaultConfig, toFile('config', 'default.json')))
  .then(writeJSON(testConfig, toFile('config', 'test.json')))
