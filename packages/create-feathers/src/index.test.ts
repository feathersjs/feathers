import { describe, it, afterEach } from 'vitest'
import assert from 'assert'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawn, type ChildProcess } from 'node:child_process'
import { generate, getContext } from './index.js'

const PORT = 30301

async function waitForServer(port: number, retries = 20, interval = 500): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(`http://localhost:${port}`)
    } catch {
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }
  throw new Error(`Server did not start on port ${port}`)
}

function killProcess(proc: ChildProcess) {
  if (!proc.killed) {
    proc.kill()
  }
}

describe('create-feathers', () => {
  let tmpDir: string
  let serverProcess: ChildProcess | undefined

  afterEach(async () => {
    if (serverProcess) {
      killProcess(serverProcess)
      serverProcess = undefined
    }
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true })
    }
  })

  it('generates a Node app that starts without errors', async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'feathers-test-'))

    const ctx = getContext({
      cwd: tmpDir,
      name: 'test-app',
      description: 'A test app',
      platform: 'node' as const,
      packager: 'npm' as const,
      sse: true
    })

    await generate(ctx)

    // Start the server as a child process
    const isWindows = process.platform === 'win32'
    serverProcess = spawn(isWindows ? 'npm.cmd' : 'npm', ['start'], {
      cwd: tmpDir,
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'pipe'
    })

    // Collect stderr for error reporting
    let stderr = ''
    serverProcess.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    // Fail if the process exits before we can connect
    const exitPromise = new Promise<never>((_, reject) => {
      serverProcess!.on('exit', (code) => {
        reject(new Error(`Server exited with code ${code} before responding.\nstderr: ${stderr}`))
      })
    })

    // Wait for the server to respond or fail
    const response = await Promise.race([waitForServer(PORT), exitPromise])

    assert.ok(response.ok || response.status === 404, `Server responded with status ${response.status}`)
  }, 120000)
})
