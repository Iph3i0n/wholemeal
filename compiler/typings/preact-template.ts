import TypingsTemplate from "./template.ts";

export default class PreactTypingsTemplate extends TypingsTemplate {
  get Script() {
    return `import "../bundle.min";

${this.ExtraDeclarations}

declare global {
  ${this.GlobalDeclarations}
}

declare module "preact/src/jsx" {
  namespace JSXInternal {
    import HTMLAttributes = JSXInternal.HTMLAttributes;

    interface IntrinsicElements {
      ${this.Metadata.map(
        (m) => `
        ${m.JsDoc(8)}
        "${m.Name}": {
          ${m.Attr.map((p) => p.Typings)
            .concat(m.Props.map((p) => p.Typings))
            .concat(m.Events.map((p) => p.Typings)).join(`;
          `)}
        } & HTMLAttributes<HTMLElement>`
      ).join(`;
      `)};
    }
  }
}`;
  }
}
