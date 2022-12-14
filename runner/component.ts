import "https://cdn.skypack.dev/element-internals-polyfill";
import "https://cdn.jsdelivr.net/npm/form-request-submit-polyfill";

import { Runner } from "../types/runner.ts";
import { Ast } from "../types/ast.ts";
import ObjectUtils from "./object.ts";
import VirtualDom from "./virtual-node.ts";
import RenderSheet from "./css.ts";
import {
  LoadedEvent,
  PropsEvent,
  RenderEvent,
  ShouldRender,
  BeforeRenderEvent,
} from "./events.ts";

// deno-lint-ignore no-explicit-any
function PropValue(value: string): any {
  return value === ""
    ? true
    : value === "true"
    ? true
    : value === "false"
    ? false
    : value;
}

export function CreateComponent(
  schema: {
    name: string;
    props: Record<string, string>;
    form?: boolean;
    base: new () => HTMLElement;
    extends?: string;
    aria: Record<string, string>;
  },
  comp: Runner.ComponentFunction
) {
  const Base = schema.base;
  class Main extends Base implements Runner.IComponent {
    public static formAssociated = !!schema.form;

    readonly #root: ShadowRoot;
    readonly #internals: ElementInternals;
    readonly #styles: HTMLStyleElement;
    readonly #virtual_dom: VirtualDom;

    #html: () => Ast.Html.Dom;
    #css: () => Ast.Css.Sheet;

    static get observedAttributes() {
      return Object.keys(schema.props);
    }

    constructor() {
      super();
      this.#root = this.attachShadow({ mode: "open" });
      this.#internals = this.attachInternals();
      this.#html = () => [];
      this.#css = () => [];
      this.#styles = document.createElement("style");
      this.#root.append(this.#styles);
      this.#virtual_dom = new VirtualDom(this.#root);

      // deno-lint-ignore no-explicit-any
      const internals: any = this.#internals;
      for (const key in schema.aria)
        if (key === "Role") internals.role = schema.aria[key];
        else internals[`aria${key}`] = schema.aria[key];
    }

    get props() {
      return ObjectUtils.MapKeys(schema.props, (k, v) =>
        typeof v === "boolean"
          ? !!(this.getAttribute(k) ?? v) || (this.getAttribute(k) ?? v) === ""
          : this.getAttribute(k) ?? v
      );
    }

    set styles(data: string) {
      this.#styles.innerHTML = data;
    }

    querySelector(selector: string) {
      return this.#root.querySelector(selector);
    }

    #render() {
      this.dispatchEvent(new BeforeRenderEvent());

      this.styles = RenderSheet(this.#css());
      this.#virtual_dom.Merge(this.#html());
      this.dispatchEvent(new RenderEvent());
    }

    async connectedCallback() {
      const result = await comp.bind(this)();
      this.#html = result.html;
      this.#css = result.css;
      this.#render();
      this.addEventListener(ShouldRender.Key, () => this.#render());
      this.dispatchEvent(new LoadedEvent());
    }

    attributeChangedCallback(name: string, old: string, next: string) {
      const props_event = new PropsEvent(name, PropValue(old), PropValue(next));
      this.dispatchEvent(props_event);
      if (props_event.defaultPrevented) return;
      this.dispatchEvent(new ShouldRender());
    }

    get internals() {
      return this.#internals;
    }

    get root() {
      return this.#root;
    }
  }

  customElements.define(schema.name, Main, { extends: schema.extends });
}
