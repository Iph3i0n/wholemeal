import MetadataItem from "./base";
import Description from "./description";
import Key from "./key";
import * as Ts from "../../ts-writer";

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
    return new Ts.Property(
      this.HandlerName,
      new Ts.Lambda(new Ts.Reference("void"), [
        "event",
        new Ts.Reference(this.Type),
      ])
    );
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
