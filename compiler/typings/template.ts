import { Runner } from "../../types/runner.ts";
import Metadata from "../../xml/metadata/mod.ts";

export default abstract class TypingsTemplate {
  readonly #metadata: Array<Metadata>;
  readonly #extra_types: Runner.Project["docs"];

  constructor(
    metadata: Array<Metadata>,
    extra_types: Runner.Project["docs"]
  ) {
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

  get GlobalDeclarations() {
    return `
  ${this.#metadata
    .filter((m) => m.Events.length)
    .map((m) =>
      m.Events.map(
        (e) => `class ${e.Type} {
    ${e.Keys.map((k) => `readonly ${k.Name}: ${k.Type}`).join(`;
    `)};
  }`
      ).join(`
  `)
    ).join(`
    `)}`;
  }

  get Metadata() {
    return this.#metadata;
  }

  abstract readonly Script: string;
}
