import { PssBlock } from "./block.ts";
import BaseWriter from "../writer/base.ts";
import ReferenceWriter from "../writer/reference.ts";
import CallWriter from "../writer/call.ts";
import AccessWriter from "../writer/access.ts";
import StringWriter from "../writer/string.ts";
import StringIterator from "../compiler-utils/string-iterator.ts";
import ObjectWriter from "../writer/object.ts";

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
      return new ReferenceWriter(result.substring(2, result.length - 1));
    return new StringWriter(result);
  }

  get #variant() {
    const iterator = new StringIterator(this.#data);
    return iterator.GetUntil(/\s/gm).trim();
  }

  get JavaScript(): Array<BaseWriter> {
    return [
      new CallWriter(
        new AccessWriter("push", new ReferenceWriter("result")),
        new ObjectWriter({
          rule: new StringWriter(this.#variant),
          statement: this.#statement,
        })
      ),
    ];
  }
}
