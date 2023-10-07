import TypingsTemplate from "./template";

export default class PreactTypingsTemplate extends TypingsTemplate {
  get Script() {
    return ``;
  }

  get Typings() {
    const m = this.Metadata;
    return `
    ${this.ExtraDeclarations}
    
    declare module "preact/src/jsx" {
      namespace JSXInternal {
        import HTMLAttributes = JSXInternal.HTMLAttributes;
    
        interface IntrinsicElements {
            ${m.JsDoc(8)}
            "${m.Name}": {
              ${m.Attr.map((p) => p.Typings).concat(
                m.Events.map((p) => p.Typings)
              ).join(`;
              `)}
            } & HTMLAttributes<HTMLElement>;
        }
      }
    
      ${this.GlobalDeclarations}
    }`;
  }
}
