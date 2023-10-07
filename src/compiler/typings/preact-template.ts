import TypingsTemplate from "./template";

export default class PreactTypingsTemplate extends TypingsTemplate {
  get Script() {
    return `require("./bundle.min");`;
  }

  get Typings() {
    return `
    ${this.ExtraDeclarations}
    
    declare module "preact/src/jsx" {
      namespace JSXInternal {
        import HTMLAttributes = JSXInternal.HTMLAttributes;
    
        interface IntrinsicElements {
          ${this.Metadata.map(
            (m) => `
            ${m.JsDoc(8)}
            "${m.Name}": {
              ${m.Attr.map((p) => p.Typings).concat(
                m.Events.map((p) => p.Typings)
              ).join(`;
              `)}
            } & HTMLAttributes<HTMLElement>`
          ).join(`;
          `)};
        }
      }
    
      ${this.GlobalDeclarations}
    }`;
  }
}