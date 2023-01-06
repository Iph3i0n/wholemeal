export default class Code {
  readonly #code: string;

  constructor(code: string) {
    this.#code = code;
  }

  *[Symbol.iterator]() {
    const result = this.#code.split(/(<\/|\/>|<|>|\s)/gm);
    for (const item of result) if (item.trim()) yield item;
  }
}
