import { A, RunJs } from "../test-deps.ts";
import StringWriter from "../writer/string.ts";
import { PssProperty } from "./property.ts";

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
      world: "test",
    }),
    ["hello", "test", undefined]
  );
});

Deno.test("Parses a basic property with media queries", () => {
  A.assertEquals(
    RunJs(new PssProperty("hello: world", new StringWriter("test")).JavaScript),
    ["hello", "world", "test"]
  );
});

Deno.test("Parses function calls", () => {
  A.assertEquals(
    RunJs(new PssProperty("ctx.test()", undefined).JavaScript, {
      test: () => [["hello", "world"]],
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
      test: () => [["hello", "world", "test"]],
    }),
    {
      media: undefined,
      properties: [["hello", "world", "test"]],
    }
  );
});

Deno.test("Adds existing media queries", () => {
  A.assertEquals(
    RunJs(
      new PssProperty("ctx.test()", new StringWriter("existing")).JavaScript,
      {
        test: () => [["hello", "world", "test"]],
      }
    ),
    {
      media: "existing",
      properties: [["hello", "world", "test"]],
    }
  );
});
