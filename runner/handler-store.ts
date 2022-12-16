// deno-lint-ignore-file no-explicit-any
export default class HandlerStore {
  static #element_key = "__HANDLER_STORE__";
  #handlers: Array<[string, (e: Event) => void]> = [];
  #target: HTMLElement | undefined;

  static GetFor(target: HTMLElement) {
    return HandlerStore.#get_store(target);
  }

  #set_self(target: any) {
    if (!target) return;
    target[HandlerStore.#element_key] = this;
  }

  #remove_self(target: any) {
    delete target[HandlerStore.#element_key];
  }

  static #get_store(target: any): HandlerStore | undefined {
    return target[HandlerStore.#element_key];
  }

  constructor(target: HTMLElement) {
    this.#target = target;
    this.#set_self(target);
  }

  add(key: string, handler: (e: Event) => void) {
    console.log(`Adding ${key} to ${this.#target?.tagName}`);
    this.#target?.addEventListener(key, handler);
    this.#handlers.push([key, handler]);
  }

  clear() {
    for (const [key, handler] of this.#handlers)
      this.#target?.removeEventListener(key, handler);
    this.#remove_self(this.#target);
    this.#target = undefined;
  }

  move_to(target: HTMLElement) {
    const existing = HandlerStore.#get_store(target);
    existing?.clear();
    console.log(
      `Adding ${this.#handlers.length} handlers to ${target.tagName}`
    );
    for (const [key, handler] of this.#handlers)
      target.addEventListener(key, handler);

    this.#set_self(target);
    this.#target = target;
  }
}
