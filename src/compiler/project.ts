import { Path } from "../deps.ts";
import { Runner } from "../types/runner.js";

export class Project {
  readonly #path: string;
  readonly #data: Runner.Project;

  constructor(path: string, data: Runner.Project) {
    this.#path = path;
    this.#data = data;
  }

  get Cwd() {
    return Path.dirname(this.#path);
  }

  get Templates() {
    return this.#data.templates;
  }

  get Docs() {
    return this.#data.docs;
  }

  get Description() {
    return this.#data.description;
  }

  get Package() {
    return this.#data.package;
  }

  get GlobalCss() {
    return this.#data.global_css;
  }

  #tag_name_map: Array<[string, string]> = [];

  Register(tag_name: string) {
    this.#tag_name_map.push([tag_name, this.GetTagName(tag_name)]);
  }

  MapTagName(name: string) {
    const target = this.#tag_name_map.find((t) => t[0] === name);
    if (!target) return name;
    return target[1];
  }

  GetTagName(name: string) {
    const namespace = this.#data.namespace;
    if (namespace) return namespace + "-" + name;

    return name;
  }
}
