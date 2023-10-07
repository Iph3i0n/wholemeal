import { PssBlock } from "./block.js";
import * as Js from "../writer/mod.js";
import StringIterator from "../compiler-utils/string-iterator.js";

export class PssAtStatement extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@(?:.|\n)+$/gm)?.length;
  }

  readonly #data: string;

  constructor(data: string) {
    super();
    this.#data = data;
  }

  get #statement() {
    const iterator = new StringIterator(this.#data);
    iterator.GetUntil(/\s/gm);

    const result = iterator.GetUntil(";").trim();
    if (result.startsWith('":'))
      return new Js.Reference(result.substring(2, result.length - 1));
    return new Js.String(result);
  }

  get #variant() {
    const iterator = new StringIterator(this.#data);
    return iterator.GetUntil(/\s/gm).trim();
  }

  get JavaScript(): Array<Js.Any> {
    return [
      new Js.Call(
        new Js.Access("push", new Js.Reference("result")),
        new Js.Object({
          rule: new Js.String(this.#variant),
          statement: this.#statement,
        })
      ),
    ];
  }
}
