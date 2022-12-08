import { Ast } from "../types/ast.ts";

export default function RenderSheet(sheet: Ast.Css.Sheet) {
  function RenderRule(rule: Ast.Css.Rule) {
    const queries = rule.properties.reduce(
      (c, [type, value, media]) => ({
        ...c,
        [media ?? ""]: [
          ...(c[media ?? ""] ?? []),
          [type, value] as [string, string],
        ],
      }),
      {} as Record<string, Array<[string, string]>>
    );

    const result = [];
    if (queries[""])
      result.push(
        `${rule.selector}{${queries[""].map((q) => q.join(":")).join(";")}}`
      );
    delete queries[""];
    for (const key in queries)
      result.push(
        `@media ${key}{${rule.selector}{${queries[key]
          .map((q) => q.join(":"))
          .join(";")}}}`
      );

    return result.join("\n");
  }

  function RenderAtBlock(block: Ast.Css.AtBlock) {
    return `@${block.variant} ${block.query} { ${RenderSheet(
      block.children
    )} }`;
  }

  function RenderAtStatement(at: Ast.Css.AtStatement) {
    return `@${at.rule} ${at.statement};`;
  }

  let result = "";
  for (const block of sheet)
    if (!block) continue;
    else if ("rule" in block) result += RenderAtStatement(block);
    else if ("variant" in block) result += RenderAtBlock(block);
    else result += RenderRule(block);

  return result;
}
