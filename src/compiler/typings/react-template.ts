import TypingsTemplate from "./template";

export default class ReactTypingsTemplate extends TypingsTemplate {
  get Script() {
    const m = this.Metadata;
    return `const React = require("react");

${super.Script}

module.exports = function ${m.FunctionName}(props) {
  const ref = props.inner_ref || React.useRef();

  ${m.Attr.filter((a) => a.Property).map(
    (p) => `React.useEffect(() => {
    const r = ref.current;
    if (!r) return;

    r["${p.Name}"] = props["${p.Name}"];
  }, [ref.current, props["${p.Name}"]]);`
  ).join(`
  `)}


  ${m.Events.map(
    (p) => `React.useEffect(() => {
    const r = ref.current;
    if (!r) return;

    if (props["${p.HandlerName}"]) {
      r.addEventListener("${p.Name}", props["${p.HandlerName}"]);
      return () => {
        r.removeEventListener("${p.Name}", props["${p.HandlerName}"]);
      }
    }
  }, [ref.current, props["${p.HandlerName}"]]);`
  ).join(`
  `)}

  return React.createElement("${m.Name}", { ...props, ref });
}`;
  }

  get Typings() {
    const m = this.Metadata;
    return `import React from "react";
    
${this.ExtraDeclarations}

type CustomElement<T> = T & Partial<React.HTMLAttributes<T> & { children?: React.ReactNode }>;



declare global {
  namespace JSX {
    interface IntrinsicElements {
      ${m.JsDoc(8)}
        "${m.Name}": CustomElement<{
          ${m.Attr.map((p) => p.Typings).join(`;
          `)}
        }>
    }
  }

  ${super.Typings}
}

${m.JsDoc(0)}
export default function ${m.FunctionName}(props: CustomElement<{
  ${m.Attr.map((p) => p.Typings).concat(m.Events.map((p) => p.Typings)).join(`;
  `)}
  inner_ref?: React.MutableRefObject<${m.FunctionName}Element | undefined>;
}>): React.DOMElement<React.HTMLAttributes, ${m.FunctionName}Element>;`;
  }
}
