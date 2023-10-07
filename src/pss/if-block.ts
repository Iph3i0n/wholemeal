import StringIterator from "../compiler-utils/string-iterator.js";
import Sheet from "./sheet.js";
import * as Js from "../writer/mod.js";
import { PssBlock } from "./block.js";

export class PssIfBlock extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@if(?:.|\n)+{(?:.|\n)*}$/gm)?.length;
  }

  readonly #data: string;
  readonly #media: Js.Any | undefined;

  constructor(data: string, media?: Js.Any) {
    super();
    this.#data = data;
    this.#media = media;
  }

  get #check() {
    const iterator = new StringIterator(this.#data);
    const result = iterator.GetUntil("{").replace("@if", "").trim();

    return new Js.Reference(result);
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

  get JavaScript(): Array<Js.Any> {
    return [
      new Js.If(this.#check, new Js.Block(...this.#sheet.InlineJavaScript)),
    ];
  }
}
