import * as Js from "../writer/mod.js";

const NodeSymbol = Symbol();

export default abstract class Node {
  get Symbol() {
    return NodeSymbol;
  }

  abstract readonly JavaScript: Js.Any;
}
