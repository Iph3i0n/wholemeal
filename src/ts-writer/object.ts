import Base from "./base";
import Property from "./property";

export default class ObjectWriter extends Base {
  readonly #data: Array<Property>;

  constructor(...data: Array<Property>) {
    super();
    this.#data = data;
  }

  toString(): string {
    return `{${this.#data.join(",")}}`;
  }
}
