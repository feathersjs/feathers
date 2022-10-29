import { strict as assert } from 'assert'
import axios, { AxiosResponse } from 'axios'
import { CookieJar } from 'tough-cookie'
import { expressFixture } from './utils/fixture'

describe('@feathersjs/authentication-oauth service', () => {
  const port = 9778
  const req = axios.create({
    withCredentials: true,
    maxRedirects: 0
  })
  const cookie = new CookieJar()
  let app: Awaited<ReturnType<typeof expressFixture>>

  const fetchErrorResponse = async (url: string): Promise<AxiosResponse> => {
    try {
      await req.get(url)
    } catch (error: any) {
      return error.response
    }
    assert.fail('Should never get here')
  }

  before(async () => {
    app = await expressFixture(port, 5115)
  })

  after(async () => {
    await app.teardown()
  })

  it('runs through the oAuth flow', async () => {
    const host = `http://localhost:${port}`
    let location = `${host}/oauth/github`

    const oauthResponse = await fetchErrorResponse(location)
    assert.equal(oauthResponse.status, 303)

    oauthResponse.headers['set-cookie']?.forEach((value) => cookie.setCookie(value, host))

    location = oauthResponse.data.location

    const providerResponse = await fetchErrorResponse(location)
    assert.equal(providerResponse.status, 302)

    location = providerResponse.headers.location

    const { data } = await req.get(location, {
      headers: {
        cookie: await cookie.getCookieString(host)
      }
    })

    assert.ok(data.accessToken)
    assert.equal(data.authentication.strategy, 'github')
  })
})
