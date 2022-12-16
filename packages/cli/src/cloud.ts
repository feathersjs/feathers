import fetch from 'node-fetch'
import { join } from 'path'
import fs from 'fs/promises'

const makeRequest = async (url: string, data: Record<string, any>) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 5 * 60 * 1000,
    body: JSON.stringify(data)
  })
  return response.json()
}

export const cloudLogin = async (_options: any) => {
  const { version } = JSON.parse(await fs.readFile(join(__dirname, '..', 'package.json'), 'utf8'))
  const data = await makeRequest('http://localhost:3030/login', {
    platform: 'node',
    os: process.platform,
    version
  })

  console.log(`Go to http://localhost:3030/login/${data.code} to sign in with GitHub`)

  const login = await makeRequest('http://localhost:3030/authentication', {
    strategy: 'code',
    code: data.code
  })

  console.log(login)
}
