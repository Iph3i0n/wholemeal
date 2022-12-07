const STRING_CHAR = '"';

export default class StringIterator {
  readonly #iterator: Iterator<string>;
  #next: IteratorResult<string>;

  constructor(data: string) {
    this.#iterator = data[Symbol.iterator]();
    this.#next = this.#iterator.next();
  }

  get Done() {
    return this.#next.done;
  }

  GetUntil(lookup: string, including = false) {
    let result = "";
    let in_string = this.#next.value === STRING_CHAR;
    while (!this.#next.done && (in_string || this.#next.value !== lookup)) {
      result += this.#next.value;
      this.#next = this.#iterator.next();
      if (!this.#next.done && this.#next.value === STRING_CHAR)
        in_string = !in_string;
    }

    if (!this.#next.done && including) result += this.#next.value;

    this.#next = this.#iterator.next();
    return result;
  }
}
