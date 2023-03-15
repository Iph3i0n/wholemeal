import Component from "../xml/component.ts";
import * as Js from "../writer/mod.ts";

export default class Template {
  readonly #data: Component;

  constructor(data: Component) {
    this.#data = data;
  }

  get JavaScript() {
    const function_name = this.#data.Metadata.FunctionName;
    const name = this.#data.Metadata.Name;
    const base = this.#data.Metadata.Base?.Name ?? "ComponentBase";
    const base_import = !this.#data.Metadata.Base
      ? `import { ComponentBase } from "${import.meta.resolve(
          "../runner/component.ts"
        )}";`
      : "";
    const result = `
${base_import}
import {
  LoadedEvent,
  RenderEvent,
  ShouldRender,
  PropsEvent,
  CreateRef,
  BeforeRenderEvent
} from "${import.meta.resolve("../mod.ts")}";
${this.#data.Metadata.ScriptImports};
${this.#data.ScriptImports}

export class ${function_name} extends ${base} {
  get aria() {
    return ${JSON.stringify(this.#data.Metadata.Aria)};
  }

  static get observedAttributes() {
    return [${this.#data.Metadata.Attr.map((a) => `"${a.Name}"`).join(",")}];
  }

  ${this.#data.Metadata.Attr.map(
    (a) => `
  #${a.JsName} = null;
  get ["${a.Name}"]() {
    ${
      a.Type === "boolean"
        ? `
    if (this.#${a.JsName} !== null) {
      return !!this.#${a.JsName} || this.#${a.JsName} === "";
    }
    
    const a_value = this.getAttribute("${a.Name}")
    if (a_value !== null) {
      return !!a_value || a_value === "";
    }
    
    return false;`
        : `
    return this.#${a.JsName} ?? this.getAttribute("${a.Name}") ?? ${
            a.Default ? new Js.String(a.Default) : "undefined"
          };`
    }
  }
  
  set ["${a.Name}"](value) {
    this.#${a.JsName} = value;
    this.dispatchEvent(new ShouldRender());
  }`
  ).join("\n")}

  async start() {
    const self = this;
    const handle = (handler) => async (e) => {
      await handler(e);
      this.dispatchEvent(new ShouldRender());
    };
  
    ${this.#data.ScriptMain}
    return {
      html: ${this.#data.Html},
      css: ${this.#data.Css.JavaScript},
    };
  }
}

customElements.define("${name}", ${function_name});
`;

    return result;
  }
}
