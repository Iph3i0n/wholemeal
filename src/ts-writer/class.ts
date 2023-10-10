import BaseWriter from "./base";

export default class ClassWriter extends BaseWriter {
  readonly #name: string;
  readonly #extension_type: "extends" | "implements" | undefined;
  readonly #base: BaseWriter | undefined;
  readonly #children: Array<BaseWriter>;

  constructor(
    name: string,
    extension_type: "extends" | "implements" | undefined,
    base: BaseWriter | undefined,
    ...children: Array<BaseWriter>
  ) {
    super();
    this.#name = name;
    this.#extension_type = extension_type;
    this.#base = base;
    this.#children = children;
  }

  toString(): string {
    return `class ${this.#name} ${
      this.#base ? `${this.#extension_type ?? "extends"} ${this.#base} ` : ""
    }{${this.#children.map((c) => c.toString()).join(";")}}`;
  }
}
