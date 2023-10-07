import Path from "path";
import Fs from "fs/promises";

export async function EnsureDir(path: string) {
  try {
    await Fs.mkdir(Path.dirname(path), { recursive: true });
  } catch {
    // We do not care if the directory already exists
  }
}

export async function EnsureGone(path: string) {
  try {
    await Fs.rm(path, { recursive: true });
  } catch {
    // Ignore
  }
}

export async function OutputTextFile(path: string, data: string) {
  await EnsureDir(path);
  await Fs.writeFile(path, data, "utf-8");
}

export async function CopyWithTransform(
  dir: string,
  to: string,
  config: {
    should_transform: (path: string) => boolean;
    path_transform: (path: string) => string;
    content_transform: (data: string, path: string) => string;
  }
) {
  for (const item of await Fs.readdir(dir)) {
    const path = Path.resolve(dir, item);
    const stat = await Fs.stat(path);
    const target = Path.join(to, item);
    if (stat.isDirectory()) await CopyWithTransform(path, target, config);
    else if (config.should_transform(path))
      await OutputTextFile(
        config.path_transform(target),
        config.content_transform(await Fs.readFile(path, "utf-8"), path)
      );
    else await OutputTextFile(target, await Fs.readFile(path, "utf-8"));
  }
}
