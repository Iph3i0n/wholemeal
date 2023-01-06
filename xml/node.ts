import * as Js from "../writer/mod.ts";

const NodeSymbol = Symbol();

export default abstract class Node {
  get Symbol() {
    return NodeSymbol;
  }

  abstract readonly JavaScript: Js.Any;
}
