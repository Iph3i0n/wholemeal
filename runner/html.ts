import { Ast } from "../types/ast.ts";

export function RenderElement(element: Ast.Html.Element) {
  const result = document.createElement(element.tag);
  for (const key in element.attr)
    if (element.attr[key] !== undefined)
      result.setAttribute(key, element.attr[key]);
  for (const key in element.handlers)
    result.addEventListener(key, element.handlers[key]);

  result.append(...element.children.map(RenderNode));
  return result;
}

export function RenderText(element: Ast.Html.Text) {
  return document.createTextNode(element);
}

export function RenderNode(node: Ast.Html.Node) {
  if (typeof node === "string") return RenderText(node);
  return RenderElement(node);
}

export default function RenderDom(dom: Ast.Html.Dom) {
  return dom.map(RenderNode);
}
