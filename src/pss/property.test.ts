import { A, RunJs } from "../test-deps.js";
import * as Js from "../writer/mod.js";
import { PssProperty } from "./property.js";

Deno.test("Parses a basic property", () => {
  A.assertEquals(RunJs(new PssProperty("hello: world", undefined).JavaScript), [
    "hello",
    "world",
    undefined,
  ]);
});

Deno.test("Parses a computed property", () => {
  A.assertEquals(
    RunJs(new PssProperty('hello: ":ctx.world"', undefined).JavaScript, {
      ctx: {
        world: "test",
      },
    }),
    ["hello", "test", undefined]
  );
});

Deno.test("Parses a basic property with media queries", () => {
  A.assertEquals(
    RunJs(new PssProperty("hello: world", new Js.String("test")).JavaScript),
    ["hello", "world", "test"]
  );
});

Deno.test("Parses function calls", () => {
  A.assertEquals(
    RunJs(new PssProperty("ctx.test()", undefined).JavaScript, {
      ctx: {
        test: () => [["hello", "world"]],
      },
    }),
    {
      media: undefined,
      properties: [["hello", "world"]],
    }
  );
});

Deno.test("Parses function calls that contain media queries", () => {
  A.assertEquals(
    RunJs(new PssProperty("ctx.test()", undefined).JavaScript, {
      ctx: {
        test: () => [["hello", "world", "test"]],
      },
    }),
    {
      media: undefined,
      properties: [["hello", "world", "test"]],
    }
  );
});

Deno.test("Adds existing media queries", () => {
  A.assertEquals(
    RunJs(new PssProperty("ctx.test()", new Js.String("existing")).JavaScript, {
      ctx: {
        test: () => [["hello", "world", "test"]],
      },
    }),
    {
      media: "existing",
      properties: [["hello", "world", "test"]],
    }
  );
});
