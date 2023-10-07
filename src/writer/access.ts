import BaseWriter from "./base.js";

export default class AccessWriter extends BaseWriter {
  readonly #name: string;
  readonly #from: BaseWriter;

  constructor(name: string, from: BaseWriter) {
    super();
    this.#name = name;
    this.#from = from;
  }

  toString(): string {
    return `${this.#from}[\`${this.#name.replaceAll("`", "\\`")}\`]`;
  }
}
