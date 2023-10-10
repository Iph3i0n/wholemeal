import Base from "./base";

export default class AssignWriter extends Base {
  readonly #subject: Base;
  readonly #default: boolean;

  constructor(subject: Base, is_default: boolean) {
    super();
    this.#subject = subject;
    this.#default = is_default;
  }

  toString(): string {
    return `export${this.#default ? " default" : ""} ${this.#subject}`;
  }
}
