function IsElement(node: Node): node is HTMLElement {
  return node.nodeType === node.ELEMENT_NODE;
}

function IsText(node: Node): node is Text {
  return node.nodeType === node.TEXT_NODE;
}

function MergeText(
  next: Text,
  target: Node | null,
  parent: ShadowRoot | HTMLElement
) {
  if (!target) parent.append(next);
  else if (!IsText(target)) parent.replaceChild(next, target);
  else {
    const current = next.textContent;
    const existing = target.textContent;
    if (current !== existing) target.textContent = current;
  }
}

function MergeElement(
  next: HTMLElement,
  target: Node | null,
  parent: ShadowRoot | HTMLElement
) {
  if (!target) parent.append(next);
  else if (!IsElement(target) || target.tagName !== next.tagName)
    parent.replaceChild(next, target);
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

    for (let i = 0; i < target.attributes.length; i++) {
      const attr = target.attributes.item(i);
      if (!attr) continue;
      if (!next.attributes.getNamedItem(attr.name))
        target.removeAttribute(attr.name);
    }

    let i = 0;
    for (i; i < next.childNodes.length; i++) {
      const item = next.childNodes[i];
      const existing = target.childNodes[i];
      MergeNode(item, existing, parent);
    }

    for (i; i < target.childNodes.length; i++) {
      target.childNodes[i].remove();
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
  let i = 0;
  for (i; i < updated.length; i++) {
    const item = updated[i];
    const existing = root.childNodes[i];
    MergeNode(item, existing, root);
  }

  for (i; i < root.childNodes.length; i++) {
    root.childNodes[i].remove();
  }
}
