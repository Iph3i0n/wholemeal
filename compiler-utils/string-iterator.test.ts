import StringIterator from "./string-iterator.ts";
import { A } from "../test-deps.ts";

Deno.test("Parses a complex statement", () => {
  const iterator =
    new StringIterator(`":\`.progress:nth-child(\${index + 1})\`" {
      t-colour: ":colour";
      width: ":width + '%'";
    }`);

  const result = iterator.GetUntil("{");

  A.assertEquals(result, '":`.progress:nth-child(${index + 1})`" ');
});
