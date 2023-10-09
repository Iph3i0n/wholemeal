import Base from "./base";

export default class ModifierWriter extends Base {
  readonly #subject: Base;
  readonly #operator: string;

  constructor(subject: Base, operator: "!" | "!!") {
    super();
    this.#subject = subject;
    this.#operator = operator;
  }

  toString(): string {
    return `${this.#operator}${this.#subject}`;
  }
}
