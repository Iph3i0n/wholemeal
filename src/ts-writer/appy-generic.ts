import Base from "./base";

export default class ReferenceWriter extends Base {
  readonly #target: Base;
  readonly #types: Array<Base>;

  constructor(target: Base, ...types: Array<Base>) {
    super();
    this.#target = target;
    this.#types = types;
  }

  toString() {
    return `${this.#target}<${this.#types.join(", ")}>`;
  }
}
