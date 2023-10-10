import Base from "./base";

export default class AssignWriter extends Base {
  readonly #returns: Base;
  readonly #args: Array<[string, Base]>;

  constructor(returns: Base, ...args: Array<[string, Base]>) {
    super();
    this.#returns = returns;
    this.#args = args;
  }

  toString(): string {
    return `(${this.#args.map(([name, def]) => `${name}: ${def}`)}) => ${
      this.#returns
    }`;
  }
}
