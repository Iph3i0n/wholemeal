import Base from "./base.js";

export default class ReferenceWriter extends Base {
  readonly #target: string;

  constructor(target: string) {
    super();
    this.#target = target;
  }

  toString() {
    return this.#target;
  }
}
