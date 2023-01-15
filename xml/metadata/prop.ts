import MetadataItem from "./base.ts";
import * as Js from "../../writer/mod.ts";
import Description from "./description.ts";

export default class Prop extends MetadataItem {
  get Name() {
    return this.Data.RawAttribute.name.toString();
  }

  get Type() {
    return this.Data.RawAttribute.type?.toString();
  }

  get Default() {
    return this.Data.RawAttribute.default?.toString();
  }

  get Optional() {
    return !!this.Data.RawAttribute.optional;
  }

  get Description() {
    return new Description(this.Data);
  }

  get JavaScript() {
    return this.Type === "boolean"
      ? new Js.Boolean(false)
      : this.Default
      ? new Js.String(this.Default)
      : new Js.Reference("undefined");
  }

  get VsCodeHtmlData() {
    return {
      name: this.Name,
      description: this.Description.Text,
      references: this.Description.Ref
        ? [
            {
              name: this.Description.Ref.name,
              url: this.Description.Ref.url,
            },
          ]
        : undefined,
      valueSet: this.Type,
    };
  }

  get Typings() {
    return `"${this.Name}"${
      this.Optional || this.Default || this.Type === "boolean" ? "?" : ""
    }: ${this.Type || "string"}`;
  }

  get JsDoc() {
    return `\n * @param props.${this.Name} -${
      this.Default
        ? ` (*default* - ${this.Default})`
        : this.Optional
        ? " (*optional*)"
        : ""
    } ${this.Description.Text}`;
  }
}
