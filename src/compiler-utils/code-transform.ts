import StringIterator from "./string-iterator.js";

export default class Code implements Iterable<string> {
  readonly #data: string;

  constructor(data: string) {
    this.#data = data;
  }

  get #flattened() {
    return new StringIterator(this.#data)
      .Split(/\s/gm)
      .filter((d) => d.trim())
      .join(" ");
  }

  *[Symbol.iterator]() {
    const iterator = new StringIterator(this.#flattened);
    while (!iterator.Done) {
      const preamble = iterator.GetUntil("{");
      const preamble_parts = new StringIterator(preamble).Split(";");
      if (preamble_parts.length > 1)
        for (let i = 0; i < preamble_parts.length - 1; i++)
          if (preamble_parts[i].trim()) yield preamble_parts[i].trim();

      const selector = preamble_parts[preamble_parts.length - 1].trim();
      if (iterator.Done) {
        if (selector.trim()) yield selector.trim();
        continue;
      }

      let block_data = "{" + iterator.GetUntil("}", true);
      while (
        new StringIterator(block_data).Occurences("{") !==
        new StringIterator(block_data).Occurences("}")
      )
        block_data += iterator.GetUntil("}", true);

      yield selector + block_data;
    }
  }
}
