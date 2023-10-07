import { PssBlock } from "./block.js";
import * as Js from "../writer/mod.js";

export class PssInsertStatement extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@insert(?:.|\n)+$/gm)?.length;
  }

  readonly #data: string;

  constructor(data: string) {
    super();
    this.#data = data;
  }

  get #statement() {
    return this.#data.replace("@insert", "").trim();
  }

  get JavaScript(): Array<Js.Any> {
    return [
      new Js.Call(
        new Js.Access("push", new Js.Reference("result")),
        new Js.Spread(
          new Js.Call(
            new Js.Call(
              new Js.Reference("require"),
              new Js.String(this.#statement)
            )
          )
        )
      ),
    ];
  }
}
