import BaseWriter from "../writer/base.ts";

export abstract class PssBlock {
  abstract readonly JavaScript: Array<BaseWriter>;
}
