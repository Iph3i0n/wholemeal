import { urlToRequest } from "loader-utils";
import { validate } from "schema-utils";
import * as Webpack from "webpack";
import Component from "./xml/component";
import Template from "./compiler/template";

type StdProps = {};

export default function (
  this: Webpack.LoaderContext<StdProps>,
  source: string
) {
  const options = this.getOptions();

  validate(
    {
      type: "object",
      properties: {},
    },
    options,
    {
      name: "Wholemeal Std Loader",
      baseDataPath: "options",
    }
  );

  const component = new Component(source);
  const template = new Template(component);
  return template.JavaScript;
}
