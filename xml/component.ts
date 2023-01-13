import Code from "./code.ts";
import Node from "./node.ts";
import Text from "./text.ts";
import Element from "./element.ts";
import Sheet from "../pss/sheet.ts";
import * as Js from "../writer/mod.ts";

class JsImport {
  readonly #data: Element;

  constructor(data: Element) {
    this.#data = data;
  }

  get #use() {
    const result = this.#data.RawAttribute.use;

    return result?.toString();
  }

  get #from() {
    const result = this.#data.RawAttribute.from;
    if (typeof result !== "string")
      throw new Error("Attempting to use an import with no from attribute");

    return result;
  }

  get #default() {
    const result = this.#data.RawAttribute.default;

    return !!result;
  }

  get Name() {
    return this.#use;
  }

  get JavaScript() {
    return new Js.Import(this.#use, this.#from, this.#default);
  }
}

class Description {
  readonly #data: Element;

  constructor(data: Element) {
    this.#data = data;
  }

  get Text() {
    return this.#data.TopLevelText;
  }

  get Ref() {
    const target = this.#data.FindChild("ref");
    if (!target) return undefined;

    return {
      url: target.RawAttribute.url?.toString() ?? "",
      name: target.TopLevelText,
    };
  }
}

class JsProp {
  readonly #data: Element;

  constructor(data: Element) {
    this.#data = data;
  }

  get Name() {
    return this.#data.RawAttribute.name.toString();
  }

  get Type() {
    return this.#data.RawAttribute.type?.toString();
  }

  get Default() {
    return this.#data.RawAttribute.default?.toString();
  }

  get Optional() {
    return !!this.#data.RawAttribute.optional;
  }

  get Description() {
    return new Description(this.#data);
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
}

class JsSlot {
  readonly #data: Element;

  constructor(data: Element) {
    this.#data = data;
  }

  get Name() {
    return this.#data.RawAttribute.name?.toString();
  }

  get Description() {
    return new Description(this.#data);
  }
}

class JsMetadata {
  readonly #data: Element;

  constructor(data: Element) {
    this.#data = data;
  }

  get Name() {
    return this.#data.RawAttribute.name.toString();
  }

  get Description() {
    return new Description(this.#data);
  }

  get Form() {
    return this.#data.IncludesTag("form");
  }

  get Aria() {
    return this.#data.FindChild("aria")?.RawAttribute ?? {};
  }

  get Imports() {
    return this.#data.FindAllChildren("import").map((c) => new JsImport(c));
  }

  get Base() {
    const base = this.#data.FindChild("base");
    return base ? new JsImport(base) : undefined;
  }

  get Props() {
    return this.#data.FindAllChildren("prop").map((s) => new JsProp(s));
  }

  get Slots() {
    return this.#data.FindAllChildren("slot").map((s) => new JsSlot(s));
  }

  get SchemaBlock() {
    return new Js.Object({
      name: new Js.String(this.Name),
      props: new Js.Object(
        this.Props.reduce(
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
}

export default class Component {
  readonly #children: Array<Node> = [];

  constructor(code: string) {
    const code_object = new Code(code);
    while (!code_object.Done)
      if (code_object.Current === "<")
        this.#children.push(new Element(code_object));
      else this.#children.push(new Text(code_object));
  }

  #find_tag(name: string) {
    const target = this.#children.find(
      (c) => c instanceof Element && c.TagName === name
    );
    if (!target || !(target instanceof Element)) return undefined;
    return target;
  }

  get #metadata() {
    const tag = this.#find_tag("meta");
    if (!tag || !tag.RawAttribute.name)
      throw new Error("Components must have a meta tag with a name attribute");

    return new JsMetadata(tag);
  }

  get #script_content() {
    const result = this.#find_tag("script");
    if (!result) return "";
    return result.TextContent;
  }

  get ScriptMeta() {
    return this.#metadata.SchemaBlock;
  }

  get ScriptImports() {
    const d = this.#metadata;

    const result = [];
    if (d.Base) result.push(d.Base.JavaScript);

    for (const item of d.Imports) result.push(item.JavaScript);

    return result.join(";");
  }

  get ScriptMain() {
    return this.#script_content
      .split(";")
      .filter(
        (t) =>
          !(t.trim().startsWith("import") || t.trim().startsWith("export "))
      )
      .join(";")
      .trim();
  }

  get Css() {
    const target = this.#children.find(
      (c) => c instanceof Element && c.TagName === "style"
    );
    if (!target || !(target instanceof Element)) return new Sheet("");

    return new Sheet(target.TextContent);
  }

  get Html() {
    return new Js.Function(
      [],
      "arrow",
      undefined,
      new Js.Block(
        new Js.Declare("const", "result", new Js.Array()),
        ...this.#children
          .filter((c) => !(c instanceof Element) || !c.IsMetaTag)
          .map((c) => c.JavaScript),
        new Js.Return(new Js.Reference("result"))
      )
    );
  }

  get VsCodeHtmlData() {
    const metadata = this.#metadata;

    let description = metadata.Description.Text;

    if (metadata.Slots.length) {
      description += "\n\nSlots:";
      for (const slot of metadata.Slots)
        description += `\n  * \`${slot.Name ?? "default"}\` - ${
          slot.Description.Text
        }`;
    }

    return {
      name: metadata.Name,
      description,
      references: metadata.Description.Ref
        ? [
            {
              name: metadata.Description.Ref.name,
              url: metadata.Description.Ref.url,
            },
          ]
        : undefined,
      attributes: metadata.Props.map((p) => p.VsCodeHtmlData),
    };
  }
}
