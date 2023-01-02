import StringIterator from "../compiler-utils/string-iterator.ts";
import Sheet from "./sheet.ts";
import ReferenceWriter from "../writer/reference.ts";
import { PssBlock } from "./block.ts";
import BaseWriter from "../writer/base.ts";
import IfWriter from "../writer/if.ts";
import BlockWriter from "../writer/block.ts";

export class PssIfBlock extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@if(?:.|\n)+{(?:.|\n)*}$/gm)?.length;
  }

  readonly #data: string;
  readonly #media: BaseWriter | undefined;

  constructor(data: string, media?: BaseWriter) {
    super();
    this.#data = data;
    this.#media = media;
  }

  get #check() {
    const iterator = new StringIterator(this.#data);
    const result = iterator.GetUntil("{").replace("@if", "").trim();

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
      new IfWriter(
        this.#check,
        new BlockWriter(...this.#sheet.InlineJavaScript)
      ),
    ];
  }
}
