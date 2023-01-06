import Component from "../xml/component.ts";
import Sheet from "../pss/sheet.ts";

function BuildTemplate(component: Component) {
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
    ${component.ScriptMeta}

    async function Component() {
      const self = this;
      const handle = (handler) => (e) => {
        handler(e);
        self.dispatchEvent(new ShouldRender());
      };

      ${component.ScriptMain}
      return {
        html: ${component.Html},
        css: ${component.Css.JavaScript},
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

export default function Compile(component: string) {
  return BuildTemplate(new Component(component));
}
