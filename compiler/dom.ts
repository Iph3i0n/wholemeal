import { Dom } from "../deps.ts";
import { BuildFunction, CompilerLine, CompilerProperty } from "./builder.ts";

function InsertAttributes(map: Dom.NamedNodeMap): CompilerProperty {
  const array_data = [];
  for (let i = 0; i < map.length; i++) {
    const item = map.item(i);
    if (item && !item.name.startsWith("on:") && !item.name.startsWith("s:"))
      array_data.push(item);
  }

  return {
    type: "object",
    data: array_data.reduce(
      (c, n) => ({
        ...c,
        [n.name]: {
          type: n.value.startsWith(":") ? "computed" : "string",
          data: n.value.startsWith(":") ? n.value.replace(":", "") : n.value,
        },
      }),
      {} as Record<string, CompilerProperty>
    ),
  };
}

function InsertHandlers(map: Dom.NamedNodeMap): CompilerProperty {
  const array_data = [];
  for (let i = 0; i < map.length; i++) {
    const item = map.item(i);
    if (item && item.name.startsWith("on:")) array_data.push(item);
  }

  return {
    type: "object",
    data: array_data.reduce(
      (c, n) => ({
        ...c,
        [n.name.replace("on:", "")]: {
          type: "call",
          args: [{ type: "computed", data: n.value }],
          definition: { type: "computed", data: "handle" },
        },
      }),
      {} as Record<string, CompilerProperty>
    ),
  };
}

function InsertElement(element: Dom.Element): Array<CompilerLine> {
  const attr = (key: string) => element.getAttribute(key);
  if (element.tagName.toLowerCase() === "s:if")
    return [
      {
        type: "if",
        check: {
          type: "computed",
          data: attr("check")?.replace(":", "") ?? "",
        },
        data: InsertChildren(element.childNodes),
      },
    ];

  if (element.tagName.toLowerCase() === "s:for")
    return [
      {
        type: "for",
        key: attr("key") ?? "ctx",
        value: {
          type: "computed",
          data: attr("subject")?.replace(":", "") ?? "",
        },
        accessor: "of",
        data: InsertChildren(element.childNodes),
      },
    ];

  if (element.tagName.toLowerCase() === "s:use")
    return [
      {
        type: "spread-insert",
        data: {
          type: "call",
          args: [
            { type: "computed", data: attr("get")?.replace(":", "") ?? "" },
          ],
          definition: {
            type: "function",
            args: attr("as") ?? "",
            data: InsertChildren(element.childNodes),
          },
        },
      },
    ];

  if (element.tagName.toLowerCase() === "s:text")
    return [
      {
        type: "insert",
        data: { type: "computed", data: attr("use")?.replace(":", "") ?? "" },
      },
    ];

  return [
    {
      type: "insert",
      data: {
        type: "object",
        data: {
          tag: { type: "string", data: element.tagName.toLowerCase() },
          attr: InsertAttributes(element.attributes),
          handlers: InsertHandlers(element.attributes),
          children: {
            type: "call",
            args: [],
            definition: {
              type: "function",
              data: InsertChildren(element.childNodes),
            },
          },
          ...(attr("s:ref")
            ? {
                ref: { type: "computed", data: attr("s:ref") ?? "" },
              }
            : {}),
        },
      },
    },
  ];
}

function InsertText(text: Dom.Text): Array<CompilerLine> {
  if (text.textContent.trim())
    return [
      {
        type: "insert",
        data: {
          type: "string",
          data: text.textContent.trim().replaceAll("\n", " "),
        },
      },
    ];

  return [];
}

function IsElement(node: Dom.Node): node is Dom.Element {
  return node.nodeType === node.ELEMENT_NODE;
}

function IsText(node: Dom.Node): node is Dom.Text {
  return node.nodeType === node.TEXT_NODE;
}

function InsertNode(node: Dom.Node): Array<CompilerLine> {
  if (IsElement(node)) return InsertElement(node);
  else if (IsText(node)) return InsertText(node);

  return [];
}

function InsertChildren(children: Dom.NodeList): Array<CompilerLine> {
  const result = [];
  for (const node of children) result.push(...InsertNode(node));

  return result;
}

export default function Compile(data: Dom.HTMLDocument) {
  // if (data.body.childNodes.length === 0)
  //   return `() => [{ tag: "slot", attr: {}, handlers: {}, children: [] }]`;
  // return InsertChildren(data.body.childNodes);

  if (data.body.childNodes.length === 0)
    return BuildFunction({
      type: "function",
      data: [
        {
          type: "insert",
          data: {
            type: "object",
            data: {
              tag: { type: "string", data: "slot" },
              attr: { type: "object", data: {} },
              handlers: { type: "object", data: {} },
              children: { type: "array", data: [] },
            },
          },
        },
      ],
    });

  return BuildFunction({
    type: "function",
    data: InsertChildren(data.body.childNodes),
  });
}
