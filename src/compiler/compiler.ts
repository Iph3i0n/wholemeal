import { Path, DenoLoader, EsBuild, CustomManifest } from "../deps.ts";
import { Runner } from "../types/runner.js";
import { Project } from "./project.js";
import { OutputTextFile } from "./fs.js";
import Component from "../xml/component.js";
import ReactTypingsTemplate from "./typings/react-template.js";
import PreactTypingsTemplate from "./typings/preact-template.js";
import Template from "./template.js";
import Sheet from "../pss/sheet.js";

export default class Compiler {
  readonly #project: Project;
  readonly #components: Array<Component>;

  constructor(path: string, overrides: Partial<Runner.Project> | undefined) {
    const text = Deno.readTextFileSync(path);
    const p = JSON.parse(text) as Runner.Project;
    this.#project = new Project(path, { ...p, ...overrides });

    this.#components = this.#project.Templates.map((t) => {
      const content = Deno.readTextFileSync(Path.join(this.#project.Cwd, t));
      return new Component(content, this.#project);
    });

    for (const component of this.#components)
      this.#project.Register(component.Metadata.BaseName);
  }

  get Cwd() {
    return this.#project.Cwd;
  }

  get #time() {
    return new Date().toTimeString().split(" ")[0];
  }

  #log(message: string) {
    console.log(`${this.#time}: ${message}`);
  }

  async CreateTypes(out_dir: string, version: string) {
    this.#log(`Preparing types for ${this.#project.Cwd}`);
    const project = this.#project;

    const components = this.#components;

    const vs_code_data = {
      version: 1.1,
      tags: components.map((c) => c.Metadata.VsCodeHtmlData),
      globalAttributes: [],
      valueSets: [
        ...project.Docs.value_sets,
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
          description: project.Description,
          declarations: components.map((c) => c.Metadata.Declaration),
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
          ...project.Package,
          customElements: "./custom-elements.json",
          main: "bundle.min.js",
          version,
          description: project.Description,
        },
        undefined,
        2
      )
    );

    const react_template = new ReactTypingsTemplate(
      this.#components.map((c) => c.Metadata),
      project.Docs
    );
    await OutputTextFile(Path.join(out_dir, "react.js"), react_template.Script);
    await OutputTextFile(
      Path.join(out_dir, "react.d.ts"),
      react_template.Typings
    );

    const preact_template = new PreactTypingsTemplate(
      this.#components.map((c) => c.Metadata),
      project.Docs
    );
    await OutputTextFile(
      Path.join(out_dir, "preact.js"),
      preact_template.Script
    );

    await OutputTextFile(
      Path.join(out_dir, "preact.d.ts"),
      preact_template.Typings
    );
  }

  async Compile(out_dir: string, minify?: boolean) {
    this.#log(`Compiling for ${this.#project.Cwd}`);

    const project = this.#project;

    const result = await EsBuild.build({
      stdin: {
        contents: `
          ${project.Templates.map((t) => `import "${t}"`).join(";")};
          import RenderSheet from "${import.meta.resolve("../runner/css.ts")}";
          import GlobalCss from "${project.GlobalCss}";
          const style = document.createElement("style");
          style.innerHTML = RenderSheet(GlobalCss());
          document.head.append(style);`,
        loader: "ts",
        resolveDir: this.#project.Cwd,
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
              const result = new Template(new Component(data, this.#project))
                .JavaScript;
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
  }
}
