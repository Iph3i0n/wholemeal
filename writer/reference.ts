import Base from "./base.ts";

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
