import BaseWriter from "./writer/base.js";

export * as A from "https://deno.land/std@0.165.0/testing/asserts.ts";

export function RunJs(
  data: BaseWriter,
  args: Record<string, unknown> = {},
  imports: Record<string, unknown> = {}
) {
  try {
    return new Function(
      ...Object.keys(args),
      "require",
      "return " + data.toString()
    )(
      ...Object.keys(args).map((a) => args[a]),
      (path: string) => imports[path]
    );
  } catch {
    throw new Error(data.toString() + "\nFailed to compile");
  }
}
