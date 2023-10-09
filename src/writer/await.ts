import Base from "./base";

export default class AssignWriter extends Base {
  readonly #subject: Base;

  constructor(subject: Base) {
    super();
    this.#subject = subject;
  }

  toString(): string {
    return `await ${this.#subject}`;
  }
}
