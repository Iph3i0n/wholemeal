import Base from "./base";

const comparisons = {
  equals: "===",
  not_equals: "!==",
  greater_than: ">",
  less_than: "<",
  greater_than_or_equal_to: ">=",
  less_than_or_equal_to: "<=",
};

export default class ComparisonWriter extends Base {
  readonly #subject: Base;
  readonly #check: keyof typeof comparisons;
  readonly #target: Base;

  constructor(subject: Base, check: keyof typeof comparisons, target: Base) {
    super();
    this.#subject = subject;
    this.#check = check;
    this.#target = target;
  }

  toString(): string {
    return `${this.#subject} ${comparisons[this.#check]} ${this.#target}`;
  }
}
