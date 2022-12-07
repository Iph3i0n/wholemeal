import StringIterator from "./string-iterator.ts";
import { assertEquals } from "@testing/assert";

Deno.test("Parses a complex statement", () => {
  const iterator =
    new StringIterator(`":\`.progress:nth-child(\${index + 1})\`" {
      t-colour: ":colour";
      width: ":width + '%'";
    }`);

  const result = iterator.GetUntil("{");

  assertEquals(result, '":`.progress:nth-child(${index + 1})`" ');
});
