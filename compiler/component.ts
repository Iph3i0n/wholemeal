import { Dom } from "../deps.ts";
import Sheet from "../pss/sheet.ts";
import CompileDom from "./dom.ts";

function BuildTemplate(data: {
  main?: string;
  html: string;
  css: string;
  metadata: string;
}) {
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
    ${data.metadata}

    async function Component() {
      const self = this;
      const handle = (handler) => (e) => {
        handler(e);
        self.dispatchEvent(new ShouldRender());
      };

      ${data.main}
      return {
        html: ${data.html},
        css: ${data.css},
      };
    };

    CreateComponent(
      {
        name,
        props: typeof props === "object" ? props : [],
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
  const dom = new Dom.DOMParser().parseFromString(component, "text/html");
  if (!dom) throw new Error("Cannot parse component");

  const get_then_remove = (
    selector: string,
    transform: (e: Dom.Element) => string
  ) => {
    const ele = dom.querySelector(selector);
    if (!ele) return "";

    const result = transform(ele);
    ele.remove();
    return result;
  };
  const script_content = get_then_remove("script", (e) => e.innerHTML);

  const metadata = script_content
    .split(";")
    .filter(
      (t) => t.trim().startsWith("import") || t.trim().startsWith("export ")
    )
    .join(";");

  const main = script_content
    .split(";")
    .filter(
      (t) => !(t.trim().startsWith("import") || t.trim().startsWith("export "))
    )
    .join(";");

  const css = get_then_remove("style", (s) => s.innerHTML);

  return BuildTemplate({
    main,
    html: CompileDom(dom).toString(),
    css: new Sheet(css).JavaScript.toString(),
    metadata,
  });
}
