// deno-lint-ignore-file no-explicit-any
import { Ast } from "./ast.ts";

// deno-lint-ignore no-namespace
export namespace Runner {
  export interface IComponent extends HTMLElement {
    readonly props: Record<string, string>;
    set_flag(key: string, value: any): void;
    get_flag(key: string): any;
  }

  export type ComponentFunction = (
    this: IComponent,
    render: (comp: Ast.Component) => void
  ) => Promise<() => void>;

  export type Project = {
    templates: Array<string>;
    global_css: string;
  };
}
