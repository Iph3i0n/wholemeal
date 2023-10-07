import * as Js from "../writer/mod";
import Code from "./code";
import Node from "./node";

export default class Text extends Node {
  readonly #data: string;

  constructor(code: Code) {
    super();
    let result = "";
    while (!code.Done && !code.IsKeyword) {
      result += code.Current;
      code.Continue();
    }

    this.#data = result;
  }

  get JavaScript() {
    return new Js.Call(
      new Js.Access("push", new Js.Reference("result")),
      new Js.String(this.#data.trim())
    );
  }

  get TextContent() {
    return this.#data;
  }
}
