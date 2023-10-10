import Base from "./base";

export default class AssignWriter extends Base {
  readonly #children: Array<Base>;

  constructor(...children: Array<Base>) {
    super();
    this.#children = children;
  }

  toString(): string {
    return `global {${this.#children.join(";")}}`;
  }
}
