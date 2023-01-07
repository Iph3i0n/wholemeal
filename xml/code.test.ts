import Code from "./code.ts";
import { A } from "../test-deps.ts";

Deno.test("Parses a simple code block", () => {
  A.assertEquals(
    [...new Code("<div>Hello</div>")],
    ["<", "div", ">", "Hello", "</", "div", ">"]
  );
});

Deno.test("Parses empty strings", () => {
  A.assertEquals(
    [...new Code('<div test="">Hello</div>')],
    ["<", "div", " ", "test", "=", '""', ">", "Hello", "</", "div", ">"]
  );
});

Deno.test("Parses a self closing tag", () => {
  A.assertEquals([...new Code("<div />")], ["<", "div", " ", "/>"]);
});

Deno.test("Parses whitespace in text", () => {
  A.assertEquals(
    [...new Code("<div>Hello World</div>")],
    ["<", "div", ">", "Hello", " ", "World", "</", "div", ">"]
  );
});

Deno.test("Parses attributes", () => {
  A.assertEquals(
    [...new Code('<div class="test">Hello</div>')],
    ["<", "div", " ", "class", "=", '"test"', ">", "Hello", "</", "div", ">"]
  );
});

Deno.test("Parses whitespace in attributes", () => {
  A.assertEquals(
    [...new Code('<div class="simple test">Hello</div>')],
    [
      "<",
      "div",
      " ",
      "class",
      "=",
      '"simple test"',
      ">",
      "Hello",
      "</",
      "div",
      ">",
    ]
  );
});

Deno.test("Ignores script tags", () => {
  A.assertEquals(
    [...new Code("<script>Hello world</script>")],
    ["<", "script", ">", "Hello world", "</", "script", ">"]
  );
});

Deno.test("Ignores style tags", () => {
  A.assertEquals(
    [...new Code("<style>Hello world</style>")],
    ["<", "style", ">", "Hello world", "</", "style", ">"]
  );
});

Deno.test("Parses new lines in scripts", () => {
  A.assertEquals(
    [...new Code(`<script>Hello\nWorld</script>`)],
    ["<", "script", ">", "Hello\nWorld", "</", "script", ">"]
  );
});
