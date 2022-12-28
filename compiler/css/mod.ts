import {
  BuildFunction,
  CompilerComputed,
  CompilerFunction,
  CompilerProperty,
  CompilerString,
  CompilerLine,
} from "../builder.ts";
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

function ParseValue(value: string): CompilerString | CompilerComputed {
  if (!value) return { type: "string", data: "" };
  if (value.startsWith('":'))
    return { type: "computed", data: value.substring(2, value.length - 1) };
  return { type: "string", data: value };
}

function ParseProperty(
  prop: Property | FunctionCall,
  media: CompilerProperty | undefined
): CompilerProperty {
  if ("id" in prop) {
    return {
      type: "array",
      data: [
        { type: "string", data: prop.id },
        ParseValue(prop.value),
        media ?? { type: "computed", data: "undefined" },
      ],
    };
  }

  return {
    type: "object",
    data: {
      properties: {
        type: "call",
        args: [...prop.args].map((a) => ({ type: "computed", data: a })),
        definition: {
          type: "computed",
          data: prop.name,
        },
      },
      ...(media ? { media } : {}),
    },
  };
}

function ParseDeclarations(
  declarations: Iterable<Property | FunctionCall>,
  media: CompilerProperty | undefined
) {
  return [...declarations].map((d) => ParseProperty(d, media));
}

function InsertAtStatement(value: AtStatement): Array<CompilerLine> {
  if (value.variant === "@insert")
    return [
      {
        type: "spread-insert",
        data: {
          type: "call",
          args: [],
          definition: {
            type: "call",
            args: [{ type: "string", data: value.value }],
            definition: { type: "computed", data: "require" },
          },
        },
      },
    ];
  if (value.variant === "@require") {
    const [path, name] = value.value.split(" as ");
    return [
      {
        type: "declare",
        name: name,
        access: "const",
        value: {
          type: "call",
          args: [{ type: "string", data: path }],
          definition: { type: "computed", data: "require" },
        },
      },
    ];
  }

  return [
    {
      type: "insert",
      data: {
        type: "object",
        data: {
          rule: { type: "string", data: value.variant },
          statement: ParseValue(value.value),
        },
      },
    },
  ];
}

function InsertAtBlock(
  value: AtBlock,
  existing: CompilerProperty | undefined
): Array<CompilerLine> {
  const query = ParseValue(value.query);
  if (value.variant !== "media")
    return [
      {
        type: "insert",
        data: {
          type: "object",
          data: {
            variant: { type: "string", data: value.variant },
            query: query,
            children: {
              type: "call",
              args: [],
              definition: BuildBlocks(value.children, existing),
            },
          },
        },
      },
    ];

  return [...value.children]
    .flatMap((r) =>
      ParseBlock(
        r,
        existing
          ? {
              type: "maths",
              data: [existing, "+", '" and "', "+", query],
            }
          : query
      )
    )
    .filter((r) => r);
}

function InsertRule(
  value: Rule,
  media: CompilerProperty | undefined
): Array<CompilerLine> {
  return [
    {
      type: "insert",
      data: {
        type: "object",
        data: {
          selector: ParseValue(value.selector),
          properties: {
            type: "array",
            data: ParseDeclarations(value.children, media),
          },
        },
      },
    },
  ];
}

function InsertFor(
  value: For,
  media: CompilerProperty | undefined
): Array<CompilerLine> {
  return [
    {
      type: "for",
      key: value.key,
      accessor: value.accessor,
      value: { type: "computed", data: value.subject },
      data: [...value.children].flatMap((c) => ParseBlock(c, media)),
    },
  ];
}

function InsertIf(
  value: If,
  media: CompilerProperty | undefined
): Array<CompilerLine> {
  return [
    {
      type: "if",
      check: { type: "computed", data: value.check },
      data: [...value.children].flatMap((c) => ParseBlock(c, media)),
    },
  ];
}

function InsertUse(
  value: Use,
  media: CompilerProperty | undefined
): Array<CompilerLine> {
  return [
    {
      type: "spread-insert",
      data: {
        type: "call",
        args: [{ type: "computed", data: value.subject }],
        definition: {
          type: "function",
          args: value.key,
          data: [...value.children].flatMap((c) => ParseBlock(c, media)),
        },
      },
    },
  ];
}

function ParseBlock(
  item: Block,
  media: CompilerProperty | undefined
): Array<CompilerLine> {
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

  throw new Error("Invalid item type");
}

function BuildBlocks(
  data: Iterable<Block>,
  media: CompilerProperty | undefined,
  args?: string
): CompilerFunction {
  return {
    type: "function",
    args: args ?? "",
    data: [...data].flatMap((block) => ParseBlock(block, media)),
  };
}

export default function Compile(data: string) {
  return BuildFunction(BuildBlocks(CssAst(data), undefined));
}
