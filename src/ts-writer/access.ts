import BaseWriter, { has_reserved, reserved } from "./base";

export default class AccessWriter extends BaseWriter {
  readonly #name: string;
  readonly #from: BaseWriter;

  constructor(name: string, from: BaseWriter) {
    super();
    this.#name = name;
    this.#from = from;
  }

  toString(): string {
    if (has_reserved(this.#name))
      return `${this.#from}[\`${this.#name.replaceAll("`", "\\`")}\`]`;

    return `${this.#from}.${this.#name}`;
  }
}
