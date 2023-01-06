import { RunJs, A } from "../test-deps.ts";
import Component from "./component.ts";

Deno.test("Compiles nested for loops", () => {
  const builder = new Component(`
    <s:for subject=":ctx.rows" key="row">
      <tr>
        <s:for subject=":row.content" key="item">
          <td><s:text use=":item.text"></s:text></td>
        </s:for>
      </tr>
    </s:for>`);

  const result = RunJs(builder.Html, {
    rows: [
      { content: [{ text: "test 1 1" }, { text: "test 1 2" }] },
      { content: [{ text: "test 2 1" }, { text: "test 2 2" }] },
    ],
  });

  A.assertEquals(result(), [
    {
      tag: "tr",
      handlers: {},
      attr: {},
      children: [
        {
          attr: {},
          children: ["test 1 1"],
          handlers: {},
          tag: "td",
        },
        {
          attr: {},
          children: ["test 1 2"],
          handlers: {},
          tag: "td",
        },
      ],
    },
    {
      tag: "tr",
      handlers: {},
      attr: {},
      children: [
        {
          attr: {},
          children: ["test 2 1"],
          handlers: {},
          tag: "td",
        },
        {
          attr: {},
          children: ["test 2 2"],
          handlers: {},
          tag: "td",
        },
      ],
    },
  ]);
});
