import MetadataItem from "./base";
import * as Js from "../../writer/mod";

export default class Import extends MetadataItem {
  get #use() {
    const result = this.Data.RawAttribute.use;

    return result?.toString();
  }

  get #from() {
    const result = this.Data.RawAttribute.from;
    if (typeof result !== "string")
      throw new Error("Attempting to use an import with no from attribute");

    return result;
  }

  get #default() {
    const result = this.Data.RawAttribute.default;

    return !!result;
  }

  get Name() {
    return this.#use;
  }

  get JavaScript() {
    return new Js.Import(this.#use, this.#from, this.#default);
  }
}
