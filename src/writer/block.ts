import Base from "./base.js";

export default class BlockWriter extends Base {
  #children: Array<Base>;

  constructor(...children: Array<Base>) {
    super();
    this.#children = children;
  }

  toString(): string {
    return "{" + this.#children.map((c) => c.toString()).join(";") + "}";
  }
}
