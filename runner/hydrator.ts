import HandlerStore from "./handler-store.ts";

function IsElement(node: Node): node is HTMLElement {
  return node.nodeType === node.ELEMENT_NODE;
}

function IsText(node: Node): node is Text {
  return node.nodeType === node.TEXT_NODE;
}

function clone(node: Node) {
  if (!(node instanceof HTMLElement)) return node.cloneNode(true);
  const result = node.cloneNode(false) as HTMLElement;
  const store = HandlerStore.GetFor(node);
  store?.move_to(result);
  for (let i = 0; i < node.childNodes.length; i++) {
    const next = node.childNodes[i];
    result.append(clone(next));
  }

  return result;
}

function RemoveChildrenFrom(element: HTMLElement | ShadowRoot, index: number) {
  if (element.childNodes.length < index) return;
  for (let i = element.childNodes.length - 1; i >= index; i--)
    element.childNodes[i].remove();
}

function MergeText(
  next: Text,
  target: Node | null,
  parent: ShadowRoot | HTMLElement
) {
  if (!target) parent.append(clone(next));
  else if (!IsText(target)) parent.replaceChild(clone(next), target);
  else target.textContent = next.textContent;
}

function MergeElement(
  next: HTMLElement,
  target: Node | null,
  parent: ShadowRoot | HTMLElement
) {
  if (!target) parent.append(clone(next));
  else if (!IsElement(target) || target.tagName !== next.tagName)
    parent.replaceChild(clone(next), target);
  else {
    if (target.tagName === "style") {
      target.innerHTML = next.innerHTML;
      return;
    }

    for (let i = 0; i < next.attributes.length; i++) {
      const attr = next.attributes.item(i);
      if (!attr) continue;
      const existing = target.getAttribute(attr.name);
      if (existing !== attr.value) target.setAttribute(attr.name, attr.value);
    }

    for (let i = target.attributes.length - 1; i >= 0; i--) {
      const attr = target.attributes.item(i);
      if (!attr) continue;
      if (!next.attributes.getNamedItem(attr.name))
        target.removeAttribute(attr.name);
    }

    const store = HandlerStore.GetFor(next);
    store?.move_to(target);

    RemoveChildrenFrom(target, next.childNodes.length);

    for (let i = 0; i < next.childNodes.length; i++) {
      const item = next.childNodes[i];
      const existing = target.childNodes[i];
      MergeNode(item, existing, target);
    }
  }
}

function MergeNode(
  next: Node,
  target: Node | null,
  parent: ShadowRoot | HTMLElement
) {
  if (IsElement(next)) MergeElement(next, target, parent);
  else if (IsText(next)) MergeText(next, target, parent);
}

export default function HydrateFrom(updated: Array<Node>, root: ShadowRoot) {
  RemoveChildrenFrom(root, updated.length);
  for (let i = 0; i < updated.length; i++) {
    const item = updated[i];
    const existing = root.childNodes[i];
    MergeNode(item, existing, root);
  }
}
