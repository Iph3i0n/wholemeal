import { Yargs, Yarguments, YargsInstance } from "./deps.ts";
import { Project } from "./compiler/project.ts";

Yargs(Deno.args)
  .command(
    "dev",
    "Run a dev server",
    (yargs: YargsInstance) => yargs,
    async (args: Yarguments) => {
      console.log("Starting the dev project");
      const project = new Project(args.proj || "./project.sd.json");
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
        if (eve.paths.some(is_valid)) {
          await project.Compile(args.out || "./dist", false);
        }
    }
  )
  .command(
    "build",
    "Build the project for production",
    (yargs: YargsInstance) => yargs,
    async (args: Yarguments) => {
      console.log("Building the project for production");
      const project = new Project(args.proj || "./project.sd.json");
      await project.Compile(args.out || "./dist", true);
      await project.CreateTypes(args.out || "./dist", args.version || "0.0.1");
      Deno.exit(0);
    }
  )
  .command(
    "types",
    "Build documentation for your project",
    async (args: Yarguments) => {
      console.log("Generating docs");
      const project = new Project(args.proj || "./project.sd.json");
      await project.CreateTypes(args.out || "./dist", args.version || "0.0.1");
      Deno.exit(0);
    }
  )
  .strictCommands()
  .demandCommand(1)
  .parse();
