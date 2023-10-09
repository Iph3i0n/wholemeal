import "element-internals-polyfill";
import "form-request-submit-polyfill";

import { Ast } from "../types/ast";
import VirtualDom from "./virtual-node";
import RenderSheet from "./css";
import {
  LoadedEvent,
  PropsEvent,
  RenderEvent,
  ShouldRender,
  BeforeRenderEvent,
} from "./events";
import { IElementInternals } from "element-internals-polyfill";

function PropValue(value: string): any {
  return value === ""
    ? true
    : value === "true"
    ? true
    : value === "false"
    ? false
    : value;
}

type Handler<T extends Event> = (event: T) => void;

abstract class Base {
  readonly #ele: HTMLElement;
  readonly #root: ShadowRoot;
  readonly #internals: IElementInternals;
  readonly #styles: HTMLStyleElement;
  readonly #virtual_dom: VirtualDom;

  #html: () => Ast.Html.Dom = () => [];
  #css: () => Ast.Css.Sheet = () => [];

  abstract readonly aria: Record<string, string>;
  abstract start(): Promise<{
    html: () => Ast.Html.Dom;
    css: () => Ast.Css.Sheet;
  }>;

  constructor(ele: HTMLElement) {
    this.#ele = ele;
    this.#root = this.#ele.attachShadow({ mode: "open" });
    this.#internals = this.#ele.attachInternals();
    this.#styles = document.createElement("style");
    this.#root.append(this.#styles);
    this.#virtual_dom = new VirtualDom(this.#root);

    const e = ele as any;
    const self = this as any;
    for (const key in e)
      if (!self[key])
        if (typeof e[key] === "function")
          self[key] = (...args: Array<any>) => e[key](...args);
        else {
          Object.defineProperty(self, key, {
            get() {
              return e[key];
            },
            set(val) {
              e[key] = val;
            },
          });
        }
  }

  get matcher() {
    return this.#ele;
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
      let timeout: number | NodeJS.Timeout = 0;
      return () => {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
          this.#render();
        }, 5);
      };
    })();
    this.#ele.addEventListener(ShouldRender.Key, on_render);
    this.#ele.dispatchEvent(new LoadedEvent());
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  #render() {
    this.#ele.dispatchEvent(new BeforeRenderEvent());
    this.styles = RenderSheet(this.#css());
    this.#virtual_dom.Merge(this.#html());
    this.#ele.dispatchEvent(new RenderEvent());
  }

  attributeChangedCallback(name: string, old: string, next: string) {
    const props_event = new PropsEvent(name, PropValue(old), PropValue(next));
    this.#ele.dispatchEvent(props_event);
    if (props_event.defaultPrevented) return;
    this.#ele.dispatchEvent(new ShouldRender());
  }

  get internals() {
    return this.#internals;
  }

  get root() {
    return this.#root;
  }

  set before_render(handler: Handler<BeforeRenderEvent>) {
    this.#ele.addEventListener(BeforeRenderEvent.Key, handler);
  }

  set after_render(handler: Handler<RenderEvent>) {
    this.#ele.addEventListener(RenderEvent.Key, handler);
  }

  set after_load(handler: Handler<LoadedEvent>) {
    this.#ele.addEventListener(LoadedEvent.Key, handler);
  }

  set after_props(handler: Handler<PropsEvent>) {
    this.#ele.addEventListener(PropsEvent.Key, handler as any);
  }

  handler_for(name: string) {
    // deno-lint-ignore no-this-alias
    const self = this;
    return {
      set handler(handler: Handler<Event>) {
        self.#ele.addEventListener(name, handler);
      },
    };
  }

  should_render() {
    this.#ele.dispatchEvent(new ShouldRender());
  }
}

export const ComponentBase = Base as new (target: HTMLElement) => InstanceType<
  typeof Base
> &
  HTMLElement;
export type ComponentBase = InstanceType<typeof Base> & HTMLElement;
