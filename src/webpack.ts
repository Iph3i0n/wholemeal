import { urlToRequest } from "loader-utils";
import { validate } from "schema-utils";
import * as Webpack from "webpack";
import Component from "./xml/component";
import Template from "./compiler/template";

export default function (this: Webpack.LoaderContext<any>, source: string) {
  const callback = this.async();
  const options = this.getOptions();

  validate(
    {
      type: "object",
      properties: {},
    },
    options,
    {
      name: "Wholemeal Loader",
      baseDataPath: "options",
    }
  );

  const component = new Component(source);
  const template = new Template(component);
  return template.JavaScript;
}
