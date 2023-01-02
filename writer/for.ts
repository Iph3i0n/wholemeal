import Base from "./base.ts";

export default class ForWriter extends Base {
  readonly #subject: Base;
  readonly #type: "in" | "of";
  readonly #key: string;
  readonly #data: Base;

  constructor(key: string, type: "in" | "of", subject: Base, data: Base) {
    super();
    this.#subject = subject;
    this.#type = type;
    this.#key = key;
    this.#data = data;
  }

  toString(): string {
    return `for (const ${this.#key} ${this.#type} ${this.#subject}) ${
      this.#data
    }`;
  }
}
