import MetadataItem from "./base.ts";

export default class Key extends MetadataItem {
  get Name() {
    return this.Data.RawAttribute.name?.toString() ?? "";
  }

  get Type() {
    return this.Data.RawAttribute.type?.toString() ?? "string";
  }

  get Description() {
    return this.Data.TopLevelText;
  }
}
