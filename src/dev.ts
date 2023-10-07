import Compiler from "./compiler/compiler.js";
import { Runner } from "./types/runner.js";

export default async function Dev(
  args: { proj?: string; out?: string },
  overrides?: Partial<Runner.Project>
) {
  console.log("Starting the dev project");
  try {
    const project = new Compiler(args.proj || "./project.sd.json", overrides);
    await project.Compile(args.out || "./dist", false);

    console.log("Listening for changes in " + project.Cwd);

    const should_like: Array<(p: string) => boolean> = [
      (p) => p.endsWith(".std"),
      (p) => p.endsWith(".js") && !p.endsWith("bundle.min.js"),
      (p) => p.endsWith(".ts"),
      (p) => p.endsWith(".pss"),
      (p) => p.endsWith(".json") && !p.endsWith("bakery.html-data.json"),
    ];

    const is_valid = (p: string) => should_like.some((l) => l(p));
    for await (const eve of Deno.watchFs(project.Cwd))
      if (eve.paths.some(is_valid))
        try {
          const project = new Compiler(
            args.proj || "./project.sd.json",
            overrides
          );
          await project.Compile(args.out || "./dist", false);
        } catch (err) {
          console.error(err);
        }
  } catch (err) {
    console.error(err);
  }
}
