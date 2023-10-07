import Component from "../xml/component";
import type { Package } from "custom-elements-manifest";

export default function CreateManifest(
  description: string,
  location: string,
  components: Array<Component>
): Package {
  return {
    schemaVersion: "1.0.0",
    modules: [
      {
        kind: "javascript-module",
        path: location,
        description,
        declarations: components.map((c) => c.Metadata.Declaration),
      },
    ],
  };
}
