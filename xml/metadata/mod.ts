import MetadataItem from "./base.ts";
import Description from "./description.ts";
import Event from "./event.ts";
import Import from "./import.ts";
import Prop from "./prop.ts";
import Slot from "./slot.ts";
import * as Js from "../../writer/mod.ts";
import { CustomManifest } from "../../deps.ts";

export default class Metadata extends MetadataItem {
  get Name() {
    return this.Data.RawAttribute.name.toString();
  }

  get FunctionName() {
    return this.Name.replace(/(^\w|-\w)/g, (item) =>
      item.replace(/-/, "").toUpperCase()
    );
  }

  get Summary() {
    const result = this.Data.FindChild("summary");
    if (result) return result.TopLevelText;
    return this.Data.TopLevelText.split(".")[0];
  }

  get Description() {
    return new Description(this.Data);
  }

  get Form() {
    return this.Data.IncludesTag("form");
  }

  get Aria() {
    return this.Data.FindChild("aria")?.RawAttribute ?? {};
  }

  get Imports() {
    return this.Data.FindAllChildren("import").map((c) => new Import(c));
  }

  get Events() {
    return this.Data.FindAllChildren("event").map((c) => new Event(c));
  }

  get Base() {
    const base = this.Data.FindChild("base");
    return base ? new Import(base) : undefined;
  }

  get Attr() {
    return this.Data.FindAllChildren("attr").map((s) => new Prop(s));
  }

  get Props() {
    return this.Data.FindAllChildren("prop").map((s) => new Prop(s));
  }

  get Slots() {
    return this.Data.FindAllChildren("slot").map((s) => new Slot(s));
  }

  get SchemaBlock() {
    return new Js.Object({
      props: new Js.Object(
        this.Attr.reduce(
          (c, n) => ({
            ...c,
            [n.Name]: n.JavaScript,
          }),
          {} as Record<string, Js.Any>
        )
      ),
      form: new Js.Boolean(!!this.Form),
      base: new Js.Reference(this.Base?.Name ?? "HTMLElement"),
      aria: new Js.Object(
        Object.keys(this.Aria).reduce(
          (c, k) => ({
            ...c,
            [k]: new Js.String(this.Aria[k].toString()),
          }),
          {} as Record<string, Js.Any>
        )
      ),
    });
  }

  get Declaration(): CustomManifest.CustomElementDeclaration {
    return {
      kind: "class",
      name: this.FunctionName,
      tagName: this.Name,
      superclass: {
        name: this.Base?.Name ?? "HTMLElement",
      },
      customElement: true,
      events: this.Events.map((e) => ({
        name: e.Name,
        type: { text: e.Type },
        description: e.Description.Text,
      })),
      attributes: this.Attr.map((a) => ({
        name: a.Name,
        default: a.Default,
        description: a.Description.Text,
        type: {
          text: a.Type || "string",
        },
      })),
      members: this.Props.map((p) => ({
        kind: "field",
        name: p.Name,
        description: p.Description.Text,
        default: p.Default,
        type: {
          text: p.Type || "string",
        },
      })),
      slots: this.Slots.map((s) => ({
        name: s.Name,
        description: s.Description.Text,
      })),
    };
  }

  get ScriptImports() {
    const result = [];
    if (this.Base) result.push(this.Base.JavaScript);

    for (const item of this.Imports) result.push(item.JavaScript);

    return result.join(";");
  }

  get DescriptionText() {
    let description = this.Description.Text;

    if (this.Attr.length) {
      description += "\n\nAttributes:";
      for (const attr of this.Attr) {
        description += `\n  - \`${attr.Name}\` - ${attr.Description.Text}`;
        if (attr.Default || attr.Optional) description += " *optional*";
        if (attr.Default) description += ` **default**: ${attr.Default}`;
      }
    }

    if (this.Slots.length) {
      description += "\n\nSlots:";
      for (const slot of this.Slots)
        description += `\n  - \`${slot.Name || "default"}\` - ${
          slot.Description.Text
        }`;
    }

    return description;
  }

  JsDoc(level: number) {
    const main_line = [
      this.Description.Text,
      ...this.Props.map((p) => p.JsDoc),
      ...this.Attr.map((p) => p.JsDoc),
      ...this.Events.map((p) => p.JsDoc),
      ...this.Slots.map((p) => p.JsDoc),
    ];
    return `/**
 * ${main_line.join("")}
 */`.replaceAll(
      "\n",
      "\n" +
        Array.apply(null, Array(level))
          .map(() => " ")
          .join("")
    );
  }

  get VsCodeHtmlData() {
    return {
      name: this.Name,
      description: this.DescriptionText,
      references: this.Description.Ref
        ? [
            {
              name: this.Description.Ref.name,
              url: this.Description.Ref.url,
            },
          ]
        : undefined,
      attributes: this.Attr.map((p) => p.VsCodeHtmlData),
    };
  }
}