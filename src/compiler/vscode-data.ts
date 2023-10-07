import Component from "../xml/component";
import { Runner } from "../types/runner";

export default function CreateVsCodeData(
  components: Array<Component>,
  value_sets: Runner.ValueSets
) {
  return {
    version: 1.1,
    tags: components.map((c) => c.Metadata.VsCodeHtmlData),
    globalAttributes: [],
    valueSets: [
      ...value_sets,
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
}
