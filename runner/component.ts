import "https://cdn.skypack.dev/element-internals-polyfill";
import "https://cdn.jsdelivr.net/npm/form-request-submit-polyfill";

import { Ast } from "../types/ast.ts";
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

export abstract class ComponentBase extends HTMLElement {
  readonly #root: ShadowRoot;
  readonly #internals: ElementInternals;
  readonly #styles: HTMLStyleElement;
  readonly #virtual_dom: VirtualDom;

  #html: () => Ast.Html.Dom = () => [];
  #css: () => Ast.Css.Sheet = () => [];

  abstract readonly aria: Record<string, string>;
  abstract start(): Promise<{
    html: () => Ast.Html.Dom;
    css: () => Ast.Css.Sheet;
  }>;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#internals = this.attachInternals();
    this.#styles = document.createElement("style");
    this.#root.append(this.#styles);
    this.#virtual_dom = new VirtualDom(this.#root);
  }

  set styles(data: string) {
    this.#styles.innerHTML = data;
  }

  querySelector(selector: string) {
    return this.#root.querySelector(selector);
  }

  async connectedCallback() {
    // deno-lint-ignore no-explicit-any
    const internals: any = this.#internals;
    for (const key in this.aria)
      if (key === "role") internals.role = this.aria[key];
      else internals[`aria${key}`] = this.aria[key];
    const { html, css } = await this.start();
    this.#html = html;
    this.#css = css;

    this.#render();
    this.addEventListener(ShouldRender.Key, () => this.#render());
    this.dispatchEvent(new LoadedEvent());
  }

  #render() {
    this.dispatchEvent(new BeforeRenderEvent());
    this.styles = RenderSheet(this.#css());
    this.#virtual_dom.Merge(this.#html());
    this.dispatchEvent(new RenderEvent());
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
