import { PssBlock } from "./block.ts";
import * as Js from "../writer/mod.ts";

export class PssJsStatement extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@js(?:.|\n)+$/gm)?.length;
  }

  readonly #data: string;

  constructor(data: string) {
    super();
    this.#data = data;
  }

  get #statement() {
    return this.#data.replace("@js", "").trim();
  }

  get JavaScript(): Array<Js.Any> {
    return [new Js.Reference(this.#statement)];
  }
}
