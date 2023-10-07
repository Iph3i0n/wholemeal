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

  GetUntil(lookup: string | RegExp, including = false) {
    let result = "";
    let in_string = this.#next.value === STRING_CHAR;
    const is_match = () => {
      if (this.#next.done) return false;
      if (lookup instanceof RegExp)
        return !this.#next.value.match(lookup)?.length;
      return this.#next.value !== lookup;
    };

    while (!this.#next.done && (in_string || is_match())) {
      result += this.#next.value;
      this.#next = this.#iterator.next();
      if (!this.#next.done && this.#next.value === STRING_CHAR)
        in_string = !in_string;
    }

    if (!this.#next.done && including) result += this.#next.value;

    this.#next = this.#iterator.next();
    return result;
  }

  Split(search: string | RegExp) {
    if (typeof search === "string" && search.length > 1)
      throw new Error("Cannot split on phrases");
    const result: Array<string> = [];
    while (!this.Done) result.push(this.GetUntil(search));

    return result;
  }

  Occurences(search: string) {
    let count = 0;
    while (!this.Done) {
      const result = this.GetUntil(search, true);
      if (result.endsWith(search)) count++;
    }

    return count;
  }
}
