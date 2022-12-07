import { Runner } from "../types/runner.ts";
import { Ast } from "../types/ast.ts";
import ObjectUtils from "./object.ts";
import HydrateFrom from "./hydrator.ts";
import RenderDom from "./html.ts";
import RenderSheet from "./css.ts";

function ProcessProps(props: Record<string, string>): Record<string, string> {
  return ObjectUtils.MapKeys(props, (_, value) =>
    // deno-lint-ignore no-explicit-any
    value === "" ? true : value === "true" ? true : (value as any)
  );
}

export function CreateComponent(
  schema: {
    name: string;
    props: Array<string>;
    form?: boolean;
    base: new () => HTMLElement;
    extends?: string;
  },
  comp: Runner.ComponentFunction
) {
  const Base = schema.base;
  class Main extends Base implements Runner.IComponent {
    public static formAssociated = !!schema.form;

    readonly #root: ShadowRoot;
    #redraw: () => void = () => {};
    // deno-lint-ignore no-explicit-any
    readonly #flags: Record<string, any> = {};

    static get observedAttributes() {
      return [...schema.props];
    }

    constructor() {
      super();
      this.#root = this.attachShadow({ mode: "open" });
    }

    get props() {
      const props: Record<string, string> = {};
      for (let i = 0; i < this.attributes.length; i++) {
        const attribute = this.attributes.item(i);
        if (!attribute) continue;

        props[attribute.name] = attribute.value;
      }

      return ProcessProps(props);
    }

    get_flag(name: string) {
      return this.#flags[name];
    }

    // deno-lint-ignore no-explicit-any
    set_flag(name: string, value: any) {
      this.#flags[name] = value;
      this.#redraw();
    }

    querySelector(selector: string) {
      return this.#root.querySelector(selector);
    }

    #render(comp: Ast.Component) {
      const result = RenderDom(comp.html);
      const styles = document.createElement("style");
      styles.innerHTML = RenderSheet(comp.css);
      HydrateFrom([...result, styles], this.#root);
      this.dispatchEvent(new Event("rerendered", { bubbles: false }));
    }

    async connectedCallback() {
      this.#redraw = await comp.bind(this)((c) => this.#render(c));
      this.addEventListener("should_render", () => this.#redraw());
    }

    attributeChangedCallback() {
      this.#redraw();
    }

    get root() {
      return this.#root;
    }
  }

  customElements.define(schema.name, Main, { extends: schema.extends });
}
