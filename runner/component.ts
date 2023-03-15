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

type Handler<T extends Event> = (event: Event) => void;

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

    const on_render = (() => {
      let timeout = 0;
      return () => {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
          this.#render();
        }, 5);
      };
    })();
    this.addEventListener(ShouldRender.Key, on_render);
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

  set before_render(handler: Handler<BeforeRenderEvent>) {
    this.addEventListener(BeforeRenderEvent.Key, handler);
  }

  set after_render(handler: Handler<RenderEvent>) {
    this.addEventListener(RenderEvent.Key, handler);
  }

  set after_load(handler: Handler<LoadedEvent>) {
    this.addEventListener(LoadedEvent.Key, handler);
  }

  set after_props(handler: Handler<PropsEvent>) {
    this.addEventListener(PropsEvent.Key, handler);
  }

  handler_for(name: string) {
    // deno-lint-ignore no-this-alias
    const self = this;
    return {
      set handler(handler: Handler<Event>) {
        self.addEventListener(name, handler);
      },
    };
  }

  should_render() {
    this.dispatchEvent(new ShouldRender());
  }
}
