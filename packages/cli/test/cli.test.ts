import { strict } from 'assert'
import { program } from '../src'

describe('cli tests', () => {
  it('exports the program', async () => {
    strict.ok(program)
  })
})
