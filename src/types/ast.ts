// deno-lint-ignore no-namespace
export namespace Ast {
  // deno-lint-ignore no-namespace
  export namespace Html {
    export type Element = {
      tag: string;
      attr: Record<string, string>;
      ref?: { current?: HTMLElement };
      vdom?: "ignore";
      handlers: Record<string, (e: Event) => void>;
      children: Array<Node>;
    };

    export type Text = string;

    export type Node = Element | Text | null;

    export type Dom = Array<Node>;
  }

  // deno-lint-ignore no-namespace
  export namespace Css {
    export type AtStatement = { rule: string; statement: string };

    export type PropertyBlock = {
      media?: string;
      properties: Array<Property>;
    };

    export type Rule = {
      selector: string;
      properties: Array<Property | PropertyBlock>;
    };

    export type AtBlock = {
      variant: string;
      query: string;
      children: Sheet;
    };

    export type Property =
      | [string, string, string | undefined]
      | [string, string];

    export type Block = AtStatement | Rule | undefined | AtBlock;

    export type Sheet = Array<Block>;
  }

  export type Component = {
    html: Html.Dom;
    css: Css.Sheet;
  };
}
