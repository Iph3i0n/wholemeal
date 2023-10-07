import Base from "./base.js";

export default class ArrayWriter extends Base {
  readonly #data: Base[];

  constructor(...data: Base[]) {
    super();
    this.#data = data;
  }

  toString(): string {
    return `[${this.#data.map((d) => d.toString()).join(",")}]`;
  }
}
