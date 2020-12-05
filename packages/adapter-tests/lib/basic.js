'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const assert_1 = __importDefault(require('assert'));
exports.default = (test, app, _errors, serviceName, idProp) => {
    describe('Basic Functionality', () => {
        let service;
        beforeEach(() => {
            service = app.service(serviceName);
        });
        it('.id', () => {
            assert_1.default.strictEqual(service.id, idProp, 'id property is set to expected name');
        });
        test('.options', () => {
            assert_1.default.ok(service.options, 'Options are available in service.options');
        });
        test('.events', () => {
            assert_1.default.ok(service.events.includes('testing'), 'service.events is set and includes "testing"');
        });
        describe('Raw Methods', () => {
            test('._get', () => {
                assert_1.default.strictEqual(typeof service._get, 'function');
            });
            test('._find', () => {
                assert_1.default.strictEqual(typeof service._find, 'function');
            });
            test('._create', () => {
                assert_1.default.strictEqual(typeof service._create, 'function');
            });
            test('._update', () => {
                assert_1.default.strictEqual(typeof service._update, 'function');
            });
            test('._patch', () => {
                assert_1.default.strictEqual(typeof service._patch, 'function');
            });
            test('._remove', () => {
                assert_1.default.strictEqual(typeof service._remove, 'function');
            });
        });
    });
};
//# sourceMappingURL=basic.js.map