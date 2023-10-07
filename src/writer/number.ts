import Base from "./base.js";

export default class NumberWriter extends Base {
  readonly #value: number;

  constructor(value: number) {
    super();
    this.#value = value;
  }

  toString(): string {
    return this.#value.toString();
  }
}
