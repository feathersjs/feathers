import assert from 'assert'
import { AdapterBasicTest } from './declarations'

export default (test: AdapterBasicTest, app: any, _errors: any, serviceName: string, idProp: string) => {
  describe('Basic Functionality', () => {
    let service: any

    beforeEach(() => {
      service = app.service(serviceName)
    })

    it('.id', () => {
      assert.strictEqual(service.id, idProp, 'id property is set to expected name')
    })

    test('.options', () => {
      assert.ok(service.options, 'Options are available in service.options')
    })

    test('.events', () => {
      assert.ok(service.events.includes('testing'), 'service.events is set and includes "testing"')
    })

    describe('Raw Methods', () => {
      test('._get', () => {
        assert.strictEqual(typeof service._get, 'function')
      })

      test('._find', () => {
        assert.strictEqual(typeof service._find, 'function')
      })

      test('._create', () => {
        assert.strictEqual(typeof service._create, 'function')
      })

      test('._update', () => {
        assert.strictEqual(typeof service._update, 'function')
      })

      test('._patch', () => {
        assert.strictEqual(typeof service._patch, 'function')
      })

      test('._remove', () => {
        assert.strictEqual(typeof service._remove, 'function')
      })
    })
  })
}
