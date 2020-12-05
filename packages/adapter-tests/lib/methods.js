'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt (value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled (value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected (value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step (result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const assert_1 = __importDefault(require('assert'));
exports.default = (test, app, _errors, serviceName, idProp) => {
    describe(' Methods', () => {
        let doug;
        let service;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            service = app.service(serviceName);
            doug = yield app.service(serviceName).create({
                name: 'Doug',
                age: 32
            });
        }));
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield app.service(serviceName).remove(doug[idProp]);
            }
            catch (error) { }
        }));
        describe('get', () => {
            test('.get', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.get(doug[idProp]);
                assert_1.default.strictEqual(data[idProp].toString(), doug[idProp].toString(), `${idProp} id matches`);
                assert_1.default.strictEqual(data.name, 'Doug', 'data.name matches');
                assert_1.default.strictEqual(data.age, 32, 'data.age matches');
            }));
            test('.get + $select', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.get(doug[idProp], {
                    query: { $select: ['name'] }
                });
                assert_1.default.strictEqual(data[idProp].toString(), doug[idProp].toString(), `${idProp} id property matches`);
                assert_1.default.strictEqual(data.name, 'Doug', 'data.name matches');
                assert_1.default.ok(!data.age, 'data.age is falsy');
            }));
            test('.get + id + query', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.get(doug[idProp], {
                        query: { name: 'Tester' }
                    });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Got a NotFound Feathers error');
                }
            }));
            test('.get + NotFound', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.get('568225fbfe21222432e836ff');
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Error is a NotFound Feathers error');
                }
            }));
            test('.get + id + query id', () => __awaiter(void 0, void 0, void 0, function* () {
                const alice = yield service.create({
                    name: 'Alice',
                    age: 12
                });
                try {
                    yield service.get(doug[idProp], {
                        query: { [idProp]: alice[idProp] }
                    });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Got a NotFound Feathers error');
                }
                yield service.remove(alice[idProp]);
            }));
        });
        describe('find', () => {
            test('.find', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find();
                assert_1.default.ok(Array.isArray(data), 'Data is an array');
                assert_1.default.strictEqual(data.length, 1, 'Got one entry');
            }));
        });
        describe('remove', () => {
            test('.remove', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.remove(doug[idProp]);
                assert_1.default.strictEqual(data.name, 'Doug', 'data.name matches');
            }));
            test('.remove + $select', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.remove(doug[idProp], {
                    query: { $select: ['name'] }
                });
                assert_1.default.strictEqual(data.name, 'Doug', 'data.name matches');
                assert_1.default.ok(!data.age, 'data.age is falsy');
            }));
            test('.remove + id + query', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.remove(doug[idProp], {
                        query: { name: 'Tester' }
                    });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Got a NotFound Feathers error');
                }
            }));
            test('.remove + multi', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.remove(null);
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'MethodNotAllowed', 'Removing multiple without option set throws MethodNotAllowed');
                }
                service.options.multi = ['remove'];
                yield service.create({ name: 'Dave', age: 29, created: true });
                yield service.create({
                    name: 'David',
                    age: 3,
                    created: true
                });
                const data = yield service.remove(null, {
                    query: { created: true }
                });
                assert_1.default.strictEqual(data.length, 2);
                const names = data.map((person) => person.name);
                assert_1.default.ok(names.includes('Dave'), 'Dave removed');
                assert_1.default.ok(names.includes('David'), 'David removed');
            }));
            test('.remove + id + query id', () => __awaiter(void 0, void 0, void 0, function* () {
                const alice = yield service.create({
                    name: 'Alice',
                    age: 12
                });
                try {
                    yield service.remove(doug[idProp], {
                        query: { [idProp]: alice[idProp] }
                    });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Got a NotFound Feathers error');
                }
                yield service.remove(alice[idProp]);
            }));
        });
        describe('update', () => {
            test('.update', () => __awaiter(void 0, void 0, void 0, function* () {
                const originalData = { [idProp]: doug[idProp], name: 'Dougler' };
                const originalCopy = Object.assign({}, originalData);
                const data = yield service.update(doug[idProp], originalData);
                assert_1.default.deepStrictEqual(originalData, originalCopy, 'data was not modified');
                assert_1.default.strictEqual(data[idProp].toString(), doug[idProp].toString(), `${idProp} id matches`);
                assert_1.default.strictEqual(data.name, 'Dougler', 'data.name matches');
                assert_1.default.ok(!data.age, 'data.age is falsy');
            }));
            test('.update + $select', () => __awaiter(void 0, void 0, void 0, function* () {
                const originalData = {
                    [idProp]: doug[idProp],
                    name: 'Dougler',
                    age: 10
                };
                const data = yield service.update(doug[idProp], originalData, {
                    query: { $select: ['name'] }
                });
                assert_1.default.strictEqual(data.name, 'Dougler', 'data.name matches');
                assert_1.default.ok(!data.age, 'data.age is falsy');
            }));
            test('.update + id + query', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.update(doug[idProp], {
                        name: 'Dougler'
                    }, {
                        query: { name: 'Tester' }
                    });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Got a NotFound Feathers error');
                }
            }));
            test('.update + NotFound', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.update('568225fbfe21222432e836ff', { name: 'NotFound' });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Error is a NotFound Feathers error');
                }
            }));
            test('.update + query + NotFound', () => __awaiter(void 0, void 0, void 0, function* () {
                const dave = yield service.create({ name: 'Dave' });
                try {
                    yield service.update(dave[idProp], { name: 'UpdatedDave' }, { query: { name: 'NotDave' } });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Error is a NotFound Feathers error');
                }
                yield service.remove(dave[idProp]);
            }));
            test('.update + id + query id', () => __awaiter(void 0, void 0, void 0, function* () {
                const alice = yield service.create({
                    name: 'Alice',
                    age: 12
                });
                try {
                    yield service.update(doug[idProp], {
                        name: 'Dougler',
                        age: 33
                    }, {
                        query: { [idProp]: alice[idProp] }
                    });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Got a NotFound Feathers error');
                }
                yield service.remove(alice[idProp]);
            }));
        });
        describe('patch', () => {
            test('.patch', () => __awaiter(void 0, void 0, void 0, function* () {
                const originalData = { [idProp]: doug[idProp], name: 'PatchDoug' };
                const originalCopy = Object.assign({}, originalData);
                const data = yield service.patch(doug[idProp], originalData);
                assert_1.default.deepStrictEqual(originalData, originalCopy, 'original data was not modified');
                assert_1.default.strictEqual(data[idProp].toString(), doug[idProp].toString(), `${idProp} id matches`);
                assert_1.default.strictEqual(data.name, 'PatchDoug', 'data.name matches');
                assert_1.default.strictEqual(data.age, 32, 'data.age matches');
            }));
            test('.patch + $select', () => __awaiter(void 0, void 0, void 0, function* () {
                const originalData = { [idProp]: doug[idProp], name: 'PatchDoug' };
                const data = yield service.patch(doug[idProp], originalData, {
                    query: { $select: ['name'] }
                });
                assert_1.default.strictEqual(data.name, 'PatchDoug', 'data.name matches');
                assert_1.default.ok(!data.age, 'data.age is falsy');
            }));
            test('.patch + id + query', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.patch(doug[idProp], {
                        name: 'id patched doug'
                    }, {
                        query: { name: 'Tester' }
                    });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Got a NotFound Feathers error');
                }
            }));
            test('.patch multiple', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.patch(null, {});
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'MethodNotAllowed', 'Removing multiple without option set throws MethodNotAllowed');
                }
                const params = {
                    query: { created: true }
                };
                const dave = yield service.create({
                    name: 'Dave',
                    age: 29,
                    created: true
                });
                const david = yield service.create({
                    name: 'David',
                    age: 3,
                    created: true
                });
                service.options.multi = ['patch'];
                const data = yield service.patch(null, {
                    age: 2
                }, params);
                assert_1.default.strictEqual(data.length, 2, 'returned two entries');
                assert_1.default.strictEqual(data[0].age, 2, 'First entry age was updated');
                assert_1.default.strictEqual(data[1].age, 2, 'Second entry age was updated');
                yield service.remove(dave[idProp]);
                yield service.remove(david[idProp]);
            }));
            test('.patch multi query same', () => __awaiter(void 0, void 0, void 0, function* () {
                const service = app.service(serviceName);
                const params = {
                    query: { age: { $lt: 10 } }
                };
                const dave = yield service.create({
                    name: 'Dave',
                    age: 8,
                    created: true
                });
                const david = yield service.create({
                    name: 'David',
                    age: 4,
                    created: true
                });
                const data = yield service.patch(null, {
                    age: 2
                }, params);
                assert_1.default.strictEqual(data.length, 2, 'returned two entries');
                assert_1.default.strictEqual(data[0].age, 2, 'First entry age was updated');
                assert_1.default.strictEqual(data[1].age, 2, 'Second entry age was updated');
                yield service.remove(dave[idProp]);
                yield service.remove(david[idProp]);
            }));
            test('.patch multi query changed', () => __awaiter(void 0, void 0, void 0, function* () {
                const service = app.service(serviceName);
                const params = {
                    query: { age: 10 }
                };
                const dave = yield service.create({
                    name: 'Dave',
                    age: 10,
                    created: true
                });
                const david = yield service.create({
                    name: 'David',
                    age: 10,
                    created: true
                });
                const data = yield service.patch(null, {
                    age: 2
                }, params);
                assert_1.default.strictEqual(data.length, 2, 'returned two entries');
                assert_1.default.strictEqual(data[0].age, 2, 'First entry age was updated');
                assert_1.default.strictEqual(data[1].age, 2, 'Second entry age was updated');
                yield service.remove(dave[idProp]);
                yield service.remove(david[idProp]);
            }));
            test('.patch + NotFound', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.patch('568225fbfe21222432e836ff', { name: 'PatchDoug' });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Error is a NotFound Feathers error');
                }
            }));
            test('.patch + query + NotFound', () => __awaiter(void 0, void 0, void 0, function* () {
                const dave = yield service.create({ name: 'Dave' });
                try {
                    yield service.patch(dave[idProp], { name: 'PatchedDave' }, { query: { name: 'NotDave' } });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Error is a NotFound Feathers error');
                }
                yield service.remove(dave[idProp]);
            }));
            test('.patch + id + query id', () => __awaiter(void 0, void 0, void 0, function* () {
                const alice = yield service.create({
                    name: 'Alice',
                    age: 12
                });
                try {
                    yield service.patch(doug[idProp], {
                        age: 33
                    }, {
                        query: { [idProp]: alice[idProp] }
                    });
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'NotFound', 'Got a NotFound Feathers error');
                }
                yield service.remove(alice[idProp]);
            }));
        });
        describe('create', () => {
            test('.create', () => __awaiter(void 0, void 0, void 0, function* () {
                const originalData = {
                    name: 'Bill',
                    age: 40
                };
                const originalCopy = Object.assign({}, originalData);
                const data = yield service.create(originalData);
                assert_1.default.deepStrictEqual(originalData, originalCopy, 'original data was not modified');
                assert_1.default.ok(data instanceof Object, 'data is an object');
                assert_1.default.strictEqual(data.name, 'Bill', 'data.name matches');
                yield service.remove(data[idProp]);
            }));
            test('.create + $select', () => __awaiter(void 0, void 0, void 0, function* () {
                const originalData = {
                    name: 'William',
                    age: 23
                };
                const data = yield service.create(originalData, {
                    query: { $select: ['name'] }
                });
                assert_1.default.strictEqual(data.name, 'William', 'data.name matches');
                assert_1.default.ok(!data.age, 'data.age is falsy');
                yield service.remove(data[idProp]);
            }));
            test('.create multi', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield service.create([], {});
                    throw new Error('Should never get here');
                }
                catch (error) {
                    assert_1.default.strictEqual(error.name, 'MethodNotAllowed', 'Removing multiple without option set throws MethodNotAllowed');
                }
                const items = [
                    {
                        name: 'Gerald',
                        age: 18
                    },
                    {
                        name: 'Herald',
                        age: 18
                    }
                ];
                service.options.multi = ['create', 'patch'];
                const data = yield service.create(items);
                assert_1.default.ok(Array.isArray(data), 'data is an array');
                assert_1.default.ok(typeof data[0][idProp] !== 'undefined', 'id is set');
                assert_1.default.strictEqual(data[0].name, 'Gerald', 'first name matches');
                assert_1.default.ok(typeof data[1][idProp] !== 'undefined', 'id is set');
                assert_1.default.strictEqual(data[1].name, 'Herald', 'second name macthes');
                yield service.remove(data[0][idProp]);
                yield service.remove(data[1][idProp]);
            }));
        });
        describe('doesn\'t call public methods internally', () => {
            let throwing;
            before(() => {
                throwing = app.service(serviceName).extend({
                    get store () {
                        return app.service(serviceName).store;
                    },
                    find () {
                        throw new Error('find method called');
                    },
                    get () {
                        throw new Error('get method called');
                    },
                    create () {
                        throw new Error('create method called');
                    },
                    update () {
                        throw new Error('update method called');
                    },
                    patch () {
                        throw new Error('patch method called');
                    },
                    remove () {
                        throw new Error('remove method called');
                    }
                });
            });
            test('internal .find', () => app.service(serviceName).find.call(throwing));
            test('internal .get', () => service.get.call(throwing, doug[idProp]));
            test('internal .create', () => __awaiter(void 0, void 0, void 0, function* () {
                const bob = yield service.create.call(throwing, {
                    name: 'Bob',
                    age: 25
                });
                yield service.remove(bob[idProp]);
            }));
            test('internal .update', () => service.update.call(throwing, doug[idProp], {
                name: 'Dougler'
            }));
            test('internal .patch', () => service.patch.call(throwing, doug[idProp], {
                name: 'PatchDoug'
            }));
            test('internal .remove', () => service.remove.call(throwing, doug[idProp]));
        });
    });
};
//# sourceMappingURL=methods.js.map