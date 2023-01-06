import * as Js from "../writer/mod.ts";

export abstract class PssBlock {
  abstract readonly JavaScript: Array<Js.Any>;
}
