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

  return `...${prop.name}(${[...prop.args].join(",")}).map(
    ([type, value, media]) => [
      type,
      value,
      media
        ? media + ${media ? '" and " +' + media : '""'}
        : ${media ? media : "undefined"}
  ])`;
}

function ParseDeclarations(
  declarations: Iterable<Property | FunctionCall>,
  media: string | undefined
) {
  return `[${[...declarations].map((d) => ParseProperty(d, media))}]`;
}
function InsertAtStatement(value: AtStatement): Array<string> {
  if (value.variant === "@insert")
    return [`result.push(...require("${value.value}"))`];
  if (value.variant === "@require") {
    const [path, name] = value.value.split(" as ");
    return [`const ${name} = require("${path}");`];
  }

  return [
    `result.push({
      rule: "${value.variant}",
      statement: ${ParseValue(value.value)}
    })`,
  ];
}

function InsertAtBlock(
  value: AtBlock,
  existing: string | undefined
): Array<string> {
  const query = ParseValue(value.query);
  if (value.variant !== "media")
    return [
      `result.push({
          variant: "${value.variant}",
          query: ${query},
          children: ${BuildBlocks(value.children, existing)} 
        })`,
    ];
  return [...value.children]
    .flatMap((r) =>
      ParseBlock(r, existing ? existing + " and " + query : query)
    )
    .filter((r) => r) as Array<string>;
}

function InsertRule(value: Rule, media: string | undefined): Array<string> {
  return [
    `result.push({
        selector: ${ParseValue(value.selector)},
        properties: ${ParseDeclarations(value.children, media)}
    })`,
  ];
}

function InsertFor(value: For, media: string | undefined): Array<string> {
  return [
    `for (const ${value.key} ${value.accessor} ${value.subject})
      result.push(...${BuildBlocks(value.children, media)});`,
  ];
}

function InsertIf(value: If, media: string | undefined): Array<string> {
  return [
    `if (${value.check}) result.push(...${BuildBlocks(value.children, media)})`,
  ];
}

function InsertUse(value: Use, media: string | undefined): Array<string> {
  return [
    `result.push(
      ...${BuildBlocks(value.children, media, {
        name: value.key,
        value: value.subject,
      })}
    )`,
  ];
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

function BuildBlocks(
  data: Iterable<Block>,
  media: string | undefined,
  args?: { name: string; value: string }
) {
  const result: Array<string> = [];
  for (const block of data) result.push(...ParseBlock(block, media));

  return `((${args?.name ?? ""}) => {
    const result = [];
    ${result.join("\n")}
    return result;
  })(${args?.value ?? ""})`;
}

export default function Compile(data: string) {
  return BuildBlocks(CssAst(data), undefined);
}
