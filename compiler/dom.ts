import { Dom } from "../deps.ts";
import AccessWriter from "../writer/access.ts";
import ArrayWriter from "../writer/array.ts";
import BaseWriter from "../writer/base.ts";
import BlockWriter from "../writer/block.ts";
import CallWriter from "../writer/call.ts";
import DeclareWriter from "../writer/declare.ts";
import ForWriter from "../writer/for.ts";
import FunctionWriter from "../writer/function.ts";
import IfWriter from "../writer/if.ts";
import ObjectWriter from "../writer/object.ts";
import ReferenceWriter from "../writer/reference.ts";
import ReturnWriter from "../writer/return.ts";
import StringWriter from "../writer/string.ts";

function InsertAttributes(map: Dom.NamedNodeMap) {
  const array_data = [];
  for (let i = 0; i < map.length; i++) {
    const item = map.item(i);
    if (item && !item.name.startsWith("on:") && !item.name.startsWith("s:"))
      array_data.push(item);
  }

  return new ObjectWriter(
    array_data.reduce(
      (c, n) => ({
        ...c,
        [n.name]: n.value.startsWith(":")
          ? new ReferenceWriter(n.value.replace(":", ""))
          : new StringWriter(n.value),
      }),
      {} as Record<string, BaseWriter>
    )
  );
}

function InsertHandlers(map: Dom.NamedNodeMap) {
  const array_data = [];
  for (let i = 0; i < map.length; i++) {
    const item = map.item(i);
    if (item && item.name.startsWith("on:")) array_data.push(item);
  }

  return new ObjectWriter(
    array_data.reduce(
      (c, n) => ({
        ...c,
        [n.name.replace("on:", "")]: new CallWriter(
          new ReferenceWriter("handle"),
          new ReferenceWriter(n.value)
        ),
      }),
      {} as Record<string, BaseWriter>
    )
  );
}

function InsertElement(element: Dom.Element) {
  const attr = (key: string) => element.getAttribute(key);
  if (element.tagName.toLowerCase() === "s:if")
    return new IfWriter(
      new ReferenceWriter(attr("check")?.replace(":", "") ?? ""),
      InsertChildren(element.childNodes)
    );

  if (element.tagName.toLowerCase() === "s:for")
    return new ForWriter(
      attr("key") ?? "ctx",
      "of",
      new ReferenceWriter(attr("subject")?.replace(":", "") ?? ""),
      InsertChildren(element.childNodes)
    );

  if (element.tagName.toLowerCase() === "s:use")
    return new BlockWriter(
      new DeclareWriter(
        "const",
        attr("as") ?? "",
        new ReferenceWriter(attr("get")?.replace(":", "") ?? "")
      ),
      InsertChildren(element.childNodes)
    );

  if (element.tagName.toLowerCase() === "s:text")
    return new CallWriter(
      new AccessWriter("push", new ReferenceWriter("result")),
      new ReferenceWriter(attr("use")?.replace(":", "") ?? "")
    );

  return new CallWriter(
    new AccessWriter("push", new ReferenceWriter("result")),
    new ObjectWriter({
      tag: new StringWriter(element.tagName.toLowerCase()),
      attr: InsertAttributes(element.attributes),
      handlers: InsertHandlers(element.attributes),
      ...(attr("s:ref")
        ? {
            ref: new ReferenceWriter(attr("s:ref") ?? ""),
          }
        : {}),
      ...(attr("s:vdom")
        ? {
            vdom: new StringWriter(attr("s:vdom") ?? ""),
          }
        : {}),
      children: new CallWriter(
        new FunctionWriter(
          [],
          "arrow",
          undefined,
          new BlockWriter(
            new DeclareWriter("const", "result", new ArrayWriter()),
            InsertChildren(element.childNodes),
            new ReturnWriter(new ReferenceWriter("result"))
          )
        )
      ),
    })
  );
}

function InsertText(text: Dom.Text) {
  if (text.textContent.trim())
    return new CallWriter(
      new AccessWriter("push", new ReferenceWriter("result")),
      new StringWriter(text.textContent.trim().replaceAll("\n", " "))
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

function InsertChildren(children: Dom.NodeList): BaseWriter {
  return new BlockWriter(
    ...[...children].map((c) => InsertNode(c)).filter(HasValue)
  );
}

export default function Compile(data: Dom.HTMLDocument) {
  if (data.body.childNodes.length === 0)
    return new FunctionWriter(
      [],
      "arrow",
      undefined,
      new BlockWriter(
        new ReturnWriter(
          new ArrayWriter(
            new ObjectWriter({
              tag: new StringWriter("slot"),
              attr: new ObjectWriter({}),
              handlers: new ObjectWriter({}),
              children: new ArrayWriter(),
            })
          )
        )
      )
    );

  return new FunctionWriter(
    [],
    "arrow",
    undefined,
    new BlockWriter(
      new DeclareWriter("const", "result", new ArrayWriter()),
      InsertChildren(data.body.childNodes),
      new ReturnWriter(new ReferenceWriter("result"))
    )
  );
}
