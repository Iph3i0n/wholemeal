import BaseWriter from "./base";

export default class ImportWriter extends BaseWriter {
  readonly #name: string;
  readonly #from: string;
  readonly #default: boolean;

  constructor(name: string | string[], from: string, is_default: boolean) {
    super();
    this.#name = Array.isArray(name) ? name.join(", ") : name;
    this.#from = from;
    this.#default = is_default;
  }

  toString(): string {
    if (!this.#name) return `import "${this.#from}"`;

    if (this.#default) {
      return `import ${this.#name} from "${this.#from}"`;
    }

    return `import {${this.#name}} from "${this.#from}"`;
  }
}
