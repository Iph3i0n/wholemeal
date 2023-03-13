import Base from "./base.ts";

export default class IfElseWriter extends Base {
  readonly #check: Base;
  readonly #data: Base;
  readonly #otherwise: Base;

  constructor(check: Base, data: Base, otherwise: Base) {
    super();
    this.#check = check;
    this.#data = data;
    this.#otherwise = otherwise;
  }

  toString(): string {
    const data = this.#data.toString();
    return `if (${this.#check}) ${data}${data.endsWith("}") ? "" : ";"} else ${
      this.#otherwise
    }`;
  }
}
