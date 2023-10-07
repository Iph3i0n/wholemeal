import { Ast } from "./ast.js";

// deno-lint-ignore no-namespace
export namespace Runner {
  export interface IComponent extends HTMLElement {
    readonly props: Record<string, string>;
    readonly internals: ElementInternals;
    readonly root: ShadowRoot;
  }

  export type ComponentFunction = (
    this: IComponent
  ) => Promise<{ html: () => Ast.Html.Dom; css: () => Ast.Css.Sheet }>;

  export type Project = {
    templates: Array<string>;
    global_css: string;
    description: string;
    docs: {
      value_sets: Array<{
        name: string;
        values: Array<{
          name: string;
          description?: string;
          references?: Array<{ name: string; url: string }>;
        }>;
      }>;
    };
    package: Record<string, unknown>;
    namespace?: string;
  };
}
