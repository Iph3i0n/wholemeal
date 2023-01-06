import { Dom } from "../deps.ts";
import { RunJs, A } from "../test-deps.ts";
import CompileDom from "./dom.ts";

Deno.test("Compiles nested for loops", () => {
  const dom = new Dom.DOMParser().parseFromString(
    `
    <s:for subject=":ctx.rows" key="row">
      <tr>
        <s:for subject=":row.content" key="item">
          <td><s:text use=":item.text"></s:text></td>
        </s:for>
      </tr>
    </s:for>
  `,
    "text/html"
  );

  if (!dom) throw new Error("Cannot parse component");

  const builder = CompileDom(dom);

  console.log(builder.toString());

  const result = RunJs(builder, {
    rows: [
      { content: [{ text: "test 1 1" }, { text: "test 1 2" }] },
      { content: [{ text: "test 2 1" }, { text: "test 2 2" }] },
    ],
  });

  A.assertEquals(result(), []);
});
