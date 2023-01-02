import StringIterator from "../compiler-utils/string-iterator.ts";
import Sheet from "./sheet.ts";
import { PssBlock } from "./block.ts";
import BaseWriter from "../writer/base.ts";
import StringWriter from "../writer/string.ts";
import ObjectWriter from "../writer/object.ts";
import CallWriter from "../writer/call.ts";
import AccessWriter from "../writer/access.ts";
import ReferenceWriter from "../writer/reference.ts";

export class PssAtBlock extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@(?:.|\n)+{(?:.|\n)*}$/gm)?.length;
  }

  readonly #data: string;
  readonly #media: BaseWriter | undefined;

  constructor(data: string, media?: BaseWriter) {
    super();
    this.#data = data;
    this.#media = media;
  }

  get #statement() {
    const iterator = new StringIterator(this.#data);
    iterator.GetUntil(/\s/gm);

    return iterator.GetUntil("{").trim();
  }

  get #variant() {
    const iterator = new StringIterator(this.#data);
    return iterator.GetUntil(/\s/gm).trim().replace("@", "");
  }

  get #sheet() {
    const iterator = new StringIterator(this.#data);
    iterator.GetUntil("{");
    const block_data = iterator.GetUntil("IMPOSSIBLE");
    return new Sheet(
      block_data.substring(0, block_data.length - 1),
      this.#media
    );
  }

  get JavaScript(): Array<BaseWriter> {
    return [
      new CallWriter(
        new AccessWriter("push", new ReferenceWriter("result")),
        new ObjectWriter({
          variant: new StringWriter(this.#variant),
          query: new StringWriter(this.#statement),
          children: new CallWriter(this.#sheet.JavaScript),
        })
      ),
    ];
  }
}
