import Base from "./base";

export default class ReferenceWriter extends Base {
  readonly #name: string;
  readonly #value: Base;
  readonly #generics: Array<string>;

  constructor(name: string, value: Base, ...generics: Array<string>) {
    super();
    this.#name = name;
    this.#value = value;
    this.#generics = generics;
  }

  toString() {
    if (this.#generics.length)
      return `type ${this.#name}<${this.#generics.join(", ")}> = ${
        this.#value
      }`;
    else return `type ${this.#name} = ${this.#value}`;
  }
}
