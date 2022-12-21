import "https://cdn.skypack.dev/element-internals-polyfill";
import "https://cdn.jsdelivr.net/npm/form-request-submit-polyfill";

import { Runner } from "../types/runner.ts";
import { Ast } from "../types/ast.ts";
import ObjectUtils from "./object.ts";
import HydrateFrom from "./hydrator.ts";
import RenderDom from "./html.ts";
import RenderSheet from "./css.ts";
import {
  LoadedEvent,
  PropsEvent,
  RenderEvent,
  ShouldRender,
} from "./events.ts";

function PropValue(value: string) {
  return value === ""
    ? true
    : value === "true"
    ? true
    : value === "false"
    ? false
    : // deno-lint-ignore no-explicit-any
      (value as any);
}

function ProcessProps(props: Record<string, string>): Record<string, string> {
  return ObjectUtils.MapKeys(props, (_, value) => PropValue(value));
}

export function CreateComponent(
  schema: {
    name: string;
    props: Array<string>;
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
    #redraw: () => void = () => {};
    // deno-lint-ignore no-explicit-any
    readonly #flags: Record<string, any> = {};

    static get observedAttributes() {
      return [...schema.props];
    }

    constructor() {
      super();
      this.#root = this.attachShadow({ mode: "open" });
      this.#internals = this.attachInternals();

      // deno-lint-ignore no-explicit-any
      const internals: any = this.#internals;
      for (const key in schema.aria)
        if (key === "Role") internals.role = schema.aria[key];
        else internals[`aria${key}`] = schema.aria[key];
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
      HydrateFrom(comp.html, RenderSheet(comp.css), this.#root);
      this.dispatchEvent(new RenderEvent());
    }

    async connectedCallback() {
      this.#redraw = await comp.bind(this)((c) => this.#render(c));
      this.addEventListener(ShouldRender.Key, () => this.#redraw());
      this.dispatchEvent(new LoadedEvent());
    }

    attributeChangedCallback(name: string, old: string, next: string) {
      this.#redraw();
      this.dispatchEvent(new PropsEvent(name, PropValue(old), PropValue(next)));
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
