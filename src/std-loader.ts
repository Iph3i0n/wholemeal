import * as Webpack from "webpack";
import Component from "./xml/component";
import Template from "./compiler/template";
import ReactTypingsTemplate from "./compiler/typings/react-template";
import PreactTypingsTemplate from "./compiler/typings/preact-template";

type StdProps = {
  framework?: string;
};

export default function (
  this: Webpack.LoaderContext<StdProps>,
  source: string
) {
  const options = this.getOptions();

  const component = new Component(source);
  const template = new Template(component);
  let result = template.JavaScript;

  if (options.framework === "react") {
    const react_template = new ReactTypingsTemplate(component.Metadata, {
      value_sets: [],
    });
    result += "\n" + react_template.Script;
  }

  if (options.framework === "preact") {
    const react_template = new PreactTypingsTemplate(component.Metadata, {
      value_sets: [],
    });
    result += "\n" + react_template.Script;
  }

  return result;
}
