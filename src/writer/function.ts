import Base, { has_reserved } from "./base";

export default class FunctionWriter extends Base {
  readonly #args: Array<Base>;
  readonly #type: "arrow" | "full" | "method";
  readonly #name: string | undefined;
  readonly #child: Base;
  readonly #modifiers?: Array<string>;

  constructor(
    args: Array<Base>,
    type: "arrow" | "full" | "method",
    name: string | undefined,
    child: Base,
    modifiers?: Array<string>
  ) {
    super();
    this.#args = args;
    this.#type = type;
    this.#name = name;
    this.#child = child;
    this.#modifiers = modifiers;
  }

  toString() {
    switch (this.#type) {
      case "arrow":
        return `${this.#modifiers?.join(" ") ?? ""} (${this.#args.map((a) =>
          a.toString()
        )}) => ${this.#child.toString()}`;
      case "full":
        return `${this.#modifiers?.join(" ") ?? ""} function ${
          this.#name ?? ""
        }(${this.#args.map((a) => a.toString())}) ${this.#child.toString()}`;
      case "method":
        if (!this.#name) throw new Error("Methods must have a name");
        if (has_reserved(this.#name))
          return `${
            this.#modifiers?.join(" ") ?? ""
          } [\`${this.#name.replaceAll("`", "\\`")}\`](${this.#args.map((a) =>
            a.toString()
          )}) ${this.#child.toString()}`;
        else
          return `${this.#modifiers?.join(" ") ?? ""} ${
            this.#name
          }(${this.#args.map((a) => a.toString())}) ${this.#child.toString()}`;
    }
  }
}
