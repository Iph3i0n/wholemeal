import Code from "./code.ts";
import Node from "./node.ts";
import Text from "./text.ts";
import Element from "./element.ts";
import Sheet from "../pss/sheet.ts";
import * as Js from "../writer/mod.ts";

export default class Component {
  readonly #children: Array<Node> = [];

  constructor(code: string) {
    const code_object = new Code(code);
    while (!code_object.Done)
      if (code_object.Current === "<")
        this.#children.push(new Element(code_object));
      else this.#children.push(new Text(code_object));
  }

  get #script_content() {
    const target = this.#children.find(
      (c) => c instanceof Element && c.TagName === "script"
    );
    if (!target || !(target instanceof Element))
      throw new Error("Components must have a script");
    return target.TextContent;
  }

  get ScriptMeta() {
    return this.#script_content
      .split(";")
      .filter(
        (t) => t.trim().startsWith("import") || t.trim().startsWith("export ")
      )
      .join(";");
  }

  get ScriptMain() {
    return this.#script_content
      .split(";")
      .filter(
        (t) =>
          !(t.trim().startsWith("import") || t.trim().startsWith("export "))
      )
      .join(";");
  }

  get Css() {
    const target = this.#children.find(
      (c) => c instanceof Element && c.TagName === "script"
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
          .filter(
            (c) =>
              !(c instanceof Element) ||
              (c.TagName !== "script" && c.TagName !== "style")
          )
          .map((c) => c.JavaScript),
        new Js.Return(new Js.Reference("result"))
      )
    );
  }
}
