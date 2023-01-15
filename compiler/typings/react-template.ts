import TypingsTemplate from "./template.ts";

export default class ReactTypingsTemplate extends TypingsTemplate {
  get Script() {
    return `import React from "react";
import "../bundle.min";

${this.ExtraDeclarations}

type CustomElement<T> = T & Partial<React.DOMAttributes<T> & { children?: React.ReactNode }>;

declare global {
  ${this.GlobalDeclarations}

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
export function ${m.FunctionName}(props: {
  ${m.Attr.map((p) => p.Typings)
    .concat(m.Props.map((p) => p.Typings))
    .concat(m.Events.map((p) => p.Typings)).join(`;
  `)}
}) {
  return React.createElement("${m.Name}", {
    ...props,
    ref: (ref: any) => {
      ${m.Props.map(
        (p) => `if (props["${p.Name}"]) ref["${p.Name}"] = props["${p.Name}"]`
      ).concat(
        m.Events.map(
          (p) =>
            `if (props["${p.HandlerName}"]) ref.addEventListener("${p.Name}", props["${p.HandlerName}"])`
        )
      ).join(`;
      `)}
    }
  });
}`
).join(`

`)}`;
  }
}
