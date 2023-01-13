import { Path, DenoLoader, EsBuild } from "../deps.ts";
import Sheet from "../pss/sheet.ts";
import { Runner } from "../types/runner.ts";
import Component from "../xml/component.ts";
import Template from "./template.ts";

export class Project {
  readonly #path: string;

  constructor(path: string) {
    this.#path = Path.resolve(path);
  }

  get Cwd() {
    return Path.dirname(this.#path);
  }

  get #time() {
    return new Date().toTimeString().split(" ")[0];
  }

  #log(message: string) {
    console.log(`${this.#time}: ${message}`);
  }

  async CreateTypes(out_dir: string) {
    this.#log(`Preparing types for ${this.#path}`);
    const project: Runner.Project = JSON.parse(
      await Deno.readTextFile(this.#path)
    );

    const data = {
      version: 1.1,
      tags: await Promise.all(
        project.templates.map(async (t) => {
          const content = await Deno.readTextFile(Path.join(this.Cwd, t));
          const component = new Component(content);
          return component.VsCodeHtmlData;
        })
      ),
      globalAttributes: [],
      valueSets: project.docs.value_sets,
    };

    await Deno.writeTextFile(
      Path.join(out_dir, "bakery.html-data.json"),
      JSON.stringify(data, undefined, 2)
    );
  }

  async Compile(out_dir: string, minify?: boolean) {
    this.#log(`Compiling for ${this.#path}`);

    try {
      const data = await Deno.readTextFile(this.#path);
      const project: Runner.Project = JSON.parse(data);

      const result = await EsBuild.build({
        stdin: {
          contents: `
          ${project.templates.map((t) => `import "${t}"`).join(";")};
          import RenderSheet from "${import.meta.resolve("../runner/css.ts")}";
          import GlobalCss from "${project.global_css}";
          const style = document.createElement("style");
          style.innerHTML = RenderSheet(GlobalCss());
          document.head.append(style);`,
          loader: "ts",
          resolveDir: this.Cwd,
          sourcefile: "main.ts",
        },
        loader: {
          ".ts": "ts",
          ".js": "js",
        },
        platform: "browser",
        minify: minify,
        bundle: true,
        splitting: false,
        outfile: Path.join(out_dir, "bundle.min.js"),
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
                const result = new Template(new Component(data)).JavaScript;
                return {
                  contents: result,
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
                const result = new Sheet(data).JavaScript.toString();
                return {
                  contents: "module.exports = " + result,
                  loader: "js",
                };
              });
            },
          },
          DenoLoader.denoPlugin(),
        ],
      });

      if (result.errors.length) throw result;
      else this.#log("Finished compiling");
    } catch (err) {
      console.error(err);
    }
  }
}
