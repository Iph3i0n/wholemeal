import Base from "./base";

export default class IfWriter extends Base {
  readonly #check: Base;
  readonly #data: Base;

  constructor(check: Base, data: Base) {
    super();
    this.#check = check;
    this.#data = data;
  }

  toString(): string {
    return `if (${this.#check}) ${this.#data}`;
  }
}
