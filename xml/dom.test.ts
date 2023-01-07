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
    ctx: {
      rows: [
        { content: [{ text: "test 1 1" }, { text: "test 1 2" }] },
        { content: [{ text: "test 2 1" }, { text: "test 2 2" }] },
      ],
    },
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

Deno.test("Compiles Card", () => {
  const builder = new Component(`
<script>
  export const name = "d-card";
  export const props = {
    colour: "surface",
  };
  export const aria = { Role: "section" };

  function get_colour() {
    return self.props.colour ?? "surface";
  }
</script>

<style>
  :host {
    display: block;
  }
</style>

<div class="title">
  <slot name="title"></slot>
</div>

<div class="body">
  <slot></slot>
</div>`);

  A.assertEquals(RunJs(builder.Html)(), [
    {
      tag: "div",
      handlers: {},
      attr: { class: "title" },
      children: [
        {
          attr: { name: "title" },
          children: [],
          handlers: {},
          tag: "slot",
        },
      ],
    },
    {
      tag: "div",
      handlers: {},
      attr: { class: "body" },
      children: [
        {
          attr: {},
          children: [],
          handlers: {},
          tag: "slot",
        },
      ],
    },
  ]);

  A.assertEquals(RunJs(builder.Css.JavaScript)(), [
    {
      properties: [["display", "block", undefined]],
      selector: ":host",
    },
  ]);

  A.assertEquals(
    builder.ScriptMain,
    `function get_colour() {
    return self.props.colour ?? "surface";
  }`
  );

  A.assertEquals(
    builder.ScriptMeta,
    `export const name = "d-card";
  export const props = {
    colour: "surface",
  };
  export const aria = { Role: "section" }`
  );
});

Deno.test("Parses fetch", () => {
  const builder = new Component(`
  <script>
  import { Provider } from "../data.ts";

  export const name = "u-fetch";
  export const props = {
    url: undefined,
    key: undefined,
    fallback: undefined,
    overlay: false,
    "no-cache": false,
  };
</script>
<s:if check=":!self.loading">
  <slot></slot>
</s:if>
<s:if check=":self.loading && !self.props.overlay">
  <slot name="loading"></slot>
</s:if>

<d-loading
  open=":(self.loading && !self.props.overlay) ? 'true' : undefined"
></d-loading>
`);

  const result = RunJs(builder.Html, { self: { loading: true, props: {} } });

  A.assertEquals(result(), [
    {
      attr: {
        name: "loading",
      },
      children: [],
      handlers: {},
      tag: "slot",
    },
    {
      attr: {
        open: "true",
      },
      children: [],
      handlers: {},
      tag: "d-loading",
    },
  ]);
});

Deno.test("Parses a self closing tag", () => {
  const builder = new Component(`
<div class="title">
    <img src="/" alt="" />
</div>
`);

  const result = RunJs(builder.Html);

  A.assertEquals(result(), [
    {
      attr: {
        class: "title",
      },
      children: [
        {
          tag: "img",
          attr: {
            src: "/",
            alt: "",
          },
          handlers: {},
          children: [],
        },
      ],
      handlers: {},
      tag: "div",
    },
  ]);
});

Deno.test("Parses a complex script", () => {
  const builder = new Component(`
<script>
  import FormElement from "../form-element.ts";
  import c from "../classes.ts";
  import slotted from "../toggleable-slot.ts";
  import options from "../options.ts";

  export const name = "f-select";
  export const props = {
    name: "",
    required: false,
    validate: undefined,
    disabled: false,
  };
  export const base = FormElement;
  export const form = true;
  export const aria = { Role: "select" };

  const items = options();
  function current() {
    return items.data.find((o) => o.value === self.value)?.text ?? "\\xa0";
  }

  function select(name) {
    return () => {
      self.value = name;
      self.blur();
    };
  }

  const slot = slotted();
</script>
<div class="title">
    <img src="/" alt="" />
</div>
`);

  const result = RunJs(builder.Html);

  A.assertEquals(result(), [
    {
      attr: {
        class: "title",
      },
      children: [
        {
          tag: "img",
          attr: {
            src: "/",
            alt: "",
          },
          handlers: {},
          children: [],
        },
      ],
      handlers: {},
      tag: "div",
    },
  ]);
});
