import { Path, DenoLoader, EsBuild, CustomManifest } from "../deps.ts";
import Sheet from "../pss/sheet.ts";
import { Runner } from "../types/runner.ts";
import Component from "../xml/component.ts";
import { OutputTextFile } from "./fs.ts";
import ReactTypingsTemplate from "./typings/react-template.ts";
import PreactTypingsTemplate from "./typings/preact-template.ts";
import Template from "./template.ts";

export class Project {
  readonly #path: string;
  readonly #overrides: Partial<Runner.Project> | undefined;

  constructor(path: string, overrides: Partial<Runner.Project> | undefined) {
    this.#path = Path.resolve(path);
    this.#overrides = overrides;
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

  get #project() {
    return Deno.readTextFile(this.#path)
      .then((text) => JSON.parse(text) as Runner.Project)
      .then((p) => ({ ...p, ...this.#overrides }));
  }

  async CreateTypes(out_dir: string, version: string) {
    this.#log(`Preparing types for ${this.#path}`);
    const project = await this.#project;

    const components = await Promise.all(
      project.templates.map(async (t) => {
        const content = await Deno.readTextFile(Path.join(this.Cwd, t));
        return new Component(content, project.namespace ?? "").Metadata;
      })
    );

    const vs_code_data = {
      version: 1.1,
      tags: components.map((c) => c.VsCodeHtmlData),
      globalAttributes: [],
      valueSets: [
        ...project.docs.value_sets,
        {
          name: "boolean",
          values: [
            {
              name: "",
              description: "true",
            },
          ],
        },
      ],
    };

    await OutputTextFile(
      Path.join(out_dir, "bakery.html-data.json"),
      JSON.stringify(vs_code_data, undefined, 2)
    );

    const package_data: CustomManifest.Package = {
      schemaVersion: "1.0.0",
      modules: [
        {
          kind: "javascript-module",
          path: "bundle.min.js",
          description: project.description,
          declarations: components.map((c) => c.Declaration),
        },
      ],
    };

    await OutputTextFile(
      Path.join(out_dir, "custom-elements.json"),
      JSON.stringify(package_data, undefined, 2)
    );

    await Deno.writeTextFile(
      Path.join(out_dir, "package.json"),
      JSON.stringify(
        {
          ...project.package,
          customElements: "./custom-elements.json",
          main: "bundle.min.js",
          version,
          description: project.description,
        },
        undefined,
        2
      )
    );

    await OutputTextFile(
      Path.join(out_dir, "typescript", "react.ts"),
      new ReactTypingsTemplate(components, project.docs).Script
    );

    await OutputTextFile(
      Path.join(out_dir, "typescript", "preact.ts"),
      new PreactTypingsTemplate(components, project.docs).Script
    );
  }

  async Compile(out_dir: string, minify?: boolean) {
    this.#log(`Compiling for ${this.#path}`);

    try {
      const project = await this.#project;

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
                const result = new Template(
                  new Component(data, project.namespace ?? "")
                ).JavaScript;
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
