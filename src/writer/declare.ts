import Base from "./base.js";

export default class DeclareWriter extends Base {
  readonly #type: "var" | "let" | "const";
  readonly #name: string;
  readonly #value: Base | undefined;

  constructor(type: "var" | "let" | "const", name: string, value?: Base) {
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
