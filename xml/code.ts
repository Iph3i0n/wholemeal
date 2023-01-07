export default class Code {
  static get #splitter() {
    return /("[^"]*"|<\/|\/>|<|>|\s|=)/gm;
  }

  static get #key_worder() {
    return /(<\/|\/>|<|>)/gm;
  }

  readonly #code: string;
  readonly #data: Array<string>;
  #index = 0;

  constructor(code: string) {
    this.#code = code.trim();
    this.#data = this.#code
      .trim()
      .split(Code.#splitter)
      .filter((t) => t);
  }

  *[Symbol.iterator]() {
    for (const item of this.#data) if (item) yield item;
  }

  get Current(): string {
    return this.#data[this.#index];
  }

  get Done() {
    return this.#index >= this.#data.length;
  }

  get IsKeyword() {
    return this.Current && !!this.Current.match(Code.#key_worder)?.length;
  }

  Continue(skip?: "skip-whitespace") {
    this.#index += 1;
    if (skip) this.SkipWhitespace();
  }

  SkipWhitespace() {
    while (this.Current && !this.Current.trim()) this.Continue();
  }
}
