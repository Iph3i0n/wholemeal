import Code from "../compiler-utils/code-transform.ts";
import ArrayWriter from "../writer/array.ts";
import BaseWriter from "../writer/base.ts";
import BlockWriter from "../writer/block.ts";
import DeclareWriter from "../writer/declare.ts";
import FunctionWriter from "../writer/function.ts";
import ReferenceWriter from "../writer/reference.ts";
import ReturnWriter from "../writer/return.ts";
import { PssAtBlock } from "./at-block.ts";
import { PssAtStatement } from "./at-statement.ts";
import { PssForBlock } from "./for-block.ts";
import { PssIfBlock } from "./if-block.ts";
import { PssInsertStatement } from "./insert-statement.ts";
import { PssJsStatement } from "./js-statement.ts";
import { PssMediaQuery } from "./media-query.ts";
import { PssRule } from "./rule.ts";

export default class Sheet {
  readonly #data: Code;
  readonly #media: BaseWriter | undefined;

  constructor(data: string, media?: BaseWriter) {
    this.#data = new Code(data);
    this.#media = media;
  }

  *#parts() {
    for (const part of this.#data)
      if (PssRule.IsValid(part)) yield new PssRule(part, this.#media);
      else if (PssMediaQuery.IsValid(part)) yield new PssMediaQuery(part);
      else if (PssIfBlock.IsValid(part))
        yield new PssIfBlock(part, this.#media);
      else if (PssForBlock.IsValid(part))
        yield new PssForBlock(part, this.#media);
      else if (PssAtBlock.IsValid(part))
        yield new PssAtBlock(part, this.#media);
      else if (PssJsStatement.IsValid(part)) yield new PssJsStatement(part);
      else if (PssInsertStatement.IsValid(part))
        yield new PssInsertStatement(part);
      else if (PssAtStatement.IsValid(part)) yield new PssAtStatement(part);
      else throw new Error("Invalid part of \n" + part);
  }

  get JavaScript() {
    return new FunctionWriter(
      [],
      "arrow",
      undefined,
      new BlockWriter(
        new DeclareWriter("const", "result", new ArrayWriter()),
        ...this.InlineJavaScript,
        new ReturnWriter(new ReferenceWriter("result"))
      )
    );
  }

  get InlineJavaScript(): Array<BaseWriter> {
    return [...this.#parts()].flatMap((p) => p.JavaScript);
  }
}
