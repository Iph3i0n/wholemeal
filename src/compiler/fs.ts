import { Path } from "../deps.ts";

export async function EnsureDir(path: string) {
  try {
    await Deno.mkdir(Path.dirname(path), { recursive: true });
  } catch {
    // We do not care if the directory already exists
  }
}

export async function EnsureGone(path: string) {
  try {
    await Deno.remove(path, { recursive: true });
  } catch {
    // Ignore
  }
}

export async function OutputTextFile(path: string, data: string) {
  await EnsureDir(path);
  await Deno.writeTextFile(path, data);
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
  for await (const item of Deno.readDir(dir))
    if (item.isDirectory)
      await CopyWithTransform(
        Path.join(dir, item.name),
        Path.join(to, item.name),
        config
      );
    else if (config.should_transform(Path.join(dir, item.name)))
      await OutputTextFile(
        config.path_transform(Path.join(to, item.name)),
        config.content_transform(
          await Deno.readTextFile(Path.join(dir, item.name)),
          Path.join(dir, item.name)
        )
      );
    else
      await OutputTextFile(
        Path.join(to, item.name),
        await Deno.readTextFile(Path.join(dir, item.name))
      );
}
