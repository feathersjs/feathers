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
    describe('Query Syntax', () => {
        let bob;
        let alice;
        let doug;
        let service;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            service = app.service(serviceName);
            bob = yield app.service(serviceName).create({
                name: 'Bob',
                age: 25
            });
            doug = yield app.service(serviceName).create({
                name: 'Doug',
                age: 32
            });
            alice = yield app.service(serviceName).create({
                name: 'Alice',
                age: 19
            });
        }));
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield service.remove(bob[idProp]);
            yield service.remove(alice[idProp]);
            yield service.remove(doug[idProp]);
        }));
        test('.find + equal', () => __awaiter(void 0, void 0, void 0, function* () {
            const params = { query: { name: 'Alice' } };
            const data = yield service.find(params);
            assert_1.default.ok(Array.isArray(data));
            assert_1.default.strictEqual(data.length, 1);
            assert_1.default.strictEqual(data[0].name, 'Alice');
        }));
        test('.find + equal multiple', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = yield service.find({
                query: { name: 'Alice', age: 20 }
            });
            assert_1.default.strictEqual(data.length, 0);
        }));
        describe('special filters', () => {
            test('.find + $sort', () => __awaiter(void 0, void 0, void 0, function* () {
                let data = yield service.find({
                    query: {
                        $sort: { name: 1 }
                    }
                });
                assert_1.default.strictEqual(data.length, 3);
                assert_1.default.strictEqual(data[0].name, 'Alice');
                assert_1.default.strictEqual(data[1].name, 'Bob');
                assert_1.default.strictEqual(data[2].name, 'Doug');
                data = yield service.find({
                    query: {
                        $sort: { name: -1 }
                    }
                });
                assert_1.default.strictEqual(data.length, 3);
                assert_1.default.strictEqual(data[0].name, 'Doug');
                assert_1.default.strictEqual(data[1].name, 'Bob');
                assert_1.default.strictEqual(data[2].name, 'Alice');
            }));
            test('.find + $sort + string', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        $sort: { name: '1' }
                    }
                });
                assert_1.default.strictEqual(data.length, 3);
                assert_1.default.strictEqual(data[0].name, 'Alice');
                assert_1.default.strictEqual(data[1].name, 'Bob');
                assert_1.default.strictEqual(data[2].name, 'Doug');
            }));
            test('.find + $limit', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        $limit: 2
                    }
                });
                assert_1.default.strictEqual(data.length, 2);
            }));
            test('.find + $limit 0', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        $limit: 0
                    }
                });
                assert_1.default.strictEqual(data.length, 0);
            }));
            test('.find + $skip', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        $sort: { name: 1 },
                        $skip: 1
                    }
                });
                assert_1.default.strictEqual(data.length, 2);
                assert_1.default.strictEqual(data[0].name, 'Bob');
                assert_1.default.strictEqual(data[1].name, 'Doug');
            }));
            test('.find + $select', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        name: 'Alice',
                        $select: ['name']
                    }
                });
                assert_1.default.strictEqual(data.length, 1);
                assert_1.default.strictEqual(data[0].name, 'Alice');
                assert_1.default.strictEqual(data[0].age, undefined);
            }));
            test('.find + $or', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        $or: [
                            { name: 'Alice' },
                            { name: 'Bob' }
                        ],
                        $sort: { name: 1 }
                    }
                });
                assert_1.default.strictEqual(data.length, 2);
                assert_1.default.strictEqual(data[0].name, 'Alice');
                assert_1.default.strictEqual(data[1].name, 'Bob');
            }));
            test('.find + $in', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        name: {
                            $in: ['Alice', 'Bob']
                        },
                        $sort: { name: 1 }
                    }
                });
                assert_1.default.strictEqual(data.length, 2);
                assert_1.default.strictEqual(data[0].name, 'Alice');
                assert_1.default.strictEqual(data[1].name, 'Bob');
            }));
            test('.find + $nin', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        name: {
                            $nin: ['Alice', 'Bob']
                        }
                    }
                });
                assert_1.default.strictEqual(data.length, 1);
                assert_1.default.strictEqual(data[0].name, 'Doug');
            }));
            test('.find + $lt', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        age: {
                            $lt: 30
                        }
                    }
                });
                assert_1.default.strictEqual(data.length, 2);
            }));
            test('.find + $lte', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        age: {
                            $lte: 25
                        }
                    }
                });
                assert_1.default.strictEqual(data.length, 2);
            }));
            test('.find + $gt', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        age: {
                            $gt: 30
                        }
                    }
                });
                assert_1.default.strictEqual(data.length, 1);
            }));
            test('.find + $gte', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        age: {
                            $gte: 25
                        }
                    }
                });
                assert_1.default.strictEqual(data.length, 2);
            }));
            test('.find + $ne', () => __awaiter(void 0, void 0, void 0, function* () {
                const data = yield service.find({
                    query: {
                        age: {
                            $ne: 25
                        }
                    }
                });
                assert_1.default.strictEqual(data.length, 2);
            }));
        });
        test('.find + $gt + $lt + $sort', () => __awaiter(void 0, void 0, void 0, function* () {
            const params = {
                query: {
                    age: {
                        $gt: 18,
                        $lt: 30
                    },
                    $sort: { name: 1 }
                }
            };
            const data = yield service.find(params);
            assert_1.default.strictEqual(data.length, 2);
            assert_1.default.strictEqual(data[0].name, 'Alice');
            assert_1.default.strictEqual(data[1].name, 'Bob');
        }));
        test('.find + $or nested + $sort', () => __awaiter(void 0, void 0, void 0, function* () {
            const params = {
                query: {
                    $or: [
                        { name: 'Doug' },
                        {
                            age: {
                                $gte: 18,
                                $lt: 25
                            }
                        }
                    ],
                    $sort: { name: 1 }
                }
            };
            const data = yield service.find(params);
            assert_1.default.strictEqual(data.length, 2);
            assert_1.default.strictEqual(data[0].name, 'Alice');
            assert_1.default.strictEqual(data[1].name, 'Doug');
        }));
        describe('paginate', function () {
            beforeEach(() => {
                service.options.paginate = {
                    default: 1,
                    max: 2
                };
            });
            afterEach(() => {
                service.options.paginate = {};
            });
            test('.find + paginate', () => __awaiter(this, void 0, void 0, function* () {
                const page = yield service.find({
                    query: { $sort: { name: -1 } }
                });
                assert_1.default.strictEqual(page.total, 3);
                assert_1.default.strictEqual(page.limit, 1);
                assert_1.default.strictEqual(page.skip, 0);
                assert_1.default.strictEqual(page.data[0].name, 'Doug');
            }));
            test('.find + paginate + $limit + $skip', () => __awaiter(this, void 0, void 0, function* () {
                const params = {
                    query: {
                        $skip: 1,
                        $limit: 4,
                        $sort: { name: -1 }
                    }
                };
                const page = yield service.find(params);
                assert_1.default.strictEqual(page.total, 3);
                assert_1.default.strictEqual(page.limit, 2);
                assert_1.default.strictEqual(page.skip, 1);
                assert_1.default.strictEqual(page.data[0].name, 'Bob');
                assert_1.default.strictEqual(page.data[1].name, 'Alice');
            }));
            test('.find + paginate + $limit 0', () => __awaiter(this, void 0, void 0, function* () {
                const page = yield service.find({
                    query: { $limit: 0 }
                });
                assert_1.default.strictEqual(page.total, 3);
                assert_1.default.strictEqual(page.data.length, 0);
            }));
            test('.find + paginate + params', () => __awaiter(this, void 0, void 0, function* () {
                const page = yield service.find({ paginate: { default: 3 } });
                assert_1.default.strictEqual(page.limit, 3);
                assert_1.default.strictEqual(page.skip, 0);
                const results = yield service.find({ paginate: false });
                assert_1.default.ok(Array.isArray(results));
                assert_1.default.strictEqual(results.length, 3);
            }));
        });
    });
};
//# sourceMappingURL=syntax.js.map