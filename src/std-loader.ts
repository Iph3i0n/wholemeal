import * as Webpack from "webpack";
import Component from "./xml/component";
import Template from "./compiler/template";
import ReactTypingsTemplate from "./compiler/typings/react-template";
import PreactTypingsTemplate from "./compiler/typings/preact-template";
import {
  Assert,
  IsBoolean,
  IsLiteral,
  IsObject,
  IsOneOf,
  IsString,
  Optional,
  PatternMatch,
} from "@ipheion/safe-type";
import TypingsTemplate from "./compiler/typings/template";
import Fs from "fs";
import Path from "path";
import Json from "comment-json";

const IsProps = IsObject({
  framework: Optional(IsOneOf("native", "react", "preact")),
  typings: Optional(IsBoolean),
});

function ReadJson(this: Webpack.LoaderContext<unknown>, path: string): any {
  try {
    this.addBuildDependency(path);
    const package_text = Fs.readFileSync(path, "utf-8");
    return Json.parse(package_text);
  } catch {
    return undefined;
  }
}

export default function (this: Webpack.LoaderContext<unknown>, source: string) {
  const read_json = ReadJson.bind(this);
  const options = this.getOptions() ?? {};
  Assert(IsProps, options);

  const component = new Component(source);
  const template = new Template(component);

  if (!this.resourceQuery) {
    return `import ComponentWrapper from "${Path.resolve(
      __dirname,
      "runner",
      "component-wrapper"
    )}";

export default class ${
      component.Metadata.FunctionName
    }Element extends ComponentWrapper {
  
  Initialiser(self) {
    return import("${
      this.resourcePath
    }?actual=true").then(r => new r.default(self));
  }
}

customElements.define("${component.Metadata.Name}", ${
      component.Metadata.FunctionName
    }Element);`;
  }

  let result = template.JavaScript;

  const package_json = read_json("./package.json");
  const extra_types = package_json.wholemeal;

  // const meta_template = PatternMatch(
  //   IsLiteral("native"),
  //   IsLiteral("react"),
  //   IsLiteral("preact")
  // )(
  //   () => new TypingsTemplate(component.Metadata, extra_types),
  //   () => new ReactTypingsTemplate(component.Metadata, extra_types),
  //   () => new PreactTypingsTemplate(component.Metadata, extra_types)
  // )(options.framework ?? "native");

  // result += "\n" + meta_template.Script;

  // if (options.typings) {
  //   const ts_config = read_json("./tsconfig.json");
  //   const root: string =
  //     ts_config?.compilerOptions?.rootDir ?? this.rootContext;
  //   const target = Path.relative(root, this.resourcePath) + ".d.ts";
  //   this.emitFile(target, meta_template.Typings);
  // }

  return result;
}
