import StringIterator from "../compiler-utils/string-iterator.ts";
import Sheet from "./sheet.ts";
import ReferenceWriter from "../writer/reference.ts";
import { PssBlock } from "./block.ts";
import BaseWriter from "../writer/base.ts";
import BlockWriter from "../writer/block.ts";
import GenericForWriter from "../writer/generic-for.ts";

export class PssForBlock extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@for(?:.|\n)+{(?:.|\n)*}$/gm)?.length;
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
    const result = iterator.GetUntil("{").replace("@for", "").trim();

    return new ReferenceWriter(result);
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
      new GenericForWriter(
        this.#statement,
        new BlockWriter(...this.#sheet.InlineJavaScript)
      ),
    ];
  }
}
