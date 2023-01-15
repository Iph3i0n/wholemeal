import MetadataItem from "./base.ts";
import Description from "./description.ts";

export default class Slot extends MetadataItem {
  get Name() {
    return this.Data.RawAttribute.name?.toString() ?? "";
  }

  get Description() {
    return new Description(this.Data);
  }

  get JsDoc() {
    return `\n * @slot ${this.Name || "default"} - ${this.Description.Text}`;
  }
}
