import StringIterator from "./string-iterator.ts";
import {
  AtBlock,
  AtStatement,
  Block,
  FunctionCall,
  Property,
} from "./types.ts";
import { Assert, IsOneOf } from "../../deps.ts";

function Occurences(data: string, search: string) {
  const iterator = new StringIterator(data);
  let count = 0;
  while (!iterator.Done) {
    const result = iterator.GetUntil(search, true);
    if (result.endsWith(search)) count++;
  }

  return count;
}

function FlattenWhitespace(data: string) {
  return data
    .split(/\s/)
    .filter((d) => d.trim())
    .join(" ");
}

function* Split(data: string) {
  const iterator = new StringIterator(data);
  while (!iterator.Done) {
    const preamble = iterator.GetUntil("{");
    const preamble_parts = preamble.split(";");
    if (preamble_parts.length > 1)
      for (let i = 0; i < preamble_parts.length - 1; i++)
        yield preamble_parts[i].trim();

    const selector = preamble_parts[preamble_parts.length - 1].trim();
    if (iterator.Done) yield selector;

    let block_data = "{" + iterator.GetUntil("}", true);
    while (Occurences(block_data, "{") !== Occurences(block_data, "}"))
      block_data += iterator.GetUntil("}", true);

    yield selector + block_data;
  }
}

function ParseProperty(data: string): Property | FunctionCall {
  if (data.trim().match(/^[a-zA-Z]+\(/gm)) {
    const iterator = new StringIterator(data.trim());
    const name = iterator.GetUntil("(");
    const args: Array<string> = [];
    while (!iterator.Done) {
      let next = iterator.GetUntil(",");
      if (next.endsWith(")")) next = next.substring(0, next.length - 1);
      if (next.trim()) args.push(next.trim());
    }

    return { name, args };
  }

  const [id, ...value] = data.split(":");
  return { id: id.trim(), value: value.join(":").trim() };
}

function ProcessAtBlock(data: AtBlock): Block {
  switch (data.variant) {
    case "if": {
      return {
        type: "if",
        check: data.query.substring(2, data.query.length - 1),
        children: data.children,
      };
    }
    case "for": {
      const statement = data.query.substring(2, data.query.length - 1);
      const [key, a, js] = statement.split(/( of | in )/gm);
      const accessor = a.trim();
      Assert(IsOneOf("in", "of"), accessor);

      return {
        type: "for",
        key,
        accessor,
        subject: js,
        children: data.children,
      };
    }
    case "use": {
      const statement = data.query.substring(2, data.query.length - 1);
      const [key, ...js] = statement.split("=");

      return {
        type: "use",
        key: key.trim(),
        subject: js.join("=").trim(),
        children: data.children,
      };
    }
    default:
      return data;
  }
}

function ParseBlock(data: string): Block {
  const start_iterator = new StringIterator(data.substring(0, data.length - 1));
  const preamble = start_iterator.GetUntil("{");
  const remaining = start_iterator.GetUntil("IMPOSSIBLE");
  if (preamble.trim().startsWith("@")) {
    const iterator = new StringIterator(preamble);
    const variant = iterator.GetUntil(" ").trim().replace("@", "");
    const query = iterator.GetUntil("IMPOSSIBLE").trim();
    return ProcessAtBlock({
      type: "at-block",
      variant,
      query,
      children: CssAst(remaining),
    });
  }

  if (Occurences(remaining, "{") > 0)
    throw new Error("Invalid rule of " + data);

  return {
    type: "rule",
    selector: preamble,
    children: remaining
      .split(";")
      .filter((r) => r.trim())
      .map(ParseProperty),
  };
}

function ParseStatement(data: string): AtStatement {
  if (!data.startsWith("@")) throw new Error("Invalid statement of " + data);
  const iterator = new StringIterator(data);
  const variant = iterator.GetUntil(" ").trim();
  const value = iterator.GetUntil("IMPOSSIBLE").trim();

  return { type: "at-statement", variant, value };
}

export default function* CssAst(data: string): Iterable<Block> {
  for (const part of Split(FlattenWhitespace(data)))
    if (Occurences(part, "{") > 0) yield ParseBlock(part);
    else yield ParseStatement(part);
}
