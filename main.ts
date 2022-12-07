import { Path, DenoLoader, Yargs, EsBuild } from "./deps.ts";
import Compile from "./compiler/component.ts";
import { Runner } from "./types/runner.ts";

const args = Yargs(Deno.args).parse();

const CWD = args.cwd || ".";
const PROJECT_FILE = args.proj || "project.sd.json";
const OUT_DIR = args.out || "./dist";
const DEV = Boolean(args.dev);

async function Main() {
  try {
    const project_file = Path.resolve(Path.join(CWD, PROJECT_FILE));
    console.log(`Compiling for ${project_file}`);
    const data = await Deno.readTextFile(project_file);
    const project: Runner.Project = JSON.parse(data);
    const global = await Deno.readTextFile(Path.join(CWD, project.global_css));

    const result = await EsBuild.build({
      stdin: {
        contents: `
          ${project.templates
            .map((t) => `import "${Path.resolve(Path.join(CWD, t))}"`)
            .join(";")}
          const style = document.createElement("style");
          style.innerHTML = \`${global}\`;
          document.head.append(style);`,
        loader: "ts",
      },
      loader: {
        ".ts": "ts",
        ".js": "js",
      },
      platform: "browser",
      minify: !DEV,
      bundle: true,
      splitting: false,
      outfile: Path.join(OUT_DIR, "bundle.min.js"),
      plugins: [
        {
          name: "st-dough",
          setup: (build) => {
            build.onResolve({ filter: /\.std$/ }, (args) => ({
              path: args.path,
            }));

            build.onLoad({ filter: /\.std$/ }, async (args) => {
              const data = await Deno.readTextFile(args.path);
              return {
                contents: Compile(data),
                loader: "js",
              };
            });
          },
        },
        // deno-lint-ignore no-explicit-any
        DenoLoader.denoPlugin() as any,
      ],
    });

    if (result.errors.length) throw result;
  } catch (err) {
    console.error(err);
  }
}

await Main();
if (DEV) {
  console.log("Listening for changes in " + CWD);
  for await (const eve of Deno.watchFs(CWD))
    if (eve.paths.some((p) => p.endsWith(".std"))) await Main();
} else {
  Deno.exit(0);
}
