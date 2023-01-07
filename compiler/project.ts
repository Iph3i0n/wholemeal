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

  async Compile(out_dir: string, minify?: boolean) {
    this.#log(`Compiling for ${this.#path}`);

    try {
      const data = await Deno.readTextFile(this.#path);
      const project: Runner.Project = JSON.parse(data);

      this.#log(`Got project information`);
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
                this.#log(`Started ${args.path}`);
                const data = await Deno.readTextFile(args.path);
                const result = new Template(new Component(data)).JavaScript;
                this.#log(`Compiled ${args.path}`);
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
                this.#log(`Started ${args.path}`);
                const data = await Deno.readTextFile(args.path);
                const result = new Sheet(data).JavaScript.toString();
                this.#log(`Compiled ${args.path}`);
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
