import Element from "../element.js";

export default abstract class MetadataItem {
  readonly #data: Element;

  constructor(data: Element) {
    this.#data = data;
  }

  get Data() {
    return this.#data;
  }
}
