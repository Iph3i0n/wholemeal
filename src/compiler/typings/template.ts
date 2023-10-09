import { Runner } from "../../types/runner";
import Component from "../../xml/component";
import Path from "path";

export default class TypingsTemplate {
  readonly #component: Component;
  readonly #extra_types: Runner.Project["docs"];
  readonly #location: string;

  constructor(
    component: Component,
    extra_types: Runner.Project["docs"],
    location: string
  ) {
    this.#component = component;
    this.#extra_types = extra_types;
    this.#location = location;
  }

  get #ExtraDeclarations() {
    const built_in_types = ["boolean", "string", "number"];

    return this.#extra_types.value_sets
      .filter((v) => !built_in_types.includes(v.name))
      .map(
        (v) =>
          `type ${v.name} = ${v.values
            .map((t) => '"' + t.name + '"')
            .join(" | ")}`
      )
      .join(`;\n`);
  }

  get Metadata() {
    return this.#component.Metadata;
  }

  get Script() {
    return `import ComponentWrapper from "${Path.resolve(
      __dirname,
      "..",
      "..",
      "runner",
      "component-wrapper"
    )}";

export default class ${
      this.Metadata.FunctionName
    }Element extends ComponentWrapper {

Initialiser(self) {
return import("${this.#location}?actual=true").then(r => new r.default(self));
}
}

customElements.define("${this.#component.Metadata.Name}", ${
      this.#component.Metadata.FunctionName
    }Element);`;
  }

  get Typings() {
    const m = this.Metadata;
    return `
${m.ScriptImports}
${this.#component.ScriptImports}

${this.#ExtraDeclarations}

export default class ${m.FunctionName} implements HTMLElement {
  ${m.Attr.map(
    (a) => `/** ${a.Description.Text} */
    "${a.Name}": ${a.Type ?? "string"};`
  ).join(`
  `)}
  ${m.Members.map(
    (a) => `/** ${a.Description.Text} */
    ${a.Readonly ? "readonly " : ""}"${a.Name}": ${a.Type ?? "string"};`
  ).join(`
  `)}
}
`;
  }
}
