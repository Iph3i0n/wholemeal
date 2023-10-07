import Base from "./base";

export default class AssignWriter extends Base {
  readonly #subject: Base;
  readonly #target: Base;

  constructor(subject: Base, target: Base) {
    super();
    this.#subject = subject;
    this.#target = target;
  }

  toString(): string {
    return `${this.#subject} = ${this.#target}`;
  }
}
