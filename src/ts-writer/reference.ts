import Base from "./base";

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
