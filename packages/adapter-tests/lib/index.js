'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
/* tslint:disable:no-console */
const basic_1 = __importDefault(require('./basic'));
const methods_1 = __importDefault(require('./methods'));
const syntax_1 = __importDefault(require('./syntax'));
const adapterTests = (testNames) => {
    return (app, errors, serviceName, idProp = 'id') => {
        if (!serviceName) {
            throw new Error('You must pass a service name');
        }
        const skippedTests = [];
        const allTests = [];
        const test = (name, runner) => {
            const skip = !testNames.includes(name);
            const its = skip ? it.skip : it;
            if (skip) {
                skippedTests.push(name);
            }
            allTests.push(name);
            its(name, runner);
        };
        describe(`Adapter tests for '${serviceName}' service with '${idProp}' id property`, () => {
            after(() => {
                console.log('\n');
                testNames.forEach(name => {
                    if (!allTests.includes(name)) {
                        console.error(`WARNING: '${name}' test is not part of the test suite`);
                    }
                });
                if (skippedTests.length) {
                    console.log(`\nSkipped the following ${skippedTests.length} Feathers adapter test(s) out of ${allTests.length} total:`);
                    console.log(JSON.stringify(skippedTests, null, '  '));
                }
            });
            basic_1.default(test, app, errors, serviceName, idProp);
            methods_1.default(test, app, errors, serviceName, idProp);
            syntax_1.default(test, app, errors, serviceName, idProp);
        });
    };
};
exports.default = adapterTests;
if (typeof module !== 'undefined') {
    module.exports = adapterTests;
}
//# sourceMappingURL=index.js.map