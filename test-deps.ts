import BaseWriter from "./writer/base.ts";

export * as A from "https://deno.land/std@0.165.0/testing/asserts.ts";

export function RunJs(data: BaseWriter, ctx?: unknown) {
  try {
    return new Function("ctx", "return " + data.toString())(ctx);
  } catch {
    throw new Error(data.toString() + "\nFailed to compile");
  }
}
