import { Dom } from "../deps.ts";

function InsertAttributes(map: Dom.NamedNodeMap) {
  const array_data = [];
  for (let i = 0; i < map.length; i++) {
    const item = map.item(i);
    if (item && !item.name.startsWith("on:")) array_data.push(item);
  }

  const result = array_data
    .map((a) =>
      a.value.startsWith(":")
        ? `"${a.name}": ${a.value.replace(":", "")}`
        : `"${a.name}": "${a.value}"`
    )
    .join(",");

  return "{" + result + "}";
}

function InsertHandlers(map: Dom.NamedNodeMap) {
  const array_data = [];
  for (let i = 0; i < map.length; i++) {
    const item = map.item(i);
    if (item && item.name.startsWith("on:")) array_data.push(item);
  }

  const result = array_data
    .map((a) => `"${a.name.replace("on:", "")}": handle(${a.value})`)
    .join(",");

  return "{" + result + "}";
}

function InsertElement(element: Dom.Element): string {
  const attr = (key: string) => element.getAttribute(key);
  if (element.tagName.toLowerCase() === "s:if")
    return `...(${attr("check")?.replace(":", "")} ? ${InsertChildren(
      element.childNodes
    )} : [])`;

  if (element.tagName.toLowerCase() === "s:for")
    return `...${attr("subject")?.replace(":", "")}.flatMap((${
      attr("key") ?? "ctx"
    }) => (${InsertChildren(element.childNodes)}))`;

  if (element.tagName.toLowerCase() === "s:use")
    return `...((${attr("as")}) => (${InsertChildren(
      element.childNodes
    )}))(${attr("get")?.replace(":", "")})`;

  if (element.tagName.toLowerCase() === "s:text")
    return attr("use")?.replace(":", "") ?? "";

  return `{
    tag: "${element.tagName.toLowerCase()}",
    attr: ${InsertAttributes(element.attributes)},
    handlers: ${InsertHandlers(element.attributes)},
    children: ${InsertChildren(element.childNodes)}
  }`;
}

function InsertText(text: Dom.Text) {
  if (text.textContent.trim())
    return `"${text.textContent.trim().replaceAll("\n", " ")}"`;
  return undefined;
}

function IsElement(node: Dom.Node): node is Dom.Element {
  return node.nodeType === node.ELEMENT_NODE;
}

function IsText(node: Dom.Node): node is Dom.Text {
  return node.nodeType === node.TEXT_NODE;
}

function InsertNode(node: Dom.Node) {
  if (IsElement(node)) return InsertElement(node);
  else if (IsText(node)) return InsertText(node);

  return undefined;
}

function InsertChildren(children: Dom.NodeList) {
  const result = [];
  for (const node of children) result.push(InsertNode(node));

  return "[" + result.filter((r) => r).join(",") + "]";
}

export default function Compile(data: Dom.HTMLDocument) {
  if (data.body.childNodes.length === 0)
    return `{ tag: "slot", attr: {}, handlers: {}, children: [] }`;
  return InsertChildren(data.body.childNodes);
}
