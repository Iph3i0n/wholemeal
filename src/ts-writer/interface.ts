import Base from "./base";

export default class AssignWriter extends Base {
  readonly #name: string;
  readonly #children: Array<Base>;

  constructor(name: string, ...children: Array<Base>) {
    super();
    this.#name = name;
    this.#children = children;
  }

  toString(): string {
    return `interface ${this.#name} {${this.#children.join(";")}}`;
  }
}
