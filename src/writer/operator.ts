import Base from "./base";

export default class OperatorWriter extends Base {
  readonly #subject: Base;
  readonly #operator: string;
  readonly #target: Base;

  constructor(
    subject: Base,
    operator: "||" | "&&" | "*" | "+" | "-" | "/" | "??",
    target: Base
  ) {
    super();
    this.#subject = subject;
    this.#operator = operator;
    this.#target = target;
  }

  toString(): string {
    return `${this.#subject} ${this.#operator} ${this.#target}`;
  }
}
