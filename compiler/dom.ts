import { Dom } from "../deps.ts";
import * as Js from "../writer/mod.ts";

function InsertAttributes(map: Dom.NamedNodeMap) {
  const array_data = [];
  for (let i = 0; i < map.length; i++) {
    const item = map.item(i);
    if (item && !item.name.startsWith("on:") && !item.name.startsWith("s:"))
      array_data.push(item);
  }

  return new Js.Object(
    array_data.reduce(
      (c, n) => ({
        ...c,
        [n.name]: n.value.startsWith(":")
          ? new Js.Reference(n.value.replace(":", ""))
          : new Js.String(n.value),
      }),
      {} as Record<string, Js.Any>
    )
  );
}

function InsertHandlers(map: Dom.NamedNodeMap) {
  const array_data = [];
  for (let i = 0; i < map.length; i++) {
    const item = map.item(i);
    if (item && item.name.startsWith("on:")) array_data.push(item);
  }

  return new Js.Object(
    array_data.reduce(
      (c, n) => ({
        ...c,
        [n.name.replace("on:", "")]: new Js.Call(
          new Js.Reference("handle"),
          new Js.Reference(n.value)
        ),
      }),
      {} as Record<string, Js.Any>
    )
  );
}

function InsertElement(element: Dom.Element) {
  const attr = (key: string) => element.getAttribute(key);
  if (element.tagName.toLowerCase() === "s:if")
    return new Js.If(
      new Js.Reference(attr("check")?.replace(":", "") ?? ""),
      InsertChildren(element.childNodes)
    );

  if (element.tagName.toLowerCase() === "s:for")
    return new Js.For(
      attr("key") ?? "ctx",
      "of",
      new Js.Reference(attr("subject")?.replace(":", "") ?? ""),
      InsertChildren(element.childNodes)
    );

  if (element.tagName.toLowerCase() === "s:use")
    return new Js.Block(
      new Js.Declare(
        "const",
        attr("as") ?? "",
        new Js.Reference(attr("get")?.replace(":", "") ?? "")
      ),
      InsertChildren(element.childNodes)
    );

  if (element.tagName.toLowerCase() === "s:text")
    return new Js.Call(
      new Js.Access("push", new Js.Reference("result")),
      new Js.Reference(attr("use")?.replace(":", "") ?? "")
    );

  return new Js.Call(
    new Js.Access("push", new Js.Reference("result")),
    new Js.Object({
      tag: new Js.String(element.tagName.toLowerCase()),
      attr: InsertAttributes(element.attributes),
      handlers: InsertHandlers(element.attributes),
      ...(attr("s:ref")
        ? {
            ref: new Js.Reference(attr("s:ref") ?? ""),
          }
        : {}),
      ...(attr("s:vdom")
        ? {
            vdom: new Js.String(attr("s:vdom") ?? ""),
          }
        : {}),
      children: new Js.Call(
        new Js.Function(
          [],
          "arrow",
          undefined,
          new Js.Block(
            new Js.Declare("const", "result", new Js.Array()),
            InsertChildren(element.childNodes),
            new Js.Return(new Js.Reference("result"))
          )
        )
      ),
    })
  );
}

function InsertText(text: Dom.Text) {
  if (text.textContent.trim())
    return new Js.Call(
      new Js.Access("push", new Js.Reference("result")),
      new Js.String(text.textContent.trim().replaceAll("\n", " "))
    );
}

function IsElement(node: Dom.Node): node is Dom.Element {
  return node.nodeType === node.ELEMENT_NODE;
}

function IsText(node: Dom.Node): node is Dom.Text {
  return node.nodeType === node.TEXT_NODE;
}

function HasValue<T>(node: T | null | undefined): node is T {
  return !!node;
}

function InsertNode(node: Dom.Node) {
  if (IsElement(node)) return InsertElement(node);
  else if (IsText(node)) return InsertText(node);
}

function InsertChildren(children: Dom.NodeList): Js.Any {
  return new Js.Block(
    ...[...children].map((c) => InsertNode(c)).filter(HasValue)
  );
}

export default function Compile(data: Dom.HTMLDocument) {
  if (data.body.childNodes.length === 0)
    return new Js.Function(
      [],
      "arrow",
      undefined,
      new Js.Block(
        new Js.Return(
          new Js.Array(
            new Js.Object({
              tag: new Js.String("slot"),
              attr: new Js.Object({}),
              handlers: new Js.Object({}),
              children: new Js.Array(),
            })
          )
        )
      )
    );

  return new Js.Function(
    [],
    "arrow",
    undefined,
    new Js.Block(
      new Js.Declare("const", "result", new Js.Array()),
      InsertChildren(data.body.childNodes),
      new Js.Return(new Js.Reference("result"))
    )
  );
}
