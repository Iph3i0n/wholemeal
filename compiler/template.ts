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
      ${this.#data.Metadata.ScriptImports};
  
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
  
      window.${this.#data.Metadata.FunctionName} = CreateComponent(
        ${this.#data.Metadata.SchemaBlock},
        Component
      );

      customElements.define("${this.#data.Metadata.Name}", window.${
      this.#data.Metadata.FunctionName
    });
    `;
  }
}
