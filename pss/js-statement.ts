import { PssBlock } from "./block.ts";
import BaseWriter from "../writer/base.ts";
import ReferenceWriter from "../writer/reference.ts";

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

  get JavaScript(): Array<BaseWriter> {
    return [new ReferenceWriter(this.#statement)];
  }
}
