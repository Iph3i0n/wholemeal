import MetadataItem from "./base.js";

export default class Description extends MetadataItem {
  get Text() {
    return this.Data.TopLevelText;
  }

  get Ref() {
    const target = this.Data.FindChild("ref");
    if (!target) return undefined;

    return {
      url: target.RawAttribute.url?.toString() ?? "",
      name: target.TopLevelText,
    };
  }
}
