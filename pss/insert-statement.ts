import { PssBlock } from "./block.ts";
import BaseWriter from "../writer/base.ts";
import ReferenceWriter from "../writer/reference.ts";
import CallWriter from "../writer/call.ts";
import AccessWriter from "../writer/access.ts";
import SpreadWriter from "../writer/spread.ts";
import StringWriter from "../writer/string.ts";

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

  get JavaScript(): Array<BaseWriter> {
    return [
      new CallWriter(
        new AccessWriter("push", new ReferenceWriter("result")),
        new SpreadWriter(
          new CallWriter(
            new CallWriter(
              new ReferenceWriter("require"),
              new StringWriter(this.#statement)
            )
          )
        )
      ),
    ];
  }
}
