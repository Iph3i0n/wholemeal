import BaseWriter from "./base";

export default class ClassWriter extends BaseWriter {
  readonly #name: string;
  readonly #base: string | undefined;
  readonly #children: Array<BaseWriter>;

  constructor(
    name: string,
    base: string | undefined,
    ...children: Array<BaseWriter>
  ) {
    super();
    this.#name = name;
    this.#base = base;
    this.#children = children;
  }

  toString(): string {
    return `class ${this.#name} ${
      this.#base ? `extends ${this.#base} ` : ""
    }{${this.#children.map((c) => c.toString()).join(";")}}`;
  }
}
