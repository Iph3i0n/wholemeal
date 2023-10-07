import * as Js from "../writer/mod.js";
import StringIterator from "../compiler-utils/string-iterator.js";

export class PssProperty {
  readonly #data: string;
  readonly #media: Js.Any | undefined;

  constructor(data: string, media: Js.Any | undefined) {
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
      return new Js.Array(
        new Js.String(id),
        value.startsWith('":')
          ? new Js.Reference(value.substring(2, value.length - 1))
          : new Js.String(value),
        this.#media ? this.#media : new Js.Reference("undefined")
      );
    }

    const { name, args } = this.#function_data;
    return new Js.Object({
      media: this.#media ? this.#media : new Js.Reference("undefined"),
      properties: new Js.Call(
        new Js.Reference(name),
        ...args.map((a) => new Js.Reference(a))
      ),
    });
  }
}
