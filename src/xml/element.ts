import * as Js from "../writer/mod.js";
import Code from "./code.js";
import Node from "./node.js";
import Text from "./text.js";
import { Project } from "../compiler/project.js";

const AllText = ["script", "style"];

export default class Element extends Node {
  readonly #tag: string;
  readonly #attributes: Record<string, string | boolean> = {};
  readonly #children: Array<Node> = [];
  readonly #text_content: string = "";
  readonly #project: Project;

  #error(message: string, context: unknown) {
    return new Error(`${message}\n${JSON.stringify(context, undefined, 2)}`);
  }

  constructor(code: Code, project: Project) {
    super();
    this.#project = project;
    if (code.Current !== "<")
      throw this.#error("Elements must start with a <", {});
    code.Continue("skip-whitespace");

    this.#tag = code.Current;
    code.Continue("skip-whitespace");

    while (!code.Done && !code.IsKeyword) {
      const name = code.Current;
      code.Continue("skip-whitespace");
      if ((code.Current as string) !== "=") {
        this.#attributes[name] = true;
        continue;
      }

      code.Continue("skip-whitespace");
      if (!code.Current.startsWith('"'))
        throw this.#error("Attributes values must start with strings", {
          tag: this.#tag,
          name,
          symbol: code.Current,
        });

      this.#attributes[name] = code.Current.substring(
        1,
        code.Current.length - 1
      );

      code.Continue("skip-whitespace");
    }

    if ((code.Current as string) === ">") {
      code.Continue("skip-whitespace");
      while (!code.Done && (code.Current as string) !== "</")
        if (AllText.includes(this.#tag)) {
          this.#text_content += code.Current;
          code.Continue();
        } else if (code.Current === "<")
          this.#children.push(new Element(code, project));
        else this.#children.push(new Text(code));

      code.Continue("skip-whitespace");
      if (code.Current !== this.#tag)
        throw this.#error("Element closing tag mismatch", {
          tag: this.#tag,
          attributes: this.#attributes,
          symbol: code.Current,
        });

      code.Continue("skip-whitespace");
      if ((code.Current as string) !== ">")
        throw this.#error("No closing tag", {
          tag: this.#tag,
          attributes: this.#attributes,
          symbol: code.Current,
        });
      code.Continue("skip-whitespace");
    } else {
      code.Continue("skip-whitespace");
    }
  }

  get TagName() {
    return this.#project.MapTagName(this.#tag);
  }

  get TextContent() {
    if (!AllText.includes(this.#tag))
      throw new Error("Only text elements contain text content");

    return this.#text_content;
  }

  get Attributes() {
    const array_data = [];
    for (const key in this.#attributes) {
      const value = this.#attributes[key];
      if (!key.startsWith("on:") && !key.startsWith("s:"))
        array_data.push({ name: key, value });
    }

    return new Js.Object(
      array_data.reduce(
        (c, { name, value }) => ({
          ...c,
          [name]:
            typeof value === "boolean"
              ? new Js.Boolean(value)
              : value.startsWith(":")
              ? new Js.Reference(value.replace(":", ""))
              : new Js.String(value),
        }),
        {} as Record<string, Js.Any>
      )
    );
  }

  get RawAttribute() {
    return this.#attributes;
  }

  get TopLevelText() {
    let result = this.#children
      .filter(((c) => c instanceof Text) as (c: Node) => c is Text)
      .map((c: Text) => c.TextContent)
      .join(" ")
      .replaceAll(/\s/gm, " ")
      .trim();

    while (result.includes("  ")) result = result.replaceAll("  ", " ");

    return result;
  }

  IncludesTag(tag: string) {
    return !!this.#children.find((c) => c instanceof Element && c.#tag === tag);
  }

  FindChild(tag: string) {
    return this.#children.find(
      (c) => c instanceof Element && c.#tag === tag
    ) as Element | undefined;
  }

  FindAllChildren(tag: string) {
    return this.#children.filter(
      (c) => c instanceof Element && c.#tag === tag
    ) as Element[];
  }

  get Handlers() {
    const array_data = [];
    for (const key in this.#attributes) {
      const value = this.#attributes[key];
      if (key.startsWith("on:") && !key.startsWith("s:"))
        array_data.push({ name: key, value });
    }

    return new Js.Object(
      array_data.reduce(
        (c, { name, value }) => ({
          ...c,
          [name.replace("on:", "")]: new Js.Call(
            new Js.Reference("handle"),
            new Js.Reference(value.toString())
          ),
        }),
        {} as Record<string, Js.Any>
      )
    );
  }

  get Children() {
    return this.#children.map((c) => c.JavaScript);
  }

  get IsMetaTag() {
    return (
      this.TagName === "script" ||
      this.TagName === "style" ||
      this.TagName === "s:meta"
    );
  }

  get JavaScript() {
    switch (this.#tag) {
      case "s:if":
        return new Js.IfElse(
          new Js.Reference(
            this.#attributes.check.toString()?.replace(":", "") ?? ""
          ),
          new Js.Block(...this.Children),
          new Js.Block(
            ...this.Children.map(
              () =>
                new Js.Call(
                  new Js.Access("push", new Js.Reference("result")),
                  new Js.Reference("null")
                )
            )
          )
        );
      case "s:for":
        return new Js.For(
          this.#attributes.key?.toString() ?? "ctx",
          "of",
          new Js.Reference(
            this.#attributes.subject?.toString().replace(":", "") ?? ""
          ),
          new Js.Block(...this.Children)
        );
      case "s:use":
        return new Js.Block(
          new Js.Declare(
            "const",
            this.#attributes.as?.toString() ?? "",
            new Js.Reference(
              this.#attributes.get?.toString().replace(":", "") ?? ""
            )
          ),
          ...this.Children
        );
      case "s:text":
        return new Js.Call(
          new Js.Access("push", new Js.Reference("result")),
          new Js.Reference(
            this.#attributes.use?.toString().replace(":", "") ?? ""
          )
        );
      default:
        return new Js.Call(
          new Js.Access("push", new Js.Reference("result")),
          new Js.Object({
            tag: new Js.String(this.TagName),
            attr: this.Attributes,
            handlers: this.Handlers,
            children: new Js.Call(
              new Js.Function(
                [],
                "arrow",
                undefined,
                new Js.Block(
                  new Js.Declare("const", "result", new Js.Array()),
                  ...this.Children,
                  new Js.Return(new Js.Reference("result"))
                )
              )
            ),
            ...("s:ref" in this.#attributes
              ? {
                  ref: new Js.Reference(this.#attributes["s:ref"].toString()),
                }
              : {}),
            ...("s:vdom" in this.#attributes
              ? {
                  vdom: new Js.String(this.#attributes["s:vdom"].toString()),
                }
              : {}),
          })
        );
    }
  }
}
