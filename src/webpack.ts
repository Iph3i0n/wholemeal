import { urlToRequest } from "loader-utils";
import { validate } from "schema-utils";
import * as Webpack from "webpack";

const schema = {
  type: "object",
  properties: {
    test: {
      type: "string",
    },
  },
};

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
  return `export default ${JSON.stringify(source)}`;
}
