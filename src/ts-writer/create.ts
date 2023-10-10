import Base from "./base";

export default class DeclareWriter extends Base {
  readonly #type: "var" | "let" | "const" | "import";
  readonly #name: string;
  readonly #value: Base | undefined;

  constructor(
    type: "var" | "let" | "const" | "import",
    name: string,
    value?: Base
  ) {
    super();
    this.#type = type;
    this.#name = name;
    this.#value = value;
  }

  toString(): string {
    if (this.#value) return `${this.#type} ${this.#name} = ${this.#value}`;
    return `${this.#type} ${this.#name}`;
  }
}
