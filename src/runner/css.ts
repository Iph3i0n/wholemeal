import { Ast } from "../types/ast";

function IsProperty(
  data: Ast.Css.Property | Ast.Css.PropertyBlock
): data is Ast.Css.Property {
  return Array.isArray(data);
}

export default function RenderSheet(sheet: Ast.Css.Sheet) {
  function RenderRule(rule: Ast.Css.Rule) {
    const queries = rule.properties.reduce((c, v) => {
      if (IsProperty(v)) {
        const [type, value, media] = v;
        return {
          ...c,
          [media ?? ""]: [
            ...(c[media ?? ""] ?? []),
            [type, value] as [string, string],
          ],
        };
      }

      let result = c;
      for (const [type, value, media] of v.properties) {
        const med = v.media
          ? `${v.media?.toString() ?? ""} and ${media}`
          : media ?? "";
        result = {
          ...result,
          [med]: [...(result[med] ?? []), [type, value] as [string, string]],
        };
      }

      return result;
    }, {} as Record<string, Array<[string, string]>>);

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
    return `${at.rule} ${at.statement};`;
  }

  let result = "";
  for (const block of sheet)
    if (!block) continue;
    else if ("rule" in block) result += RenderAtStatement(block);
    else if ("variant" in block) result += RenderAtBlock(block);
    else result += RenderRule(block);

  return result;
}
