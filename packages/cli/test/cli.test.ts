import { strict } from 'assert'
import { program } from '../src/index.js'

describe('cli tests', () => {
  it('exports the program', async () => {
    strict.ok(program)
  })
})
