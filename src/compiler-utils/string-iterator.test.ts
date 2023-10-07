import StringIterator from "./string-iterator.js";
import { A } from "../test-deps.js";

Deno.test("Parses a complex statement", () => {
  const iterator =
    new StringIterator(`":\`.progress:nth-child(\${index + 1})\`" {
      t-colour: ":colour";
      width: ":width + '%'";
    }`);

  const result = iterator.GetUntil("{");

  A.assertEquals(result, '":`.progress:nth-child(${index + 1})`" ');
});
