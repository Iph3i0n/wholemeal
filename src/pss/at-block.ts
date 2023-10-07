import StringIterator from "../compiler-utils/string-iterator";
import Sheet from "./sheet";
import { PssBlock } from "./block";
import * as Js from "../writer/mod";

export class PssAtBlock extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@(?:.|\n)+{(?:.|\n)*}$/gm)?.length;
  }

  readonly #data: string;
  readonly #media: Js.Any | undefined;

  constructor(data: string, media?: Js.Any) {
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

  get JavaScript(): Array<Js.Any> {
    return [
      new Js.Call(
        new Js.Access("push", new Js.Reference("result")),
        new Js.Object({
          variant: new Js.String(this.#variant),
          query: new Js.String(this.#statement),
          children: new Js.Call(this.#sheet.JavaScript),
        })
      ),
    ];
  }
}
