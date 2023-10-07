import Base from "./base";

export default class SpreadWriter extends Base {
  readonly #data: Base;

  constructor(data: Base) {
    super();
    this.#data = data;
  }

  toString(): string {
    return `...${this.#data}`;
  }
}
