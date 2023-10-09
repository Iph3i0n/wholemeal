import BaseWriter, { has_reserved } from "./base";

export default class CallWriter extends BaseWriter {
  readonly #definition: BaseWriter;
  readonly #args: Array<BaseWriter>;

  constructor(definition: BaseWriter, ...args: Array<BaseWriter>) {
    super();
    this.#definition = definition;
    this.#args = args;
  }

  toString(): string {
    const def = this.#definition.toString();

    if (has_reserved(def))
      return `(${def})(${this.#args.map((a) => a.toString()).join(",")})`;
    else return `${def}(${this.#args.map((a) => a.toString()).join(",")})`;
  }
}
