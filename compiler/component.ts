import { Dom } from "../deps.ts";
import CompileDom from "./dom.ts";
import CompileCss from "./css/mod.ts";

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
    ${data.metadata}

    async function Component(render) {
      const self = this;
      const handle = (handler) => (e) => {
        handler.bind(this)(e);
        call_render();
      };

      ${data.main}

      const call_render = async () => {
        render({
          html: ${data.html},
          css: ${data.css},
        });

        if (typeof after_render === "function")
          after_render.bind(this)();
      };

      call_render();

      if (typeof after_load === "function")
        after_load.bind(this)();

      return call_render;
    };

    CreateComponent(
      {
        name,
        props: typeof props === "object" ? props : [],
        form: typeof form === "boolean" ? form : false,
        base: typeof base === "function" ? base : HTMLElement,
        extends: typeof extension === "string" ? extension : undefined
      },
      Component
    );
  `;
}

export default function Compile(component: string) {
  const dom = new Dom.DOMParser().parseFromString(component, "text/html");
  if (!dom) throw new Error("Cannot parse component");

  const get_then_remove = <T>(
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
    html: CompileDom(dom),
    css: CompileCss(css ?? ""),
    metadata,
  });
}
