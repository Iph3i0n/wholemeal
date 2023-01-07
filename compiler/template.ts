import Component from "../xml/component.ts";

export default class Template {
  readonly #data: Component;

  constructor(data: Component) {
    this.#data = data;
  }

  get JavaScript() {
    return `
      import { CreateComponent } from "${import.meta.resolve(
        "../runner/component.ts"
      )}";
      import {
        LoadedEvent,
        RenderEvent,
        ShouldRender,
        PropsEvent,
        CreateRef,
        BeforeRenderEvent
      } from "${import.meta.resolve("../mod.ts")}";
      ${this.#data.ScriptMeta}
  
      async function Component() {
        const self = this;
        const handle = (handler) => (e) => {
          handler(e);
          self.dispatchEvent(new ShouldRender());
        };
  
        ${this.#data.ScriptMain}
        return {
          html: ${this.#data.Html},
          css: ${this.#data.Css.JavaScript},
        };
      };
  
      CreateComponent(
        {
          name,
          props: typeof props === "object" ? props : {},
          form: typeof form === "boolean" ? form : false,
          base: typeof base === "function" ? base : HTMLElement,
          extends: typeof extension === "string" ? extension : undefined,
          aria: typeof aria === "object" ? aria : {}
        },
        Component
      );
    `;
  }
}
