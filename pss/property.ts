import ArrayWriter from "../writer/array.ts";
import CallWriter from "../writer/call.ts";
import ObjectWriter from "../writer/object.ts";
import ReferenceWriter from "../writer/reference.ts";
import StringWriter from "../writer/string.ts";
import StringIterator from "../compiler-utils/string-iterator.ts";
import BaseWriter from "../writer/base.ts";

export class PssProperty {
  readonly #data: string;
  readonly #media: BaseWriter | undefined;

  constructor(data: string, media: BaseWriter | undefined) {
    this.#data = data;
    this.#media = media;
  }

  get #is_function() {
    return this.#data.trim().match(/^[^:]+\(/gm);
  }

  get #basic_data() {
    const iterator = new StringIterator(this.#data.trim());
    const [id, ...value] = iterator.Split(":");
    return { id: id.trim(), value: value.join(":").trim() };
  }

  get #function_data() {
    const iterator = new StringIterator(this.#data.trim());
    const name = iterator.GetUntil("(");
    const args: Array<string> = [];
    while (!iterator.Done) {
      let next = iterator.GetUntil(",");
      if (next.endsWith(")")) next = next.substring(0, next.length - 1);
      if (next.trim()) args.push(next.trim());
    }

    return { name, args };
  }

  get JavaScript() {
    if (!this.#is_function) {
      const { id, value } = this.#basic_data;
      return new ArrayWriter(
        new StringWriter(id),
        value.startsWith('":')
          ? new ReferenceWriter(value.substring(2, value.length - 1))
          : new StringWriter(value),
        this.#media ? this.#media : new ReferenceWriter("undefined")
      );
    }

    const { name, args } = this.#function_data;
    return new ObjectWriter({
      media: this.#media ? this.#media : new ReferenceWriter("undefined"),
      properties: new CallWriter(
        new ReferenceWriter(name),
        ...args.map((a) => new ReferenceWriter(a))
      ),
    });
  }
}
