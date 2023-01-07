import { A, RunJs } from "../test-deps.ts";
import Sheet from "./sheet.ts";

Deno.test("Creates an empty sheet", () => {
  A.assertEquals(RunJs(new Sheet(``).JavaScript)(), []);
});

Deno.test("Creates a basic sheet", () => {
  A.assertEquals(
    RunJs(
      new Sheet(`
    .test { display: block; }
  `).JavaScript
    )(),
    [
      {
        selector: ".test",
        properties: [["display", "block", undefined]],
      },
    ]
  );
});

Deno.test("Creates a sheet with an if statement", () => {
  A.assertEquals(
    RunJs(
      new Sheet(`
    @if ctx.open {
      .test {
        display: block;
      }
    }
  `).JavaScript,
      { ctx: { open: true } }
    )(),
    [
      {
        selector: ".test",
        properties: [["display", "block", undefined]],
      },
    ]
  );
});

Deno.test("Uses js statements", () => {
  A.assertEquals(
    RunJs(
      new Sheet(`
    @js const display = "block";
    .test { display: ":display"; }
  `).JavaScript
    )(),
    [
      {
        selector: ".test",
        properties: [["display", "block", undefined]],
      },
    ]
  );
});
