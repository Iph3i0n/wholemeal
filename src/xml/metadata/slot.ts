import MetadataItem from "./base.js";
import Description from "./description.js";

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
