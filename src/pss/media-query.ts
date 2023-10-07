import StringIterator from "../compiler-utils/string-iterator";
import Sheet from "./sheet";
import * as Js from "../writer/mod";
import { PssBlock } from "./block";

export class PssMediaQuery extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@media(?:.|\n)+{(?:.|\n)*}$/gm)?.length;
  }

  readonly #data: string;

  constructor(data: string) {
    super();
    this.#data = data;
  }

  get #query() {
    const iterator = new StringIterator(this.#data);
    const result = iterator.GetUntil("{").replace("@media", "").trim();
    if (result.startsWith('":'))
      return new Js.Reference(result.substring(2, result.length - 1));

    return new Js.String(result);
  }

  get #sheet() {
    const iterator = new StringIterator(this.#data);
    iterator.GetUntil("{");
    const block_data = iterator.GetUntil("IMPOSSIBLE");
    return new Sheet(
      block_data.substring(0, block_data.length - 1),
      this.#query
    );
  }

  get JavaScript() {
    return this.#sheet.InlineJavaScript;
  }
}
