import TypingsTemplate from "./template.ts";

export default class ReactTypingsTemplate extends TypingsTemplate {
  get Script() {
    return `const React = require("react");
require("./bundle.min");

module.exports = {
  ${this.Metadata.map(
    (m) => `
    ${m.FunctionName}: function (props) {
      const ref = props.inner_ref || React.useRef();
    
      React.useEffect(() => {
        const r = ref.current;
        if (!r) return;
        let teardown = () => {};
        ${m.Attr.filter((a) => a.Property)
          .map(
            (p) => `if (props["${p.Name}"]) r["${p.Name}"] = props["${p.Name}"]`
          )
          .concat(
            m.Events.map(
              (p) =>
                `if (props["${p.HandlerName}"]) {
                  r.addEventListener("${p.Name}", props["${p.HandlerName}"]);
                  const old_teardown = teardown;
                  teardown = () => {
                    old_teardown();
                    r.removeEventListener("${p.Name}", props["${p.HandlerName}"]);
                  }
                }`
            )
          ).join(`
        `)}
        return teardown;
      }, [ref.current]);
    
      return React.createElement("${m.Name}", { ...props, ref });
    },`
  ).join(`
  `)}
}`;
  }

  get Typings() {
    return `import React from "react";
    
${this.ExtraDeclarations}

type CustomElement<T> = T & Partial<React.HTMLAttributes<T> & { children?: React.ReactNode }>;



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

  ${this.GlobalDeclarations}
}

${this.Metadata.map(
  (m) => `
${m.JsDoc(0)}
export function ${m.FunctionName}(props: CustomElement<{
  ${m.Attr.map((p) => p.Typings).concat(m.Events.map((p) => p.Typings)).join(`;
  `)}
  inner_ref?: React.MutableRefObject<${m.FunctionName}Element | undefined>;
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
