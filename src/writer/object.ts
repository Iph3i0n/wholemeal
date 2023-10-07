import Base from "./base";

export default class ObjectWriter extends Base {
  readonly #data: Record<string, Base>;

  constructor(data: Record<string, Base>) {
    super();
    this.#data = data;
  }

  toString(): string {
    const result = [];
    for (const key in this.#data) result.push(`"${key}":${this.#data[key]}`);
    return `{${result.join(",")}}`;
  }
}
