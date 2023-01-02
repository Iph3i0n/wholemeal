import Base from "./base.ts";

export default class FunctionWriter extends Base {
  readonly #args: Array<Base>;
  readonly #type: "arrow" | "full";
  readonly #name: string | undefined;
  readonly #child: Base;

  constructor(
    args: Array<Base>,
    type: "arrow" | "full",
    name: string | undefined,
    child: Base
  ) {
    super();
    this.#args = args;
    this.#type = type;
    this.#name = name;
    this.#child = child;
  }

  toString() {
    switch (this.#type) {
      case "arrow":
        return `(${this.#args.map((a) =>
          a.toString()
        )}) => ${this.#child.toString()}`;
      case "full":
        return `function ${this.#name ?? ""}(${this.#args.map((a) =>
          a.toString()
        )}) ${this.#child.toString()}`;
    }
  }
}
