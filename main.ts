import Build from "./build.ts";
import { Yargs, Yarguments, YargsInstance } from "./deps.ts";
import Dev from "./dev.ts";

Yargs(Deno.args)
  .command(
    "dev",
    "Run a dev server",
    (yargs: YargsInstance) => yargs,
    async (args: Yarguments) => {
      // deno-lint-ignore no-explicit-any
      await Dev(args as any);
    }
  )
  .command(
    "build",
    "Build the project for production",
    (yargs: YargsInstance) => yargs,
    async (args: Yarguments) => {
      // deno-lint-ignore no-explicit-any
      await Build(args as any);
      Deno.exit(0);
    }
  )
  .strictCommands()
  .demandCommand(1)
  .parse();
