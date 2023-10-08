import { Runner } from "../../types/runner";
import Metadata from "../../xml/metadata/mod";

export default class TypingsTemplate {
  readonly #metadata: Metadata;
  readonly #extra_types: Runner.Project["docs"];

  constructor(metadata: Metadata, extra_types: Runner.Project["docs"]) {
    this.#metadata = metadata;
    this.#extra_types = extra_types;
  }

  get ExtraDeclarations() {
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
    return this.#metadata;
  }

  get Script() {
    return "";
  }

  get Typings() {
    const m = this.#metadata;
    return `class ${m.FunctionName}Element extends HTMLElement {
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

${m.Events.map(
  (e) => `declare class ${e.Type} extends Event {
  readonly currentTarget: ${m.FunctionName}Element;
  ${e.Keys.map((k) => `readonly ${k.Name}: ${k.Type}`).join(`;
  `)};
}`
).join(`
`)}
  
`;
  }
}
