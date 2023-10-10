import MetadataItem from "./base";
import Description from "./description";
import ToPascal from "./to-pascal";
import * as Ts from "../../ts-writer";

export default class Prop extends MetadataItem {
  get Name() {
    return this.Data.RawAttribute.name.toString();
  }

  get JsName() {
    return ToPascal(this.Name);
  }

  get Type() {
    return this.Data.RawAttribute.type?.toString();
  }

  get Property() {
    return "property" in this.Data.RawAttribute;
  }

  get Default() {
    return this.Data.RawAttribute.default?.toString();
  }

  get Optional() {
    return !!this.Data.RawAttribute.optional;
  }

  get Readonly() {
    return !!this.Data.RawAttribute.readonly;
  }

  get Description() {
    return new Description(this.Data);
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
    return new Ts.Property(
      this.Name,
      new Ts.Reference(this.Type ?? "string"),
      this.Optional || !!this.Default || this.Type === "boolean"
    );
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
