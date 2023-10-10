import Base, { has_reserved } from "./base";

export default class ReferenceWriter extends Base {
  readonly #name: string;
  readonly #type: Base;
  readonly #optional?: boolean;
  readonly #modifiers: Array<string>;

  constructor(
    name: string,
    type: Base,
    optional?: boolean,
    ...modifiers: Array<string>
  ) {
    super();
    this.#name = name;
    this.#type = type;
    this.#optional = optional;
    this.#modifiers = modifiers;
  }

  toString() {
    if (has_reserved(this.#name))
      return `${this.#modifiers.join(" ")} "${this.#name.replaceAll(
        '"',
        '\\"'
      )}"${this.#optional ? "?" : ""}:${this.#type}`;
    return `${this.#modifiers.join(" ")} ${this.#name}${
      this.#optional ? "?" : ""
    }:${this.#type}`;
  }
}
