import Base from "./base.js";

export default class BooleanWriter extends Base {
  readonly #value: boolean;

  constructor(value: boolean) {
    super();
    this.#value = value;
  }

  toString(): string {
    return this.#value.toString();
  }
}
