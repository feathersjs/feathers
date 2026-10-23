import { createPublicKey } from 'crypto'
import jsonwebtoken from 'jsonwebtoken'
import { createDebug } from '@feathersjs/commons'
import { NotAuthenticated } from '@feathersjs/errors'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import request from 'grant/lib/client'

const debug = createDebug('@feathersjs/authentication-oauth/apple')

const MAX_AGE = 60 * 60 * 1000
const MIN_REFRESH = 5 * 60 * 1000
const RETRY_AFTER = 30 * 1000

/**
 * Apple's public keys for `id_token` signatures. They are refreshed after an hour, or at most
 * every few minutes for an unknown key id. A failed refresh keeps the previous keys and is
 * not retried for a few seconds.
 */
export const appleKeys = {
  url: 'https://appleid.apple.com/auth/keys',
  keys: [] as any[],
  fetchedAt: 0,
  failedAt: 0
}

let refreshing: Promise<void> | null = null

async function refreshAppleKeys() {
  try {
    const { body } = await request({ method: 'GET', url: appleKeys.url })

    if (!Array.isArray(body?.keys) || !body.keys.length) {
      throw new Error('No keys in response')
    }

    appleKeys.keys = body.keys
    appleKeys.fetchedAt = Date.now()
  } catch (error: any) {
    debug('Could not refresh Apple keys', error.message)
    appleKeys.failedAt = Date.now()
  }
}

async function getAppleKey(kid: string) {
  const age = Date.now() - appleKeys.fetchedAt
  const findKey = () => appleKeys.keys.find((key) => key.kid === kid)
  const canRetry = Date.now() - appleKeys.failedAt > RETRY_AFTER

  if (canRetry && (age > MAX_AGE || (!findKey() && age > MIN_REFRESH))) {
    refreshing ||= refreshAppleKeys().finally(() => (refreshing = null))
    await refreshing
  }

  return findKey()
}

/**
 * Apple sends the user's name (only on the first sign-in) as a JSON string in the callback body.
 */
function getAppleName(user: any) {
  try {
    return (typeof user === 'string' ? JSON.parse(user) : user)?.name
  } catch {
    return undefined
  }
}

/**
 * Without a `profile_url`, Grant uses the `user` field of the Apple callback body as the
 * profile, which the client controls. Take the identity from the verified `id_token` instead
 * and only keep the name from the callback body.
 *
 * @throws NotAuthenticated if the `id_token` is missing or not valid for `clientId`
 */
export async function getAppleProfile(payload: any, clientId: string) {
  const idToken = payload.id_token || payload.raw?.id_token
  let claims: any

  if (!clientId) {
    throw new NotAuthenticated('Could not get oAuth profile')
  }

  try {
    const { header }: any = jsonwebtoken.decode(idToken, { complete: true })
    const jwk = await getAppleKey(header.kid)

    claims = jsonwebtoken.verify(idToken, createPublicKey({ key: jwk, format: 'jwk' }), {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
      audience: clientId,
      clockTolerance: 60
    })
  } catch {
    throw new NotAuthenticated('Could not get oAuth profile')
  }

  if (typeof claims.sub !== 'string' || claims.sub === '') {
    throw new NotAuthenticated('Could not get oAuth profile')
  }

  const name = getAppleName(payload.profile)

  return {
    sub: claims.sub,
    ...(claims.email ? { email: claims.email } : {}),
    ...(name ? { name } : {})
  }
}
