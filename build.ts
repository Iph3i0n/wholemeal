import { Project } from "./compiler/project.ts";
import { Runner } from "./types/runner.ts";

export default async function Build(
  args: {
    proj?: string;
    out?: string;
    ver: string;
  },
  overrides?: Partial<Runner.Project>
) {
  console.log("Building the project for production");
  const project = new Project(args.proj || "./project.sd.json", overrides);
  await project.Compile(args.out || "./dist", true);
  await project.CreateTypes(args.out || "./dist", args.ver);
}
