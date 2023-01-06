import Code from "./code.ts";
import { A } from "../test-deps.ts";

Deno.test("Parses a simple code block", () => {
  A.assertEquals(
    [...new Code("<div>Hello</div>")],
    ["<", "div", ">", "Hello", "</", "div", ">"]
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
