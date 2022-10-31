import basicTests from "./basic.ts";
import { AdapterTestName } from "./declarations.ts";
import methodTests from "./methods.ts";
import syntaxTests from "./syntax.ts";
import { afterAll, describe, it } from "../../commons/mod.ts";

const adapterTests = (testNames: AdapterTestName[]) => {
  return (app: any, errors: any, serviceName: any, idProp = "id") => {
    if (!serviceName) {
      throw new Error("You must pass a service name");
    }

    const skippedTests: AdapterTestName[] = [];
    const allTests: AdapterTestName[] = [];

    const test = (name: AdapterTestName, runner: any) => {
      const skip = !testNames.includes(name);
      const its = skip ? it.ignore : it;

      if (skip) {
        skippedTests.push(name);
      }

      allTests.push(name);

      its(name, runner);
    };

    describe(`Adapter tests for '${serviceName}' service with '${idProp}' id property`, () => {
      afterAll(() => {
        testNames.forEach((name) => {
          if (!allTests.includes(name)) {
            console.error(
              `WARNING: '${name}' test is not part of the test suite`,
            );
          }
        });
        if (skippedTests.length) {
          console.log(
            `\nSkipped the following ${skippedTests.length} Feathers adapter test(s) out of ${allTests.length} total:`,
          );
          console.log(JSON.stringify(skippedTests, null, "  "));
        }
      });

      basicTests(test, app, errors, serviceName, idProp);
      methodTests(test, app, errors, serviceName, idProp);
      syntaxTests(test, app, errors, serviceName, idProp);
    });
  };
};

export * from "./declarations.ts";

export default adapterTests;

// if (typeof module !== 'undefined') {
//   module.exports = Object.assign(adapterTests, module.exports)
// }
