/* eslint-disable no-console */
import basicTests from './basic';
import { AdapterTestName } from './declarations';
import methodTests from './methods';
import syntaxTests from './syntax';

const adapterTests = (testNames: AdapterTestName[]) => {
  return (app: any, errors: any, serviceName: any, idProp = 'id') => {
    if (!serviceName) {
      throw new Error('You must pass a service name');
    }

    const skippedTests: AdapterTestName[] = [];
    const allTests: AdapterTestName[] = [];

    const test = (name: AdapterTestName, runner: any) => {
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

      basicTests(test, app, errors, serviceName, idProp);
      methodTests(test, app, errors, serviceName, idProp);
      syntaxTests(test, app, errors, serviceName, idProp);
    });
  };
};

export * from './declarations'

export default adapterTests;

if (typeof module !== 'undefined') {
  module.exports = Object.assign(adapterTests, module.exports);
}
