import {assert, assertStrictEquals, beforeEach, describe, it} from "../../commons/mod.ts";
import { AdapterBasicTest } from "./declarations.ts";

export default (
  test: AdapterBasicTest,
  app: any,
  _errors: any,
  serviceName: string,
  idProp: string,
) => {
  describe("Basic Functionality", () => {
    let service: any;

    beforeEach(() => {
      service = app.service(serviceName);
    });

    it(".id", () => {
      assertStrictEquals(
        service.id,
        idProp,
        "id property is set to expected name",
      );
    });

    test(".options", () => {
      assert(service.options, "Options are available in service.options");
    });

    test(".events", () => {
      assert(
        service.events.includes("testing"),
        'service.events is set and includes "testing"',
      );
    });

    describe("Raw Methods", () => {
      test("._get", () => {
        assertStrictEquals(typeof service._get, "function");
      });

      test("._find", () => {
        assertStrictEquals(typeof service._find, "function");
      });

      test("._create", () => {
        assertStrictEquals(typeof service._create, "function");
      });

      test("._update", () => {
        assertStrictEquals(typeof service._update, "function");
      });

      test("._patch", () => {
        assertStrictEquals(typeof service._patch, "function");
      });

      test("._remove", () => {
        assertStrictEquals(typeof service._remove, "function");
      });

      test(".$get", () => {
        assertStrictEquals(typeof service.$get, "function");
      });

      test(".$find", () => {
        assertStrictEquals(typeof service.$find, "function");
      });

      test(".$create", () => {
        assertStrictEquals(typeof service.$create, "function");
      });

      test(".$update", () => {
        assertStrictEquals(typeof service.$update, "function");
      });

      test(".$patch", () => {
        assertStrictEquals(typeof service.$patch, "function");
      });

      test(".$remove", () => {
        assertStrictEquals(typeof service.$remove, "function");
      });
    });
  });
};
