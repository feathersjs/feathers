import { strict as assert } from 'assert'
import axios, { AxiosResponse } from 'axios'
import { expressFixture } from './utils/fixture'

describe('@feathersjs/authentication-oauth service', () => {
  const port = 9778
  const req = axios.create({
    withCredentials: true,
    maxRedirects: 0
  })
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

  it('triggers oAuth flow', async () => {
    let location = `http://localhost:${port}/oauth/github`

    const oauthResponse = await fetchErrorResponse(location)
    assert.equal(oauthResponse.status, 303)

    location = oauthResponse.data.location

    const providerResponse = await fetchErrorResponse(location)
    assert.equal(providerResponse.status, 302)

    // location = providerResponse.headers.location

    // const { data } = await req.get(location)

    // console.log(data)
  })
})
