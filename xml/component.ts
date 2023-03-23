import Code from "./code.ts";
import Node from "./node.ts";
import Text from "./text.ts";
import Element from "./element.ts";
import Sheet from "../pss/sheet.ts";
import * as Js from "../writer/mod.ts";
import Metadata from "./metadata/mod.ts";

const IsImport =
  /import([ \n\t]*(?:[^ \n\t\{\}]+[ \n\t]*,?)?(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])/gm;

const Blocks: Array<(s: string) => string> = [
  (s) =>
    s.replaceAll(
      /([^,{\s(=])\s*\$before:\s*{/gm,
      `$1;\nself.before_render = async (event) => {`
    ),
  (s) =>
    s.replaceAll(
      /([^,{\s(=])\s*\$after:\s*{/gm,
      `$1;\nself.after_render = async (event) => {`
    ),
  (s) =>
    s.replaceAll(
      /([^,{\s(=])\s*\$load:\s*{/gm,
      `$1;\nself.after_load = async (event) => {`
    ),
  (s) =>
    s.replaceAll(
      /([^,{\s(=])\s*\$props:\s*{/gm,
      `$1;\nself.after_props = async (event) => {`
    ),
  (s) =>
    s.replaceAll(
      /([^,{\s(=])\s*\$on_([a-zA-Z0-9_]+):\s*{/gm,
      `$1;\nself.handler_for("$2").handler = async (event) => {`
    ),
];

export default class Component {
  readonly #children: Array<Node> = [];
  readonly #namespace: string;

  constructor(code: string, namespace: string) {
    const code_object = new Code(code);
    while (!code_object.Done)
      if (code_object.Current === "<")
        this.#children.push(new Element(code_object));
      else this.#children.push(new Text(code_object));

    this.#namespace = namespace;
  }

  #find_tag(name: string) {
    const target = this.#children.find(
      (c) => c instanceof Element && c.TagName === name
    );
    if (!target || !(target instanceof Element)) return undefined;
    return target;
  }

  get #script_content() {
    const result = this.#find_tag("script");
    if (!result) return "";
    let text = result.TextContent;
    for (const block of Blocks) text = block(text);
    return text;
  }

  get ScriptMain() {
    return this.#script_content.replaceAll(IsImport, "").trim();
  }

  get ScriptImports() {
    return [...(this.#script_content.match(IsImport) ?? [])]
      .map((s) => s)
      .join(";");
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

  get Metadata() {
    const tag = this.#find_tag("s:meta");
    if (!tag || !tag.RawAttribute.name)
      throw new Error("Components must have a meta tag with a name attribute");

    return new Metadata(tag, this.#namespace);
  }
}
