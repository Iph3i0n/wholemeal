import { urlToRequest } from "loader-utils";
import { validate } from "schema-utils";
import * as Webpack from "webpack";
import Sheet from "./pss/sheet";

type PssProps = {};

export default function (
  this: Webpack.LoaderContext<PssProps>,
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
      name: "Wholemeal Pss Loader",
      baseDataPath: "options",
    }
  );

  const sheet = new Sheet(source);

  return "module.exports = " + sheet.JavaScript.toString();
}
