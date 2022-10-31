import {
  assertEquals,
  assertStrictEquals,
  assertThrows,
  describe,
  it,
} from "../../commons/mod.ts";
import { HookContext } from "../../feathers/mod.ts";
import { http } from "../src/index.ts";

describe("@feathersjs/transport-commons HTTP helpers", () => {
  it("getResponse body", () => {
    const plainData = { message: "hi" };
    const dispatch = { message: "from dispatch" };
    const resultContext = {
      result: plainData,
    };
    const dispatchContext = {
      dispatch,
    };

    assertStrictEquals(
      http.getResponse(resultContext as HookContext).body,
      plainData,
    );
    assertStrictEquals(
      http.getResponse(dispatchContext as HookContext).body,
      dispatch,
    );
  });

  it("getResponse status", () => {
    const statusContext = {
      http: { status: 202 },
    };
    const createContext = {
      method: "create",
    };
    const redirectContext = {
      http: { location: "/" },
    };

    assertStrictEquals(
      http.getResponse(statusContext as HookContext).status,
      202,
    );
    assertStrictEquals(
      http.getResponse(createContext as HookContext).status,
      http.statusCodes.created,
    );
    assertStrictEquals(
      http.getResponse(redirectContext as HookContext).status,
      http.statusCodes.seeOther,
    );
    assertStrictEquals(
      http.getResponse({} as HookContext).status,
      http.statusCodes.noContent,
    );
    assertStrictEquals(
      http.getResponse({ result: true } as HookContext).status,
      http.statusCodes.success,
    );
  });

  it("getResponse headers", () => {
    const headers = { key: "value" } as any;
    const headersContext = {
      http: { headers },
    };
    const locationContext = {
      http: { location: "/" },
    };

    assertEquals(http.getResponse({} as HookContext).headers, {});
    assertEquals(
      http.getResponse({ http: {} } as HookContext).headers,
      {},
    );
    assertStrictEquals(
      http.getResponse(headersContext as HookContext).headers,
      headers,
    );
    assertEquals(
      http.getResponse(locationContext as HookContext).headers,
      {
        Location: "/",
      },
    );
  });

  it("getServiceMethod", () => {
    assertStrictEquals(http.getServiceMethod("GET", 2), "get");
    assertStrictEquals(http.getServiceMethod("GET", null), "find");
    assertStrictEquals(http.getServiceMethod("PoST", null), "create");
    assertStrictEquals(
      http.getServiceMethod("PoST", null, "customMethod"),
      "customMethod",
    );
    assertStrictEquals(http.getServiceMethod("delete", null), "remove");
    assertThrows(() => http.getServiceMethod("nonsense", null));
  });
});
