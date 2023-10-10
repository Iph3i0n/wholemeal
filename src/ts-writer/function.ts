import Base from "./base";

export default class AssignWriter extends Base {
  readonly #name: string;
  readonly #returns: Base;
  readonly #args: Array<[string, Base]>;

  constructor(name: string, returns: Base, ...args: Array<[string, Base]>) {
    super();
    this.#name = name;
    this.#returns = returns;
    this.#args = args;
  }

  toString(): string {
    return `function ${this.#name}(${this.#args.map(
      ([name, def]) => `${name}: ${def}`
    )}): ${this.#returns}`;
  }
}
