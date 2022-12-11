import { Ast } from "../types/ast.ts";
import HandlerStore from "./handler-store.ts";

export function RenderElement(element: Ast.Html.Element) {
  const result = document.createElement(element.tag);
  for (const key in element.attr)
    if (element.attr[key] !== undefined)
      result.setAttribute(key, element.attr[key]);
  const store = new HandlerStore(result);
  for (const key in element.handlers) store.add(key, element.handlers[key]);

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
