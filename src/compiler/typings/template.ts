import { Runner } from "../../types/runner";
import Component from "../../xml/component";
import * as Ts from "../../ts-writer";

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

  #type_for(type: Runner.Project["docs"]["value_sets"][number]) {
    let result: Ts.Any | undefined = undefined;

    for (const part of type.values)
      if (!result) result = new Ts.String(part.name);
      else result = new Ts.Operator(new Ts.String(part.name), "|", result);

    return result ?? new Ts.Reference("");
  }

  get Metadata() {
    return this.#component.Metadata;
  }

  get Typings(): Array<Ts.Any> {
    const m = this.Metadata;
    const base = this.Metadata.Base?.Name ?? "ComponentBase";
    return [
      new Ts.Reference(m.ScriptImports),
      new Ts.Reference(this.#component.ScriptImports),
      ...this.#extra_types.value_sets.map(
        (v) => new Ts.Type(v.name, this.#type_for(v))
      ),
      new Ts.Export(
        new Ts.Class(
          m.FunctionName,
          "extends",
          new Ts.Reference(base),
          ...m.Attr.map(
            (a) =>
              new Ts.Property(
                a.Name,
                new Ts.Reference(a.Type ?? "string"),
                a.Optional
              )
          ),
          ...m.Members.map(
            (a) =>
              new Ts.Property(
                a.Name,
                new Ts.Reference(a.Type ?? "string"),
                a.Optional,
                a.Readonly ? "readonly" : ""
              )
          )
        ),
        false
      ),
    ];
  }
}
