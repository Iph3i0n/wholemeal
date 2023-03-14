import { Ast } from "../types/ast.ts";
import EventManager from "./event-manager.ts";
import { RenderChildren, RenderText } from "./html.ts";

abstract class VirtualNode<TNode extends Ast.Html.Node> {
  node: TNode;
  children: Array<VirtualNode<Ast.Html.Node>> = [];

  constructor(node: TNode) {
    this.node = node;
  }

  abstract CanMerge(node: Ast.Html.Node): boolean;
  abstract Merge(node: Ast.Html.Node): void;
  abstract readonly Node: Node;
  abstract Delete(): void;
}

const create_input = (proposed: Ast.Html.Node) =>
  proposed == null
    ? new EmptyNode(proposed)
    : typeof proposed === "string"
    ? new VirtualText(proposed)
    : new VirtualElement(proposed);

class EmptyNode extends VirtualNode<null> {
  readonly #node = document.createComment("Empty Node");

  CanMerge(_: Ast.Html.Node): boolean {
    return false;
  }

  Merge(_: Ast.Html.Node): void {
    throw new Error("Method not implemented.");
  }

  get Node(): Node {
    return this.#node;
  }

  Delete(): void {}
}

class VirtualElement extends VirtualNode<Ast.Html.Element> {
  #element: HTMLElement;

  constructor(node: Ast.Html.Element) {
    super(node);

    const result = document.createElement(node.tag);
    for (const key in node.attr)
      if (node.attr[key] != null)
        if (
          typeof node.attr[key] === "string" ||
          typeof node.attr[key] === "boolean"
        )
          result.setAttribute(key, node.attr[key]);
        // deno-lint-ignore no-explicit-any
        else if (key in result) (result as any)[key] = node.attr[key];
        else
          console.warn(
            `Attribute ${key} is not a string or boolean type and has no setter so the value is being ignored.`
          );

    const manager = new EventManager(result);
    for (const key in node.handlers) manager.Add(key, node.handlers[key]);

    if (node.ref) node.ref.current = result;

    if (node.vdom === "ignore") result.replaceChildren(...RenderChildren(node));
    else
      for (const child of node.children) {
        const input = create_input(child);
        result.append(input.Node);
        this.children.push(input);
      }

    this.#element = result;
  }

  override CanMerge(node: Ast.Html.Node): boolean {
    if (!node || typeof node === "string") return false;

    return this.node.tag === node.tag;
  }

  override Merge(next: Ast.Html.Node): void {
    if (!next || typeof next === "string" || next.tag !== this.node.tag)
      throw new Error("Attempt to merge an invalid node");

    for (const key in next.attr) {
      const value = next.attr[key];
      const existing = this.#element.getAttribute(key);
      if (existing !== value)
        if (value != null) this.#element.setAttribute(key, value);
        else this.#element.removeAttribute(key);
    }

    for (let i = this.#element.attributes.length - 1; i >= 0; i--) {
      const attr: Attr | null = this.#element.attributes.item(i);
      if (!attr) continue;
      if (!(attr.name in next.attr)) this.#element.removeAttribute(attr.name);
    }

    const manager = new EventManager(this.#element);
    for (const key in next.handlers) manager.Add(key, next.handlers[key]);

    for (let i = this.children.length - 1; i >= next.children.length; i--) {
      if (!this.children[i]) continue;
      this.children[i].Delete();
      delete this.children[i];
    }

    for (let i = 0; i < next.children.length; i++) {
      const current = this.children[i];
      const proposed = next.children[i];
      if (!current) {
        const input = create_input(proposed);
        this.#element.append(input.Node);
        this.children.push(input);
      } else if (!current.CanMerge(proposed)) {
        const input = create_input(proposed);
        this.#element.replaceChild(input.Node, current.Node);
        this.children[i] = input;
      } else {
        current.Merge(proposed);
      }
    }
  }

  override get Node() {
    return this.#element;
  }

  override Delete(): void {
    this.#element?.remove();
  }
}

class VirtualText extends VirtualNode<Ast.Html.Text> {
  #node: Text;

  constructor(node: Ast.Html.Text) {
    super(node);

    this.#node = RenderText(node);
  }

  CanMerge(node: Ast.Html.Node): boolean {
    return typeof node === "string";
  }

  Merge(node: Ast.Html.Node): void {
    if (typeof node !== "string")
      throw new Error("Attempt to merge an invalid node");
    this.#node.textContent = node;
  }

  override get Node() {
    return this.#node;
  }

  Delete(): void {
    this.#node?.remove();
  }
}

export default class VirtualDom {
  #root: ShadowRoot;
  #children: Array<VirtualNode<Ast.Html.Node>> = [];

  constructor(root: ShadowRoot) {
    this.#root = root;
  }

  Merge(data: Ast.Html.Dom) {
    for (let i = this.#children.length - 1; i >= data.length; i--) {
      if (!this.#children[i]) continue;
      this.#children[i]?.Delete();
      delete this.#children[i];
    }

    for (let i = 0; i < data.length; i++) {
      const current = this.#children[i];
      const proposed = data[i];
      if (!current) {
        const input = create_input(proposed);
        this.#root.append(input.Node);
        this.#children.push(input);
      } else if (!current.CanMerge(proposed)) {
        const input = create_input(proposed);
        this.#root.replaceChild(input.Node, current.Node);
        this.#children[i] = input;
      } else {
        current.Merge(proposed);
      }
    }
  }
}
