import ArrayWriter from "../writer/array.ts";
import ObjectWriter from "../writer/object.ts";
import StringWriter from "../writer/string.ts";
import { PssProperty } from "./property.ts";
import StringIterator from "../compiler-utils/string-iterator.ts";
import BaseWriter from "../writer/base.ts";
import { PssBlock } from "./block.ts";
import CallWriter from "../writer/call.ts";
import AccessWriter from "../writer/access.ts";
import ReferenceWriter from "../writer/reference.ts";

export class PssRule extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^[^@](?:.|\n)+{(?:.|\n)*}$/gm)?.length;
  }

  readonly #data: string;
  readonly #media: BaseWriter | undefined;

  constructor(data: string, media: BaseWriter | undefined) {
    super();
    this.#data = data;
    this.#media = media;
  }

  get #selector() {
    const iterator = new StringIterator(this.#data);
    const result = iterator.GetUntil("{").trim();
    if (result.startsWith('":')) {
      return new ReferenceWriter(result.substring(2, result.length - 1));
    }

    return new StringWriter(result);
  }

  get #properties() {
    const iterator = new StringIterator(this.#data);
    iterator.GetUntil("{");
    const block_data = new StringIterator(iterator.GetUntil("}"));
    return block_data
      .Split(";")
      .filter((d) => d.trim())
      .map((d) => new PssProperty(d, this.#media));
  }

  get JavaScript() {
    return [
      new CallWriter(
        new AccessWriter("push", new ReferenceWriter("result")),
        new ObjectWriter({
          selector: this.#selector,
          properties: new ArrayWriter(
            ...this.#properties.map((p) => p.JavaScript)
          ),
        })
      ),
    ];
  }
}
