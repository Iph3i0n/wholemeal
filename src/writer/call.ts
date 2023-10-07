import BaseWriter from "./base";

export default class CallWriter extends BaseWriter {
  readonly #definition: BaseWriter;
  readonly #args: Array<BaseWriter>;

  constructor(definition: BaseWriter, ...args: Array<BaseWriter>) {
    super();
    this.#definition = definition;
    this.#args = args;
  }

  toString(): string {
    return `(${this.#definition})(${this.#args
      .map((a) => a.toString())
      .join(",")})`;
  }
}
