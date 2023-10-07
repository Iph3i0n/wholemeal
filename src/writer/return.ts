import Base from "./base.js";

export default class ReturnWriter extends Base {
  readonly #value: Base | undefined;

  constructor(value?: Base) {
    super();
    this.#value = value;
  }

  toString(): string {
    if (this.#value) return `return ${this.#value}`;
    return `return`;
  }
}
