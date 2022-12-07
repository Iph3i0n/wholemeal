import CssAst from "./tokeniser.ts";
import {
  AtBlock,
  AtStatement,
  Block,
  For,
  FunctionCall,
  If,
  Property,
  Rule,
  Use,
} from "./types.ts";

function ParseValue(value: string) {
  if (!value) return '""';
  if (value.startsWith('":')) return value.substring(2, value.length - 1);
  return `"${value.replaceAll('"', '\\"')}"`;
}

function ParseProperty(
  prop: Property | FunctionCall,
  media: string | undefined
) {
  if ("id" in prop) {
    return `["${prop.id}", ${ParseValue(prop.value)}, ${media ?? "undefined"}]`;
  }

  return `...${prop.name}(${[...prop.args].join(",")})`;
}

function ParseDeclarations(
  declarations: Iterable<Property | FunctionCall>,
  media: string | undefined
) {
  return `[${[...declarations].map((d) => ParseProperty(d, media))}]`;
}
function InsertAtStatement(value: AtStatement): Array<string> {
  return [
    `{ rule: "${value.variant}", statement: ${ParseValue(value.value)} }`,
  ];
}

function InsertAtBlock(value: AtBlock, _: string | undefined): Array<string> {
  const query = ParseValue(value.query);
  if (value.variant !== "media")
    return [
      `{
          variant: "${value.variant}",
          query: ${query},
          children: [
              ${[...value.children]
                .flatMap((r) => ParseBlock(r, query))
                .join(",")}
          ] 
        }`,
    ];
  return [...value.children]
    .flatMap((r) => ParseBlock(r, query))
    .filter((r) => r) as Array<string>;
}

function InsertRule(value: Rule, media: string | undefined): Array<string> {
  return [
    `{
        selector: ${ParseValue(value.selector)},
        properties: ${ParseDeclarations(value.children, media)}
    }`,
  ];
}

function InsertFor(value: For, media: string | undefined): Array<string> {
  const statement =
    value.accessor === "of" ? value.subject : `Object.keys(${value.subject})`;
  const rules = [...value.children].flatMap((r) => ParseBlock(r, media));
  return [`...(${statement}.flatMap((${value.key}) => [${rules.join(",")}]))`];
}

function InsertIf(value: If, media: string | undefined): Array<string> {
  const rules = [...value.children].flatMap((r) => ParseBlock(r, media));
  return [`...(${value.check} ? [${rules.join(",")}] : [])`];
}

function InsertUse(value: Use, media: string | undefined): Array<string> {
  const rules = [...value.children].flatMap((r) => ParseBlock(r, media));
  return [`...((${value.key}) => [${rules.join(",")}])(${value.subject})`];
}

function ParseBlock(item: Block, media: string | undefined) {
  switch (item.type) {
    case "at-statement":
      return InsertAtStatement(item);
    case "at-block":
      return InsertAtBlock(item, media);
    case "for":
      return InsertFor(item, media);
    case "if":
      return InsertIf(item, media);
    case "rule":
      return InsertRule(item, media);
    case "use":
      return InsertUse(item, media);
  }
}

export default function Compile(data: string) {
  const result: Array<string> = [];
  for (const block of CssAst(data))
    result.push(...ParseBlock(block, undefined));

  return "[" + result.join(",") + "]";
}
