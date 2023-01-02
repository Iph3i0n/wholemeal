import { Path, DenoLoader, Yargs, EsBuild } from "./deps.ts";
import Compile from "./compiler/component.ts";
import { Runner } from "./types/runner.ts";
import Sheet from "./pss/sheet.ts";

const args = Yargs(Deno.args).parse();

const CWD = args.cwd || ".";
const PROJECT_FILE = args.proj || "project.sd.json";
const OUT_DIR = args.out || "./dist";
const DEV = Boolean(args.dev);

function import_path(p: string) {
  return Path.resolve(Path.join(CWD, p));
}

async function Main() {
  try {
    const project_file = import_path(PROJECT_FILE);
    console.log(
      `${
        new Date().toTimeString().split(" ")[0]
      }: Compiling for ${project_file}`
    );
    const data = await Deno.readTextFile(project_file);
    const project: Runner.Project = JSON.parse(data);

    const result = await EsBuild.build({
      stdin: {
        contents: `
          ${project.templates.map((t) => `import "${t}"`).join(";")};
          import RenderSheet from "${import.meta.resolve("./runner/css.ts")}";
          import GlobalCss from "${project.global_css}";
          const style = document.createElement("style");
          style.innerHTML = RenderSheet(GlobalCss());
          document.head.append(style);`,
        loader: "ts",
        resolveDir: Path.resolve(CWD),
        sourcefile: "main.ts",
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
            build.onResolve({ filter: /\.std$/ }, (args) => {
              if (args.path.startsWith("/")) return { path: args.path };
              return {
                path: Path.join(args.resolveDir, args.path),
              };
            });

            build.onLoad({ filter: /\.std$/ }, async (args) => {
              const data = await Deno.readTextFile(args.path);
              return {
                contents: Compile(data),
                loader: "js",
              };
            });
          },
        },
        {
          name: "css-dough",
          setup: (build) => {
            build.onResolve({ filter: /\.pss$/ }, (args) => {
              if (args.path.startsWith("/")) return { path: args.path };
              return {
                path: Path.join(args.resolveDir, args.path),
              };
            });

            build.onLoad({ filter: /\.pss$/ }, async (args) => {
              const data = await Deno.readTextFile(args.path);
              return {
                contents:
                  "module.exports = " + new Sheet(data).JavaScript.toString(),
                loader: "js",
              };
            });
          },
        },
        DenoLoader.denoPlugin(),
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

  const should_like: Array<(p: string) => boolean> = [
    (p) => p.endsWith(".std"),
    (p) => p.endsWith(".js") && !p.endsWith("bundle.min.js"),
    (p) => p.endsWith(".ts"),
    (p) => p.endsWith(".pss"),
    (p) => p.endsWith(".json"),
  ];

  const is_valid = (p: string) => should_like.some((l) => l(p));
  for await (const eve of Deno.watchFs(CWD))
    if (eve.paths.some(is_valid)) await Main();
} else {
  Deno.exit(0);
}
