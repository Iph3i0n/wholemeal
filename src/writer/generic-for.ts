import Base from "./base";

export default class GenericForWriter extends Base {
  readonly #subject: Base;
  readonly #data: Base;

  constructor(subject: Base, data: Base) {
    super();
    this.#subject = subject;
    this.#data = data;
  }

  toString(): string {
    return `for (${this.#subject}) ${this.#data}`;
  }
}
