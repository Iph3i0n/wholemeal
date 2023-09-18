import MetadataItem from "./base.ts";
import Description from "./description.ts";
import Key from "./key.ts";

export default class Event extends MetadataItem {
  get Name() {
    return this.Data.RawAttribute.name?.toString();
  }

  get Type() {
    return this.Data.RawAttribute.type?.toString() ?? "Event";
  }

  get Description() {
    return new Description(this.Data);
  }

  get Typings() {
    return `${this.HandlerName}?: (event: ${this.Type}) => void`;
  }

  get HandlerName() {
    return (
      "on" +
      this.Name.replace(/(^\w|-\w)/g, (item) =>
        item.replace(/-/, "").toUpperCase()
      )
    );
  }

  get Keys() {
    return this.Data.FindAllChildren("key").map((c) => new Key(c));
  }

  get JsDoc() {
    return `\n * @param props.on${this.Name} - ${this.Description.Text}`;
  }
}
