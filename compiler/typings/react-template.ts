import TypingsTemplate from "./template.ts";

export default class ReactTypingsTemplate extends TypingsTemplate {
  get Script() {
    return `import React from "react";
import "../bundle.min";

${this.Metadata.map(
  (m) => `
export function ${m.FunctionName}(props) {
  const ref = props.ref || React.createRef();

  React.useEffect(() => {
    const r = ref.current;
    if (!r) return;
    ${m.Attr.filter((a) => a.Property)
      .map((p) => `if (props["${p.Name}"]) r["${p.Name}"] = props["${p.Name}"]`)
      .concat(
        m.Events.map(
          (p) =>
            `if (props["${p.HandlerName}"]) r.addEventListener("${p.Name}", props["${p.HandlerName}"])`
        )
      ).join(`;
    `)}
  }, [ref.current]);

  return React.createElement("${m.Name}", { ...props, ref });
}`
).join(`

`)}

export default {${this.Metadata.map(
      (m) => `
  ${m.FunctionName}`
    ).join(",")}
}`;
  }

  get Typings() {
    return `import React from "react";
    
${this.ExtraDeclarations}

type CustomElement<T> = T & Partial<React.HTMLAttributes<T> & { children?: React.ReactNode }>;


${this.GlobalDeclarations}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ${this.Metadata.map(
        (m) => `
        ${m.JsDoc(8)}
        "${m.Name}": CustomElement<{
          ${m.Attr.map((p) => p.Typings).join(`;
          `)}
        }>`
      ).join(`;
      `)};
    }
  }
}

${this.Metadata.map(
  (m) => `
${m.JsDoc(0)}
export function ${m.FunctionName}(props: CustomElement<{
  ${m.Attr.map((p) => p.Typings).concat(m.Events.map((p) => p.Typings)).join(`;
  `)}
  ref?: React.RefObject<${m.FunctionName}Element>;
}>): React.DOMElement<React.HTMLAttributes, ${m.FunctionName}Element>;`
).join(`
`)}

type Default = {${this.Metadata.map(
      (m) => `
  ${m.JsDoc(2)}
  ${m.FunctionName}: typeof ${m.FunctionName}`
    ).join(",")}
}

declare const DefaultExport: Default;
export default DefaultExport;`;
  }
}
