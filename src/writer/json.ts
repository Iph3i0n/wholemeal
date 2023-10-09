import Base from "./base";

export default class JsonWriter extends Base {
  readonly #data: unknown;

  constructor(data: unknown) {
    super();
    this.#data = data;
  }

  toString(): string {
    return JSON.stringify(this.#data);
  }
}
