import { Ast } from "../types/ast.ts";
import EventManager from "./event-manager.ts";
import { RenderElement, RenderText } from "./html.ts";

function IsElement(node: Node): node is HTMLElement {
  return node.nodeType === node.ELEMENT_NODE;
}

function IsText(node: Node): node is Text {
  return node.nodeType === node.TEXT_NODE;
}

function RemoveChildrenFrom(element: HTMLElement | ShadowRoot, index: number) {
  if (element.childNodes.length < index) return;
  for (let i = element.childNodes.length - 1; i >= index; i--)
    element.childNodes[i].remove();
}

function MergeText(
  next: Ast.Html.Text,
  target: Node | null,
  parent: ShadowRoot | HTMLElement
) {
  if (!target) parent.append(RenderText(next));
  else if (!IsText(target)) parent.replaceChild(RenderText(next), target);
  else target.textContent = next;
}

function MergeElement(
  next: Ast.Html.Element,
  target: Node | null,
  parent: ShadowRoot | HTMLElement
) {
  if (!target) parent.append(RenderElement(next));
  else if (
    !IsElement(target) ||
    target.tagName.toLowerCase() !== next.tag.toLowerCase()
  )
    parent.replaceChild(RenderElement(next), target);
  else {
    for (const key in next.attr) {
      const value = next.attr[key];
      const existing = target.getAttribute(key);
      if (existing !== value) target.setAttribute(key, value);
    }

    for (let i = target.attributes.length - 1; i >= 0; i--) {
      const attr: Attr | null = target.attributes.item(i);
      if (!attr) continue;
      if (!(attr.name in next.attr)) target.removeAttribute(attr.name);
    }

    const manager = new EventManager(target);
    for (const key in next.handlers) manager.Add(key, next.handlers[key]);

    RemoveChildrenFrom(target, next.children.length);

    for (let i = 0; i < next.children.length; i++) {
      const item = next.children[i];
      const existing = target.childNodes[i];
      MergeNode(item, existing, target);
    }
  }
}

function MergeNode(
  next: Ast.Html.Node,
  target: Node | null,
  parent: ShadowRoot | HTMLElement
) {
  if (typeof next === "object") MergeElement(next, target, parent);
  else MergeText(next, target, parent);
}

export default function HydrateFrom(
  updated: Ast.Html.Dom,
  css: string,
  root: ShadowRoot
) {
  for (let i = 0; i < updated.length; i++) {
    const item = updated[i];
    const existing = root.childNodes[i];
    MergeNode(item, existing, root);
  }

  const styles = root.childNodes[updated.length];
  if (!styles) {
    const input = document.createElement("style");
    input.innerHTML = css;
    root.append(input);
  } else if (!(styles instanceof HTMLStyleElement)) {
    const input = document.createElement("style");
    input.innerHTML = css;
    root.replaceChild(input, styles);
  } else if (styles.innerHTML !== css) {
    styles.innerHTML = css;
  }

  RemoveChildrenFrom(root, updated.length + 1);
}
